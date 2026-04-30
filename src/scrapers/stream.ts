import { encrypt, decrypt, decryptMega } from "../utils/crypto.ts";
import { DEFAULT_HEADERS } from "../utils/http.ts";
import * as cheerio from "cheerio";

const BASE = "https://anikai.to";

export async function getStreamUrl(token: string, reqType?: string) {
  const encryptedToken = await encrypt(token);

  const listUrl = `${BASE}/ajax/links/list?token=${token}&_=${encryptedToken}`;
  const listRes = await fetch(listUrl, { signal: AbortSignal.timeout(10000) });
  const listText = await listRes.text();

  let htmlContent = "";
  try {
    const parsedAjax = JSON.parse(listText);
    htmlContent = parsedAjax.result || "";
  } catch {
    htmlContent = listText;
  }

  const $ = cheerio.load(htmlContent);

  const extractServerId = (container: any) => {
    let lid: string | null = null;
    container.find(".server").each((_: any, el: any) => {
      const text = $(el).text().trim().toLowerCase();
      if (text.includes("server 1")) {
        lid = $(el).attr("data-lid") || null;
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

  const tokenResults = await Promise.all(
    activeServers.map(async (item) => {
      try {
        const encToken = await encrypt(item.data!);
        return { name: item.name, id: item.data!, token: encToken };
      } catch {
        return { name: item.name, id: item.data!, token: null };
      }
    })
  );

  const streamUrls = tokenResults.map((t) => ({
    type: t.name,
    url: `${BASE}/ajax/links/view?id=${t.id}&_=${t.token}`
  }));

  const streamResponses = await Promise.all(
    streamUrls.map(async (u) => {
      try {
        const res = await fetch(u.url, { signal: AbortSignal.timeout(10000) });
        const json = await res.json();
        return { type: u.type, data: json.result };
      } catch {
        return { type: u.type, data: null };
      }
    })
  );

  const decryptResults = await Promise.all(
    streamResponses.filter(r => r.data).map(async (item) => {
      try {
        const raw = await decrypt(item.data);
        let parsed: any = {};
        if (typeof raw === "string") {
          try { parsed = JSON.parse(raw); } catch {}
        } else if (typeof raw === "object") {
          parsed = raw;
        }
        return { name: item.type, url: parsed?.url || null, skip: parsed?.skip || null };
      } catch {
        return { name: item.type, url: null, skip: null };
      }
    })
  );

  const decryptedData: Record<string, { url: string | null; skip: any }> = {};
  decryptResults.forEach(r => { decryptedData[r.name] = { url: r.url, skip: r.skip }; });

  const getFinalStream = async (data: { url: string | null; skip: any } | undefined) => {
    if (!data || !data.url) return null;
    try {
      const mediaUrl = data.url.replace("/e/", "/media/");
      const res = await fetch(mediaUrl, { headers: DEFAULT_HEADERS, signal: AbortSignal.timeout(10000) });
      const json = await res.json();
      const streamData = await decryptMega(json.result);
      if (data.skip) {
        streamData.skip = data.skip;
      }
      return streamData;
    } catch {
      return null;
    }
  };

  const finalPromises: Promise<any>[] = [];
  if (decryptedData["Sub"]) finalPromises.push(getFinalStream(decryptedData["Sub"]).then(data => ({ title: "Hardsub", ...data })));
  if (decryptedData["Dub"]) finalPromises.push(getFinalStream(decryptedData["Dub"]).then(data => ({ title: "Dub", ...data })));
  if (decryptedData["Softsub"]) finalPromises.push(getFinalStream(decryptedData["Softsub"]).then(data => ({ title: "Softsub", ...data })));

  const rawStreams = await Promise.all(finalPromises);
  const streams = rawStreams.filter(s => s && s.sources);

  return { streams };
}
