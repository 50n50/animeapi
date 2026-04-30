<p align="center">
  <img src="https://files.catbox.moe/2s5d3y.png" alt="Anime API Logo" width="150"/>
</p>

# <p align="center">Anime API</p>

<div align="center">
    A highly optimized RESTful streaming API providing programmatic access to info of over <strong>13,000 anime titles.</strong>

  <br/>
</div>

<br/>

> [!TIP]
> This project uses Deno Deploy. The free tier includes up to 10,000 requests per month. By adding a credit card, the request limit increases to 1,000,000 per month. Charges will not be applied automatically unless the plan is explicitly upgraded. For personal use, the 10,000 request limit is typically sufficient.


## Table of Contents

- [Installation](#installation)
    - [Local Development](#local-development)
    - [Edge Deployment](#edge-deployment)
- [Documentation](#documentation)
    - [GET Home](#get-home)
    - [GET Trending](#get-trending)
    - [GET Search](#get-search)
    - [GET A-Z List](#get-a-z-list)
    - [GET Genres](#get-genres)
    - [GET Genre Name](#get-genre-name)
    - [GET Types](#get-types)
    - [GET Type Name](#get-type-name)
    - [GET New Releases](#get-new-releases)
    - [GET Updates](#get-updates)
    - [GET Ongoing](#get-ongoing)
    - [GET Recent](#get-recent)
    - [GET Random](#get-random)
    - [GET Anime Details](#get-anime-details)
    - [GET Next Episode](#get-next-episode)
    - [GET Anime Episodes](#get-anime-episodes)
    - [GET Anime Stream](#get-anime-stream)
    - [GET Schedule](#get-schedule)

## <span id="installation">💻 Installation</span>

### Local Development

1. Clone the repository and move into the directory.

    ```bash
    git clone https://github.com/your-username/anime-api.git
    cd anime-api
    ```

2. Start the server! This API uses [Deno](https://deno.land/).

    ```bash
    deno task dev
    ```

    The server will start on [http://localhost:8000](http://localhost:8000).

### Quick Deploy (Deno 2.0)

For the fastest and most reliable deployment, use the GitHub integration:

1. **[Fork this repository](https://github.com/50n50/AnimeAPI/fork)**.
2. Go to your [Deno Deploy Dashboard](https://console.deno.com).
3. Click **"New Project"** → **"Deploy a repository"**.
4. Select your fork and set the entrypoint to `main.ts`.
5. Click **Deploy**. Your API will be live instantly!

> [!TIP]
> Once connected, every `git push` will automatically update your live API at the edge.




## <span id="documentation">📚 Documentation</span>

The endpoints exposed by the api are listed below with examples. All responses follow a standardized `{ success: boolean, data: any }` or `{ success: boolean, error: string }` schema.

<details>

<summary>

### `GET` Home

</summary>

#### Endpoint

```bash
/api/home
```

#### Request Sample

```javascript
const resp = await fetch("/api/home");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": {
    "featured": [
      {
        "title": "One Piece",
        "jpTitle": "ワンピース",
        "image": "https://anikai.to/images/poster.jpg",
        "desc": "Gold Roger was known as the Pirate King...",
        "link": "/watch/one-piece",
        "sub": 1080,
        "dub": 1000,
        "type": "TV",
        "genres": "Action, Adventure, Fantasy",
        "rating": "PG-13",
        "release": "1999",
        "quality": "HD"
      }
    ],
    "trending": {
      "now": [...],
      "day": [...],
      "week": [...],
      "month": [...]
    },
    "latestUpdates": [...],
    "newReleases": [...],
    "upcoming": [...],
    "completed": [...]
  }
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Trending

</summary>

#### Endpoint

```bash
/api/trending?period={period}
```

#### Query Parameters

|  Parameter   |  Type  |                            Description                            | Required? | Default |
| :----------: | :----: | :---------------------------------------------------------------: | :-------: | :-----: |
|   `period`   | string | Time period filter: `day`, `week`, or `month`.                    |    No     | `day`   |

#### Request Sample

```javascript
const resp = await fetch("/api/trending?period=week");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": [
    {
      "title": "Chainsaw Man",
      "jpTitle": "チェンソーマン",
      "link": "/watch/chainsaw-man",
      "image": "https://anikai.to/images/chainsaw.jpg",
      "tooltipId": "chainsaw-man",
      "sub": 12,
      "dub": 12,
      "episodes": 12,
      "type": "TV",
      "rank": 1
    }
  ]
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Search

</summary>

#### Endpoint

```bash
/api/search?keyword={query}&page={page}&status[]={status}&sort={sort}
```

#### Query Parameters

|  Parameter   |  Type  |                            Description                            | Required? | Default |
| :----------: | :----: | :---------------------------------------------------------------: | :-------: | :-----: |
|  `keyword`   | string | The search query, i.e. the title of the item you are looking for. |    Yes    |   --    |
|    `page`    | number |                  The page number of the result.                   |    No     |   `1`   |
|  `status[]`  | string |            Status, e.g. `airing`, `completed`. Supports arrays.   |    No     |   --    |
|    `sort`    | string |      Order of sorting, e.g. `score`, `recently_updated`.          |    No     |   --    |
|  `genre[]`   | string |          Genre IDs or names. Supports arrays natively.            |    No     |   --    |

#### Request Sample

```javascript
const resp = await fetch("/api/search?keyword=naruto&status[]=airing&sort=score");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "title": "Naruto: Shippuden",
        "jpTitle": "ナルト- 疾風伝",
        "link": "/watch/naruto-shippuden",
        "image": "...",
        "sub": 500,
        "dub": 500,
        "episodes": 500,
        "type": "TV"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "hasNextPage": true,
      "totalPages": 25
    }
  }
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` A-Z List

</summary>

#### Endpoint

```bash
/api/az-list
/api/az-list/{letter}?page={page}
```

#### Path Parameters

|  Parameter   |  Type  |                                             Description                                             | Required? | Default |
| :----------: | :----: | :-------------------------------------------------------------------------------------------------: | :-------: | :-----: |
|   `letter`   | string | Choose an english alphabet or `0-9` for numeric titles. |    No    |   --    |

#### Request Sample

```javascript
const resp = await fetch("/api/az-list/0-9?page=1");
const data = await resp.json();
console.log(data);
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Genres

</summary>

#### Endpoint

```bash
/api/genres
```

#### Request Sample

```javascript
const resp = await fetch("/api/genres");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": [
    { "name": "Action", "href": "/genres/action" },
    { "name": "Adventure", "href": "/genres/adventure" },
    { "name": "Fantasy", "href": "/genres/fantasy" }
  ]
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Genre Name

</summary>

#### Endpoint

```bash
/api/genre/{name}?page={page}
```

#### Path Parameters

| Parameter |  Type  |               Description                | Required? | Default |
| :-------: | :----: | :--------------------------------------: | :-------: | :-----: |
|  `name`   | string | The name of anime genre (in kebab case). |    Yes    |   --    |


#### Request Sample

```javascript
const resp = await fetch("/api/genre/action?page=1");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "title": "Solo Leveling",
        "link": "/watch/solo-leveling",
        "image": "...",
        "sub": 12,
        "type": "TV"
      }
    ],
    "pagination": { "currentPage": 1, "hasNextPage": true, "totalPages": 10 }
  }
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Types

</summary>

#### Endpoint

```bash
/api/types
```

#### Request Sample

```javascript
const resp = await fetch("/api/types");
const data = await resp.json();
console.log(data);
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Type Name

</summary>

#### Endpoint

```bash
/api/type/{name}?page={page}
```

#### Path Parameters

| Parameter |  Type  |               Description                | Required? | Default |
| :-------: | :----: | :--------------------------------------: | :-------: | :-----: |
|  `name`   | string | The media type, e.g. `tv`, `movie`, `ova`|    Yes    |   --    |

#### Request Sample

```javascript
const resp = await fetch("/api/type/movie?page=1");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "title": "Your Name.",
        "link": "/watch/your-name",
        "image": "...",
        "sub": 1,
        "type": "Movie"
      }
    ],
    "pagination": { "currentPage": 1, "hasNextPage": false, "totalPages": 1 }
  }
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` New Releases

</summary>

#### Endpoint

```bash
/api/new-releases?page={page}
```

#### Request Sample

```javascript
const resp = await fetch("/api/new-releases?page=1");
const data = await resp.json();
console.log(data);
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Updates

</summary>

#### Endpoint

```bash
/api/updates?page={page}
```

#### Request Sample

```javascript
const resp = await fetch("/api/updates?page=1");
const data = await resp.json();
console.log(data);
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Ongoing

</summary>

#### Endpoint

```bash
/api/ongoing?page={page}
```

#### Request Sample

```javascript
const resp = await fetch("/api/ongoing?page=1");
const data = await resp.json();
console.log(data);
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Recent

</summary>

#### Endpoint

```bash
/api/recent?page={page}
```

#### Request Sample

```javascript
const resp = await fetch("/api/recent?page=1");
const data = await resp.json();
console.log(data);
```

[🔼 Back to Top](#table-of-contents)

</details>


<details>

<summary>

### `GET` Random

</summary>

#### Endpoint

```bash
/api/random
```

#### Request Sample

```javascript
const resp = await fetch("/api/random");
const data = await resp.json();
console.log(data); // Returns deep metadata identical to Anime Details
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Anime Details

</summary>

#### Endpoint

```bash
/api/details/{id}
```

#### Path Parameters

| Parameter |  Type  |             Description              | Required? | Default |
| :-------: | :----: | :----------------------------------: | :-------: | :-----: |
| `id`      | string | The unique anime id (in kebab case). |    Yes    |   --    |

#### Request Sample

```javascript
const resp = await fetch("/api/details/one-piece");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": {
    "id": "one-piece",
    "title": "One Piece",
    "jpTitle": "ワンピース",
    "aniId": 21,
    "malId": 21,
    "rating": "PG-13",
    "sub": 1080,
    "dub": 1000,
    "type": "TV",
    "desc": "Gold Roger was known as the Pirate King...",
    "details": {
      "japanese": "ワンピース",
      "synonyms": "OP",
      "aired": "Oct 20, 1999 to ?",
      "status": "Currently Airing",
      "genres": [{ "name": "Action", "url": "/genres/action" }]
    },
    "score": 8.7,
    "reviews": 150000,
    "relations": [...],
    "recommended": [...]
  }
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Next Episode

</summary>

#### Endpoint

```bash
/api/next-episode/{id}
```

#### Path Parameters

| Parameter |  Type  |             Description              | Required? | Default |
| :-------: | :----: | :----------------------------------: | :-------: | :-----: |
| `id`      | string | The unique anime id (in kebab case). |    Yes    |   --    |

#### Request Sample

```javascript
const resp = await fetch("/api/next-episode/release-that-witch-wrrw1");
const data = await resp.json();
console.log(data);
```

#### Response Schema

Returns `null` if there is no known next episode, otherwise:

```javascript
{
  success: true,
  data: {
    timestamp: 1774893600,
    date: "2026/03/30 18:00 GMT"
  }
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Anime Episodes

</summary>

#### Endpoint

```bash
/api/episodes/{id}
```

#### Path Parameters

| Parameter |  Type  |     Description      | Required? | Default |
| :-------: | :----: | :------------------: | :-------: | :-----: |
| `id` | string | The unique anime id. |    Yes    |   --    |

#### Request Sample

```javascript
const resp = await fetch("/api/episodes/one-piece");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": [
    {
      "number": 1,
      "token": "a1b2c3d4",
      "title": "I'm Luffy! The Man Who's Gonna Be King of the Pirates!",
      "isFiller": false,
      "langs": 3
    }
  ]
}
```

[🔼 Back to Top](#table-of-contents)

</details>


<details>

<summary>

### `GET` Anime Stream

</summary>

#### Endpoint

```bash
/api/stream?token={token}&type={type}
```

#### Query Parameters

| Parameter |  Type  |     Description      | Required? | Default |
| :-------: | :----: | :------------------: | :-------: | :-----: |
| `token` | string | The encrypted episode token retrieved from the episodes endpoint. |    Yes    |   --    |
| `type` | string | The audio/subtitle stream format. Options: `sub`, `dub`, `softsub`. |    No    |   All three will be evaluated and returned if not specified.    |

#### Request Sample

```javascript
const resp = await fetch("/api/stream?token=a1b2c3d4&type=sub");
const { success, data } = await resp.json();
```

#### Response Sample

```json
{
  "success": true,
  "data": {
    "Sub": "https://delivery-node.com/m3u8/...",
    "Dub": null
  }
}
```
[🔼 Back to Top](#table-of-contents)

</details>

<details>

<summary>

### `GET` Schedule

</summary>

#### Endpoint

```bash
/api/schedule?time={time}&tz={tz}
```

#### Query Parameters

| Parameter |  Type  |     Description      | Required? | Default |
| :-------: | :----: | :------------------: | :-------: | :-----: |
| `time` | string \| number | A date string (e.g. `2024-01-01`) or a UNIX timestamp (seconds or ms). |    No    |   Current UNIX timestamp defaults to `now`.    |
| `tz` | string | A URL Encoded Timezone string (e.g. `%2B01%3A00` for `+01:00`). |    No    |   `+00:00`    |

#### Request Sample

```javascript
const resp = await fetch("/api/schedule?time=1776038400&tz=%2B01%3A00");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  success: true,
  data: [
    {
      id: "observation-records-of-my-fiancee-qmylr",
      time: "15:00",
      title: "Jishou Akuyaku Reijou na...",
      jpTitle: "Jishou Akuyaku Reijou na...",
      episode: "EP 2",
      link: "/watch/observation-records-of-my-fiancee-qmylr"
    },
    //...
  ]
}
```

[🔼 Back to Top](#table-of-contents)

</details>
