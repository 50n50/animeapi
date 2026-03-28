import { fetchPage } from "../utils/http.ts";
import { parseAnimeList } from "../parsers/anime-item.ts";
import * as cheerio from "cheerio";

const BASE = "https://anikai.to";

let genreCache: { name: string; href: string }[] | null = null;
let typeCache: { name: string; href: string }[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 30;

function isCacheValid() {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

async function fetchNavData() {
  if (genreCache && typeCache && isCacheValid()) return;
  const html = await fetchPage(`${BASE}/home`);
  const $ = cheerio.load(html);

  genreCache = [];
  $("#menu ul.c4 li a").each((_: any, el: any) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (name && href) genreCache!.push({ name, href });
  });

  typeCache = [];
  $("#menu ul.c1 li a").each((_: any, el: any) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (name && href) typeCache!.push({ name, href });
  });

  cacheTimestamp = Date.now();
}

export async function searchAnime(queryString: string = "") {
  const html = await fetchPage(`${BASE}/browser${queryString}`);
  return parseAnimeList(html);
}

export async function getAnimeByGenre(genre: string, queryString: string = "") {
  const html = await fetchPage(`${BASE}/genres/${genre}${queryString}`);
  return parseAnimeList(html);
}

export async function getGenres() {
  await fetchNavData();
  return genreCache!;
}

export async function getAnimeByType(type: string, queryString: string = "") {
  const html = await fetchPage(`${BASE}/${type}${queryString}`);
  return parseAnimeList(html);
}

export async function getTypes() {
  await fetchNavData();
  return typeCache!;
}

export async function getAnimeListByEndpoint(endpoint: string, queryString: string = "") {
  const html = await fetchPage(`${BASE}/${endpoint}${queryString}`);
  return parseAnimeList(html);
}

export async function getAZList(letter?: string, queryString: string = "") {
  const path = letter ? `az-list/${letter}` : "az-list";
  const html = await fetchPage(`${BASE}/${path}${queryString}`);
  return parseAnimeList(html);
}
