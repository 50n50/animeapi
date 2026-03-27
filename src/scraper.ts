import * as cheerio from "cheerio";

function parseAItem($: cheerio.CheerioAPI, el: any) {
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
  $(el).find(".info span:not(.sub):not(.dub)").each((_, span) => {
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

function parseAnimeList(html: string) {
  const $ = cheerio.load(html);
  const results: any[] = [];
  $(".aitem").each((_, el) => {
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
      const pageLinks = pagination.find(".page-link").map((_, el) => parseInt($(el).text().trim(), 10)).get().filter(n => !isNaN(n));
      if (pageLinks.length > 0) totalPages = Math.max(...pageLinks);
    }
    hasNextPage = pagination.find("a[rel='next']").length > 0;
  }

  return { results, pagination: { currentPage, hasNextPage, totalPages } };
}

export async function searchAnime(queryString: string = "") {
  const url = `https://anikai.to/browser${queryString}`;
  const response = await fetch(url);
  const html = await response.text();
  return parseAnimeList(html);
}

export async function getAnimeByGenre(genre: string, queryString: string = "") {
  const url = `https://anikai.to/genres/${genre}${queryString}`;
  const response = await fetch(url);
  const html = await response.text();
  return parseAnimeList(html);
}

export async function getGenres() {
  const response = await fetch("https://anikai.to/home");
  const html = await response.text();
  const $ = cheerio.load(html);
  const genres: { name: string; href: string }[] = [];
  $("#menu ul.c4 li a").each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (name && href) genres.push({ name, href });
  });
  return genres;
}

export async function getAnimeByType(type: string, queryString: string = "") {
  const url = `https://anikai.to/${type}${queryString}`;
  const response = await fetch(url);
  const html = await response.text();
  return parseAnimeList(html);
}

export async function getTypes() {
  const response = await fetch("https://anikai.to/home");
  const html = await response.text();
  const $ = cheerio.load(html);
  const types: { name: string; href: string }[] = [];
  $("#menu ul.c1 li a").each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (name && href) types.push({ name, href });
  });
  return types;
}

export async function getAnimeListByEndpoint(endpoint: string, queryString: string = "") {
  const url = `https://anikai.to/${endpoint}${queryString}`;
  const response = await fetch(url);
  const html = await response.text();
  return parseAnimeList(html);
}

export async function getAZList(letter?: string, queryString: string = "") {
  const path = letter ? `az-list/${letter}` : "az-list";
  const url = `https://anikai.to/${path}${queryString}`;
  const response = await fetch(url);
  const html = await response.text();
  return parseAnimeList(html);
}

export async function getTrending(period?: string) {
  const response = await fetch("https://anikai.to/home");
  const html = await response.text();
  const $ = cheerio.load(html);

  const extractList = (id: string) => {
    const items: any[] = [];
    $(`#trending-anime .tab-body[data-id="${id}"] .aitem`).each((_, el) => {
      items.push(parseAItem($, el));
    });
    return items;
  };

  const data: Record<string, any[]> = {
    now: extractList("trending"),
    day: extractList("day"),
    week: extractList("week"),
    month: extractList("month"),
  };

  if (period && data[period]) return data[period];
  return data;
}

