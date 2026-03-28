import { fetchJSON } from "../utils/http.ts";
import * as cheerio from "cheerio";

const BASE = "https://anikai.to";

export async function getSchedule(timeStr?: string, tzStr: string = "+00:00") {
  let timestamp: number;

  if (timeStr) {
    if (!isNaN(Number(timeStr))) {
      timestamp = Number(timeStr);
      if (timestamp > 9999999999) {
        timestamp = Math.floor(timestamp / 1000);
      }
    } else {
      const d = Date.parse(timeStr);
      if (isNaN(d)) {
        throw new Error("Invalid time format. Use a valid date string or timestamp.");
      }
      timestamp = Math.floor(d / 1000);
    }
  } else {
    timestamp = Math.floor(Date.now() / 1000);
  }

  const tz = encodeURIComponent(tzStr);
  const url = `${BASE}/ajax/schedule/items?tz=${tz}&time=${timestamp}`;

  const response = await fetchJSON(url);

  if (!response || !response.result) {
    return [];
  }

  const $ = cheerio.load(response.result);
  const results: any[] = [];

  $("li a").each((_: any, el: any) => {
    const time = $(el).find(".time").text().trim();
    const titleEl = $(el).find(".title");
    const title = titleEl.text().trim();
    const jpTitle = titleEl.attr("data-jp") || "";

    const episodeText = $(el).children("span").not(".time").not(".title").text().trim();

    const link = $(el).attr("href") || "";
    const id = link.split("/").pop() || "";

    if (title) {
      results.push({
        id,
        time,
        title,
        jpTitle,
        episode: episodeText,
        link
      });
    }
  });

  return results;
}
