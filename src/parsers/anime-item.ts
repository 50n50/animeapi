import * as cheerio from "cheerio";

export function parseAItem($: cheerio.CheerioAPI, el: any) {
  const isAnchorObject = $(el).is("a.aitem");
  const titleEl = $(el).find(".title");
  const title = titleEl.text().trim() || $(el).attr("title") || "";
  const jpTitle = titleEl.attr("data-jp") || "";

  const link = isAnchorObject ? $(el).attr("href") || "" : $(el).find("a.poster").attr("href") || "";
  const posterEl = isAnchorObject ? $(el).find(".poster") : $(el).find("a.poster");

  let image = posterEl.find("img.lazyload").attr("data-src") || "";
  if (!image) {
    const style = $(el).attr("style") || "";
    const bgMatch = style.match(/background-image:\s*url\((.*?)\)/);
    if (bgMatch) image = bgMatch[1].replace(/['"]/g, "");
  }

  const tooltipId = posterEl.attr("data-tip") || $(el).find(".ttip-btn").attr("data-tip") || "";

  const subText = $(el).find(".sub").text().trim();
  const dubText = $(el).find(".dub").text().trim();

  const infoPieces: string[] = [];
  $(el).find(".info span:not(.sub):not(.dub)").each((_: any, span: any) => {
    const text = $(span).find("b").text().trim() || $(span).text().trim();
    if (text) infoPieces.push(text);
  });

  let episodes = 0;
  let type = "";

  if (infoPieces.length === 1) {
    type = infoPieces[0];
  } else if (infoPieces.length >= 2) {
    const parsedEp = parseInt(infoPieces[0], 10);
    if (!isNaN(parsedEp)) episodes = parsedEp;
    type = infoPieces[1];
  }

  const result: any = {
    title, jpTitle, link, image, tooltipId,
    sub: subText === "Preview" ? "Preview" : (parseInt(subText, 10) || 0),
    dub: parseInt(dubText, 10) || 0,
    episodes, type
  };

  const numText = $(el).find(".num").text().trim();
  if (numText) result.rank = parseInt(numText, 10);

  return result;
}

export function parseAnimeList(html: string) {
  const $ = cheerio.load(html);
  const results: any[] = [];
  $(".aitem").each((_: any, el: any) => {
    results.push(parseAItem($, el));
  });

  const pagination = $(".pagination");
  let currentPage = 1;
  let hasNextPage = false;
  let totalPages = 1;

  if (pagination.length > 0) {
    const activeText = pagination.find(".page-item.active").text().trim();
    currentPage = parseInt(activeText, 10) || 1;
    const lastLink = pagination.find("a[rel='last']").attr("href");
    if (lastLink) {
      const match = lastLink.match(/page=(\d+)/);
      if (match) totalPages = parseInt(match[1], 10);
    } else {
      const pageLinks = pagination.find(".page-link").map((_: any, el: any) => parseInt($(el).text().trim(), 10)).get().filter((n: any) => !isNaN(n));
      if (pageLinks.length > 0) totalPages = Math.max(...pageLinks);
    }
    hasNextPage = pagination.find("a[rel='next']").length > 0;
  }

  return { results, pagination: { currentPage, hasNextPage, totalPages } };
}