export async function getHome() {
  const response = await fetch("https://anikai.to/home");
  const html = await response.text();
  const $ = cheerio.load(html);

  const featured: any[] = [];
  $("#featured .swiper-slide").each((_, el) => {
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
    detail.find(".mics > div").each((_, micEl) => {
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
  $(".tab-body .aitem-wrapper.regular > .aitem").each((_, el) => {
    latestUpdates.push(parseAItem($, el));
  });

  const newReleases: any[] = [];
  const upcoming: any[] = [];
  const completed: any[] = [];

  $(".alist-group section.swiper-slide").each((_, sec) => {
    const secTitle = $(sec).find(".stitle").text().trim();
    const items: any[] = [];
    $(sec).find(".aitem").each((_, el) => {
      items.push(parseAItem($, el));
    });

    if (secTitle === "New Releases") newReleases.push(...items);
    else if (secTitle === "Upcoming") upcoming.push(...items);
    else if (secTitle === "Completed") completed.push(...items);
  });
  
  const extractList = (id: string) => {
    const items: any[] = [];
    $(`#trending-anime .tab-body[data-id="${id}"] .aitem`).each((_, el) => {
      items.push(parseAItem($, el));
    });
    return items;
  };

  const trending = {
    now: extractList("trending"),
    day: extractList("day"),
    week: extractList("week"),
    month: extractList("month"),
  };

  return {
    featured,
    trending,
    latestUpdates,
    newReleases,
    upcoming,
    completed
  };
}

export async function getRandomAnime() {
  const response = await fetch("https://anikai.to/random");
  const id = response.url.split("/watch/").pop();
  if (!id) throw new Error("Failed to resolve random anime ID");
  return getAnimeDetails(id);
}

export async function getAnimeDetails(id: string) {
  const response = await fetch(`https://anikai.to/watch/${id}`);
  const html = await response.text();
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
  entity.find(".info span:not(.rating):not(.sub):not(.dub) b").each((_, span) => {
    typePieces.push($(span).text().trim());
  });
  const type = typePieces.length > 0 ? typePieces[0] : "";
  
  const desc = entity.find(".desc").text().trim();
  
  const details: Record<string, any> = {};
  
  entity.find(".detail > div > div").each((_, div) => {
    const el = $(div);
    const textNode = el.contents().filter((_, node) => node.type === "text").first();
    const labelRaw = textNode.length ? textNode.text().trim() : "";
    const label = labelRaw.replace(":", "").trim().toLowerCase().replace(/\s+/g, "_");

    if (label) {
      if (label === "genres" || label === "studios" || label === "producers" || label === "links" || label === "country") {
        const arr: { name: string; url: string }[] = [];
        el.find("span a").each((_, a) => {
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
  $("#related-anime .dropdown-menu .dropdown-item").each((_, el) => {
    relationLabels[$(el).attr("data-id") || ""] = $(el).text().trim();
  });

  $("#related-anime .tab-body").each((_, el) => {
    const relId = $(el).attr("data-id") || "";
    const label = relationLabels[relId] || "Related";
    $(el).find(".aitem").each((_, aitem) => {
      const parsed = parseAItem($, aitem);
      relations.push({ ...parsed, relation: label });
    });
  });

  const recommended: any[] = [];
  $(".sidebar-section").each((_, sec) => {
    if ($(sec).find(".stitle").text().trim() === "Recommended") {
      $(sec).find(".aitem").each((_, aitem) => {
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
    id,
    title,
    jpTitle,
    altTitle,
    aniId: syncData.anime_id || null,
    malId: syncData.mal_id || null,
    alId: syncData.al_id || null,
    rating,
    sub,
    dub,
    type,
    desc,
    details,
    score,
    reviews,
    relations,
    recommended
  };
}

export async function getAnimeEpisodes(id: string) {
  try {
    const watchUrl = `https://anikai.to/watch/${id}`;
    const response = await fetch(watchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    const animeIdMatch = $(".rate-box").attr("data-id");
    if (!animeIdMatch) {
      return [{ error: "AniID not found" }];
    }

    const tokenResponse = await fetch(`https://enc-dec.app/api/enc-kai?text=${encodeURIComponent(animeIdMatch)}`);
    const tokenData = await tokenResponse.json();
    const token = tokenData.result;

    const episodeListUrl = `https://anikai.to/ajax/episodes/list?ani_id=${animeIdMatch}&_=${token}`;
    const episodeListResponse = await fetch(episodeListUrl);
    const episodeListData = await episodeListResponse.json();

    const episodeHtml = episodeListData.result || "";
    const $ep = cheerio.load(episodeHtml);

    const episodes: any[] = [];
    $ep("a[num][token]").each((_, el) => {
      const episodeNum = $ep(el).attr("num");
      const episodeToken = $ep(el).attr("token");
      const isFiller = $ep(el).hasClass("filler");
      const langs = parseInt($ep(el).attr("langs") || "0", 10);
      const titleSpan = $ep(el).find("span");
      const title = titleSpan.text().trim();
      const jpTitle = titleSpan.attr("data-jp") || "";

      if (episodeNum && episodeToken) {
        episodes.push({
          number: parseInt(episodeNum, 10),
          token: episodeToken,
          title,
          jpTitle,
          isFiller,
          langs
        });
      }
    });

    return episodes;
  } catch (error) {
    return [{ error: "Error fetching episodes" }];
  }
}

export async function getStreamUrl(token: string, reqType?: string) {
  try {
    const encryptTokenRes = await fetch(`https://enc-dec.app/api/enc-kai?text=${encodeURIComponent(token)}`);
    const encryptTokenData = await encryptTokenRes.json();
    const encryptedToken = encryptTokenData.result;

    const listUrl = `https://anikai.to/ajax/links/list?token=${token}&_=${encryptedToken}`;
    const listRes = await fetch(listUrl);
    const listText = await listRes.text();
    let htmlContent = "";
    try {
      const parsedAjax = JSON.parse(listText);
      htmlContent = parsedAjax.result || "";
    } catch {
      htmlContent = listText;
    }

    const $ = cheerio.load(htmlContent);

    const extractServerId = (container: cheerio.Cheerio<cheerio.Element>) => {
      let lid = null;
      container.find(".server").each((_: any, el: any) => {
        const text = $(el).text().trim().toLowerCase();
        if (text.includes("server 1")) {
          lid = $(el).attr("data-lid");
        }
      });
      if (lid) return lid;
      return container.find(".server").first().attr("data-lid") || null;
    };

    const requestedServers: { name: string; data: string | null }[] = [];
    
    if (!reqType || reqType.toLowerCase() === "dub") {
      requestedServers.push({ name: "Dub", data: extractServerId($('.server-items[data-id="dub"]')) });
    }
    
    if (!reqType || reqType.toLowerCase() === "softsub") {
      requestedServers.push({ name: "Softsub", data: extractServerId($('.server-items[data-id="softsub"]')) });
    }
    
    if (!reqType || reqType.toLowerCase() === "sub") {
      requestedServers.push({ name: "Sub", data: extractServerId($('.server-items[data-id="sub"]')) });
    }

    const activeServers = requestedServers.filter(s => s.data);

    const tokenPromises = activeServers.map(async (item) => {
      try {
        const res = await fetch(`https://enc-dec.app/api/enc-kai?text=${encodeURIComponent(item.data!)}`);
        const json = await res.json();
        return { name: item.name, id: item.data!, token: json.result };
      } catch {
        return { name: item.name, id: item.data!, token: null };
      }
    });

    const tokenResults = await Promise.all(tokenPromises);

    const streamUrls = tokenResults.map((t) => ({
      type: t.name,
      url: `https://anikai.to/ajax/links/view?id=${t.id}&_=${t.token}`
    }));

    const streamResponses = await Promise.all(streamUrls.map(async (u) => {
      try {
        const res = await fetch(u.url);
        const json = await res.json();
        return { type: u.type, data: json.result };
      } catch {
        return { type: u.type, data: null };
      }
    }));

    const decryptPromises = streamResponses.filter(r => r.data).map(async (item) => {
      try {
        const res = await fetch(`https://enc-dec.app/api/dec-kai?text=${encodeURIComponent(item.data)}`);
        const json = await res.json();
        let parsed: any = {};
        if (typeof json.result === "string") {
          try { parsed = JSON.parse(json.result); } catch { }
        } else if (typeof json.result === "object") {
          parsed = json.result;
        }
        return { name: item.type, url: parsed?.url || null };
      } catch {
        return { name: item.type, url: null };
      }
    });

    const decryptResults = await Promise.all(decryptPromises);
    const decryptedUrls: Record<string, string | null> = {};
    decryptResults.forEach(r => {
      decryptedUrls[r.name] = r.url;
    });

    const headers = {
      "Referer": "https://anikai.to/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
    };

    const getFinalStream = async (url: string | null) => {
      if (!url) return null;
      try {
        const mediaUrl = url.replace("/e/", "/media/");
        const res = await fetch(mediaUrl, { headers });
        const json = await res.json();
        const result = json.result;

        const postData = {
          text: result,
          agent: headers["User-Agent"]
        };

        const postRes = await fetch("https://enc-dec.app/api/dec-mega", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData)
        });
        const postJson = await postRes.json();
        return postJson?.result || null;
      } catch {
        return null;
      }
    };

    const finalPromises = [];
    if (decryptedUrls["Sub"]) finalPromises.push(getFinalStream(decryptedUrls["Sub"]).then(data => ({ title: "Hardsub", ...data })));
    if (decryptedUrls["Dub"]) finalPromises.push(getFinalStream(decryptedUrls["Dub"]).then(data => ({ title: "Dub", ...data })));
    if (decryptedUrls["Softsub"]) finalPromises.push(getFinalStream(decryptedUrls["Softsub"]).then(data => ({ title: "Softsub", ...data })));

    const rawStreams = await Promise.all(finalPromises);
    const streams = rawStreams.filter(s => s && s.sources);

    return { streams };

  } catch (error) {
    return { error: "Failed to extract streams" };
  }
}
