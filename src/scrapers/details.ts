import { fetchPage, fetchWithRedirect } from "../utils/http.ts";
import { parseAItem } from "../parsers/anime-item.ts";
import * as cheerio from "cheerio";

const BASE = "https://anikai.to";

export async function getAnimeDetails(id: string) {
  const html = await fetchPage(`${BASE}/watch/${id}`);
  const $ = cheerio.load(html);

  const entity = $("#main-entity");

  const title = entity.find("h1.title").text().trim();
  const jpTitle = entity.find("h1.title").attr("data-jp") || "";
  const altTitle = entity.find(".al-title").text().trim();

  const rating = entity.find(".info .rating").text().trim();
  const subText = entity.find(".info .sub").text().trim();
  const dubText = entity.find(".info .dub").text().trim();
  const sub = subText === "Preview" ? "Preview" : (parseInt(subText, 10) || 0);
  const dub = parseInt(dubText, 10) || 0;

  const typePieces: string[] = [];
  entity.find(".info span:not(.rating):not(.sub):not(.dub) b").each((_: any, span: any) => {
    typePieces.push($(span).text().trim());
  });
  const type = typePieces.length > 0 ? typePieces[0] : "";

  const desc = entity.find(".desc").text().trim();

  const details: Record<string, any> = {};

  entity.find(".detail > div > div").each((_: any, div: any) => {
    const el = $(div);
    const textNode = el.contents().filter((_: any, node: any) => node.type === "text").first();
    const labelRaw = textNode.length ? textNode.text().trim() : "";
    const label = labelRaw.replace(":", "").trim().toLowerCase().replace(/\s+/g, "_");

    if (label) {
      if (label === "genres" || label === "studios" || label === "producers" || label === "links" || label === "country") {
        const arr: { name: string; url: string }[] = [];
        el.find("span a").each((_: any, a: any) => {
          arr.push({
            name: $(a).text().trim(),
            url: $(a).attr("href") || ""
          });
        });
        if (label === "country" && arr.length > 0) {
          details[label] = arr[0];
        } else {
          details[label] = arr;
        }
      } else {
        const fullText = el.text().trim();
        const valText = fullText.substring(labelRaw.length).trim();
        details[label] = valText;
      }
    }
  });

  const rateBox = $("#anime-rating");
  const score = parseFloat(rateBox.find(".value").text().trim()) || 0;
  const reviewText = rateBox.find("span").eq(1).text().trim();
  let reviews = 0;
  const reviewMatch = reviewText.match(/by ([\d,]+) reviews/i) || reviewText.match(/by ([\d,]+) users/i);
  if (reviewMatch) {
    reviews = parseInt(reviewMatch[1].replace(/,/g, ""), 10);
  }

  const relations: any[] = [];
  const relationLabels: Record<string, string> = {};
  $("#related-anime .dropdown-menu .dropdown-item").each((_: any, el: any) => {
    relationLabels[$(el).attr("data-id") || ""] = $(el).text().trim();
  });

  $("#related-anime .tab-body").each((_: any, el: any) => {
    const relId = $(el).attr("data-id") || "";
    const label = relationLabels[relId] || "Related";
    $(el).find(".aitem").each((_: any, aitem: any) => {
      const parsed = parseAItem($, aitem);
      relations.push({ ...parsed, relation: label });
    });
  });

  const recommended: any[] = [];
  $(".sidebar-section").each((_: any, sec: any) => {
    if ($(sec).find(".stitle").text().trim() === "Recommended") {
      $(sec).find(".aitem").each((_: any, aitem: any) => {
        recommended.push(parseAItem($, aitem));
      });
    }
  });

  let syncData: any = {};
  try {
    const rawSync = $("#syncData").text().trim();
    if (rawSync) syncData = JSON.parse(rawSync);
  } catch {}

  return {
    id, title, jpTitle, altTitle,
    aniId: syncData.anime_id || null,
    malId: syncData.mal_id || null,
    alId: syncData.al_id || null,
    rating, sub, dub, type, desc, details,
    score, reviews, relations, recommended
  };
}

export async function getRandomAnime() {
  const response = await fetchWithRedirect(`${BASE}/random`);
  const id = response.url.split("/watch/").pop();
  if (!id) throw new Error("Failed to resolve random anime ID");
  return getAnimeDetails(id);
}
