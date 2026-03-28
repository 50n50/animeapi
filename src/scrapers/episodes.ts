import { fetchPage } from "../utils/http.ts";
import { encrypt } from "../utils/crypto.ts";
import * as cheerio from "cheerio";

const BASE = "https://anikai.to";

export async function getAnimeEpisodes(id: string) {
  const html = await fetchPage(`${BASE}/watch/${id}`);
  const $ = cheerio.load(html);

  const animeId = $(".rate-box").attr("data-id");
  if (!animeId) return [{ error: "AniID not found" }];

  const token = await encrypt(animeId);

  const episodeListUrl = `${BASE}/ajax/episodes/list?ani_id=${animeId}&_=${token}`;
  const episodeListResponse = await fetch(episodeListUrl, { signal: AbortSignal.timeout(10000) });
  const episodeListData = await episodeListResponse.json();

  const episodeHtml = episodeListData.result || "";
  const $ep = cheerio.load(episodeHtml);

  const episodes: any[] = [];
  $ep("a[num][token]").each((_: any, el: any) => {
    const episodeNum = $ep(el).attr("num");
    const episodeToken = $ep(el).attr("token");
    const isFiller = $ep(el).hasClass("filler");
    const langs = parseInt($ep(el).attr("langs") || "0", 10);
    const titleSpan = $ep(el).find("span");
    const epTitle = titleSpan.text().trim();
    const jpTitle = titleSpan.attr("data-jp") || "";

    if (episodeNum && episodeToken) {
      episodes.push({
        number: parseInt(episodeNum, 10),
        token: episodeToken,
        title: epTitle,
        jpTitle,
        isFiller,
        langs
      });
    }
  });

  return episodes;
}
