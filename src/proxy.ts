import { Hono } from "@hono/hono";
import { DEFAULT_HEADERS } from "./utils/http.ts";

export const proxyRoutes = new Hono();

proxyRoutes.get("/m3u8", async (c) => {
  const url = c.req.query("url");
  const headers = c.req.query("headers");

  if (!url) {
    return c.text("Missing URL parameter", 400);
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    const customHeaders = headers ? JSON.parse(decodeURIComponent(headers)) : {};
    
    const response = await fetch(decodedUrl, {
      headers: {
        ...DEFAULT_HEADERS,
        ...customHeaders,
        "Referer": new URL(decodedUrl).origin
      }
    });

    if (!response.ok) {
      return c.text(`Target returned ${response.status}`, response.status);
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/vnd.apple.mpegurl") || contentType?.includes("mpegurl") || decodedUrl.includes(".m3u")) {
      let content = await response.text();
      const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf("/") + 1);

      const lines = content.split("\n");
      const rewrittenLines = lines.map(line => {
        line = line.trim();
        if (!line || line.startsWith("#")) {
          if (line.includes("URI=\"")) {
            return line.replace(/URI="(.*?)"/g, (match, p1) => {
              const absolute = p1.startsWith("http") ? p1 : new URL(p1, baseUrl).href;
              const proxyUrl = new URL(c.req.url);
              proxyUrl.searchParams.set("url", absolute);
              return `URI="${proxyUrl.toString()}"`;
            });
          }
          return line;
        }

        const absolute = line.startsWith("http") ? line : new URL(line, baseUrl).href;
        const proxyUrl = new URL(c.req.url);
        proxyUrl.searchParams.set("url", absolute);
        return proxyUrl.toString();
      });

      content = rewrittenLines.join("\n");
      
      return new Response(content, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache"
        }
      });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType || "video/MP2T",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error: any) {
    return c.text(`Proxy error: ${error.message}`, 500);
  }
});
