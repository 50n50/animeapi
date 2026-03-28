import { fetchPage } from "../utils/http.ts";
import { parseAItem } from "../parsers/anime-item.ts";
import * as cheerio from "cheerio";

const BASE = "https://anikai.to";

function extractTrendingList($: cheerio.CheerioAPI, id: string) {
  const items: any[] = [];
  $(`#trending-anime .tab-body[data-id="${id}"] .aitem`).each((_: any, el: any) => {
    items.push(parseAItem($, el));
  });
  return items;
}

export async function getHome() {
  const html = await fetchPage(`${BASE}/home`);
  const $ = cheerio.load(html);

  const featured: any[] = [];
  $("#featured .swiper-slide").each((_: any, el: any) => {
    const style = $(el).attr("style") || "";
    const bgMatch = style.match(/url\((.*?)\)/);
    const image = bgMatch ? bgMatch[1] : "";

    const detail = $(el).find(".detail");
    const title = detail.find(".title").text().trim();
    const jpTitle = detail.find(".title").attr("data-jp") || "";
    const desc = detail.find(".desc").text().trim();

    const subText = detail.find(".info .sub").text().trim();
    const dubText = detail.find(".info .dub").text().trim();
    const type = detail.find(".info span b").first().text().trim();
    const genres = detail.find(".info span").last().text().trim();

    let rating = "";
    let release = "";
    let quality = "";
    detail.find(".mics > div").each((_: any, micEl: any) => {
      const label = $(micEl).find("div").text().trim();
      const val = $(micEl).find("span").text().trim();
      if (label === "Rating") rating = val;
      if (label === "Release") release = val;
      if (label === "Quality") quality = val;
    });

    const link = $(el).find(".swiper-ctrl a.watch-btn").attr("href") || "";

    featured.push({
      title, jpTitle, image, desc, link,
      sub: parseInt(subText, 10) || 0,
      dub: parseInt(dubText, 10) || 0,
      type, genres, rating, release, quality
    });
  });

  const latestUpdates: any[] = [];
  $(".tab-body .aitem-wrapper.regular > .aitem").each((_: any, el: any) => {
    latestUpdates.push(parseAItem($, el));
  });

  const newReleases: any[] = [];
  const upcoming: any[] = [];
  const completed: any[] = [];

  $(".alist-group section.swiper-slide").each((_: any, sec: any) => {
    const secTitle = $(sec).find(".stitle").text().trim();
    const items: any[] = [];
    $(sec).find(".aitem").each((_: any, el: any) => {
      items.push(parseAItem($, el));
    });

    if (secTitle === "New Releases") newReleases.push(...items);
    else if (secTitle === "Upcoming") upcoming.push(...items);
    else if (secTitle === "Completed") completed.push(...items);
  });

  const trending = {
    now: extractTrendingList($, "trending"),
    day: extractTrendingList($, "day"),
    week: extractTrendingList($, "week"),
    month: extractTrendingList($, "month"),
  };

  return { featured, trending, latestUpdates, newReleases, upcoming, completed };
}

export async function getTrending(period?: string) {
  const html = await fetchPage(`${BASE}/home`);
  const $ = cheerio.load(html);

  const data: Record<string, any[]> = {
    now: extractTrendingList($, "trending"),
    day: extractTrendingList($, "day"),
    week: extractTrendingList($, "week"),
    month: extractTrendingList($, "month"),
  };

  if (period && data[period]) return data[period];
  return data;
}
