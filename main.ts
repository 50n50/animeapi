import { Hono } from "@hono/hono";
import { scraperRoutes } from "./src/routes.ts";
import { proxyRoutes } from "./src/proxy.ts";

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
        <p><a href="/test">Run API Tests</a></p>
        <div class="credits">made by 50/50, aka paul</div>
      </div>
    </body>
    </html>
  `);
});

app.get("/test", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Anime API Tests</title>
      <style>
        body {
          margin: 0;
          font-family: monospace;
          background-color: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
        }
        h1 {
          margin: 0 0 1rem 0;
          font-weight: normal;
        }
        .container {
          width: 100%;
          max-width: 800px;
          text-align: left;
        }
        .log {
          background-color: #111;
          padding: 1rem;
          border-radius: 8px;
          overflow-y: auto;
          height: 60vh;
          border: 1px solid #333;
        }
        .log-item {
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #222;
        }
        .success { color: #4ade80; }
        .error { color: #f87171; }
        .info { color: #60a5fa; }
        a {
          color: #58a6ff;
          text-decoration: none;
          display: inline-block;
          margin-top: 1rem;
        }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>API Tests</h1>
        <div class="log" id="log"></div>
        <a href="/">&larr; Back to Home</a>
      </div>
      <script>
        const logEl = document.getElementById('log');
        function log(msg, type = 'info') {
          const div = document.createElement('div');
          div.className = 'log-item ' + type;
          div.textContent = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
          logEl.appendChild(div);
          logEl.scrollTop = logEl.scrollHeight;
        }

        async function testEndpoint(name, url, validateParams = null) {
          try {
            log('Testing [' + name + '] -> ' + url);
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
              log('SUCCESS: ' + name, 'success');
              if (validateParams) return validateParams(data.data);
              return data.data;
            } else {
              log('FAILED: ' + name + ' - ' + data.error, 'error');
              return null;
            }
          } catch (e) {
            log('ERROR: ' + name + ' - ' + e.message, 'error');
            return null;
          }
        }

        async function runTests() {
          log('Starting tests...');

          await testEndpoint('Home', '/api/home');
          await testEndpoint('Trending', '/api/trending?period=day');
          await testEndpoint('AZ-List', '/api/az-list');
          await testEndpoint('Genres', '/api/genres');
          await testEndpoint('Types', '/api/types');
          await testEndpoint('New Releases', '/api/new-releases');
          await testEndpoint('Updates', '/api/updates');
          await testEndpoint('Ongoing', '/api/ongoing');
          await testEndpoint('Recent', '/api/recent');
          await testEndpoint('Random', '/api/random');

          const searchRes = await testEndpoint('Search (Naruto)', '/api/search?keyword=naruto');
          
          if (searchRes && searchRes.results && searchRes.results.length > 0) {
            const animeId = searchRes.results[0].link.split('/').pop().split('?')[0]; // Extract ID
            log('Found Anime ID: ' + animeId);

            await testEndpoint('Details', '/api/details/' + animeId);
            const episodesRes = await testEndpoint('Episodes', '/api/episodes/' + animeId);
            
            if (episodesRes && episodesRes.length > 0) {
              const token = episodesRes[0].token;
              log('Testing Stream with token: ' + token);
              await testEndpoint('Stream', '/api/stream?token=' + encodeURIComponent(token));
            } else {
               log('No episodes found to test streaming', 'error');
            }
          } else {
            log('Search returned no results to continue testing details/episodes', 'error');
          }

          log('Tests complete!');
        }

        runTests();
      </script>
    </body>
    </html>
  `);
});

app.route("/api", scraperRoutes);
app.route("/proxy", proxyRoutes);

Deno.serve(app.fetch);
export default app;
