import { Hono } from "@hono/hono";
import { searchAnime, getGenres, getAnimeByGenre, getTypes, getAnimeByType, getAnimeListByEndpoint, getAZList } from "./scrapers/browse.ts";
import { getHome, getTrending } from "./scrapers/home.ts";
import { getAnimeDetails, getRandomAnime } from "./scrapers/details.ts";
import { getAnimeEpisodes } from "./scrapers/episodes.ts";
import { getStreamUrl } from "./scrapers/stream.ts";
import { getSchedule } from "./scrapers/schedule.ts";

export const scraperRoutes = new Hono();

scraperRoutes.get("/home", async (c) => {
  try {
    const data = await getHome();
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/az-list", async (c) => {
  try {
    const queryString = new URL(c.req.url).search;
    const data = await getAZList(undefined, queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/az-list/:letter", async (c) => {
  const letter = c.req.param("letter");
  try {
    const queryString = new URL(c.req.url).search;
    const data = await getAZList(letter, queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/trending", async (c) => {
  try {
    const period = c.req.query("period");
    const data = await getTrending(period);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/search", async (c) => {
  try {
    const queryString = new URL(c.req.url).search;
    const data = await searchAnime(queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/genres", async (c) => {
  try {
    const genres = await getGenres();
    return c.json({ success: true, data: genres });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/genre/:name", async (c) => {
  const name = c.req.param("name");
  try {
    const queryString = new URL(c.req.url).search;
    const data = await getAnimeByGenre(name, queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/types", async (c) => {
  try {
    const types = await getTypes();
    return c.json({ success: true, data: types });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/type/:name", async (c) => {
  const name = c.req.param("name");
  try {
    const queryString = new URL(c.req.url).search;
    const data = await getAnimeByType(name, queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/new-releases", async (c) => {
  try {
    const queryString = new URL(c.req.url).search;
    const data = await getAnimeListByEndpoint("new-releases", queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/updates", async (c) => {
  try {
    const queryString = new URL(c.req.url).search;
    const data = await getAnimeListByEndpoint("updates", queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/ongoing", async (c) => {
  try {
    const queryString = new URL(c.req.url).search;
    const data = await getAnimeListByEndpoint("ongoing", queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/recent", async (c) => {
  try {
    const queryString = new URL(c.req.url).search;
    const data = await getAnimeListByEndpoint("recent", queryString);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/details/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const data = await getAnimeDetails(id);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/random", async (c) => {
  try {
    const data = await getRandomAnime();
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/episodes/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const data = await getAnimeEpisodes(id);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/stream", async (c) => {
  const token = c.req.query("token");
  const type = c.req.query("type");

  if (!token) return c.json({ success: false, error: "Missing token parameter" }, 400);

  try {
    const data = await getStreamUrl(token, type);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

scraperRoutes.get("/schedule", async (c) => {
  try {
    const time = c.req.query("time");
    const tz = c.req.query("tz"); // Optional, will default to +00:00 inside the scraper
    const data = await getSchedule(time, tz);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});
