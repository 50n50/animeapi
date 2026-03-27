import { Hono } from "@hono/hono";
import { scraperRoutes } from "./src/routes.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Anime API</title>
      <style>
        body {
          margin: 0;
          font-family: monospace;
          background-color: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        h1 {
          margin: 0 0 1rem 0;
          font-weight: normal;
        }
        a {
          color: #58a6ff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .credits {
          margin-top: 2rem;
          font-size: 0.8rem;
          color: #555;
        }
      </style>
    </head>
    <body>
      <div>
        <h1>Anime API</h1>
        <p>Please refer to the <a href="https://github.com/50n50/animeapi">docs</a> for usage.</p>
        <div class="credits">made by 50/50, aka paul</div>
      </div>
    </body>
    </html>
  `);
});

app.route("/api", scraperRoutes);

Deno.serve(app.fetch);
export default app;
