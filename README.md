<div align="center">
  <a href="" target="_blank">
    <img src="https://github.com/Amritanshu312/Taro/blob/main/public/images/logo.png" alt="Logo" width="140" height="140">
  </a>

  <h2 align="center">Taro</h3>

  <p align="center">
    An open-source Anime streaming site built with Nextjs 14
  </p>
</div>

# About the Project

Experience uninterrupted, ad-free streaming with seamless progress tracking thanks to AniList integration, powered by the Consumet API. Our platform, built using Next.js 14, Nextui, MongoDB, and Redis, ensures a smooth and enjoyable user experience.

## :sparkles: Features

- [x] `Search`: Get a list of all animes and mangas you want using filters.
- [x] `Watch`: Stream any available episode, whether dubbed or subbed.
- [x] `Comment`: Share your thoughts on episodes or provide helpful information for others.
- [x] `Log In`: Sign in with your AniList account (note: some restrictions may apply).
- [x] `AniList Integration`: Seamlessly sync your AniList account to carry over settings and animes.
- [x] `Keep Watching`: Resume episodes from where you left off with local tracking.
- [x] `Track Your Favorites`: Organize your animes and mangas into Completed, Dropped, Planning, and more.
- [x] `Episode Tracking`: Mark episodes you've watched and pick up where you left off.
- [x] `Effortless Search`: Quickly search for any anime with ease.
- [x] `Modern Video Player`: Enjoy a sleek and up-to-date video player experience.
- [x] `Fully Responsive`: Access and enjoy your content on all devices.

## Environment Variables

Copy `.env.example` to `.env.local` before starting the project. Public pages and browsing work without MongoDB or AniList OAuth credentials, but login, profiles, comments, and progress syncing require those services to be configured.

```
# Base URL for your application
NEXT_PUBLIC_URL=http://localhost:3000
# Replace with your website URL if deployed, otherwise keep localhost with your port.
# Ensure there is no trailing slash ("/") at the end.

# Consumet is installed as an npm dependency; no separate API URL is required.

# AniList API Configuration
GRAPHQL_ENDPOINT=https://graphql.anilist.co
ANILIST_CLIENT_ID=
# Obtain your AniList Client ID from: https://anilist.co/settings/developer
ANILIST_CLIENT_SECRET=
# Obtain your AniList Client Secret from: https://anilist.co/settings/developer

# NextAuth Configuration
NEXTAUTH_SECRET=
# Generate a secret for NextAuth using the following command:
# openssl rand -base64 32
# Paste the result here.

NEXTAUTH_URL=http://localhost:3000
# Replace with your website URL if deployed, otherwise keep localhost with your port.
# Ensure there is no trailing slash ("/") at the end.

# MongoDB Connection URI
MONGODB_URI=
# Provide your MongoDB connection string here.

# Node Environment
NODE_ENV=development
# Use "production" for a deployed build.
```

## 📚: Tecnologies Used

Front-end:

- `Next.js`
- `Javascript`
- `Axios`
- `Context API`
- `react-icons`
- `GraphQL`
- `Framer Motion`
- `React Progress Bar`
- `Anilist API`
- `Consumet API`
- `Redis IO`
- `Disqus`
- `Artplayer`

Back-End:

- `Mongoose`
- `Next.js (API) Route Handler`

## Run Locally

Prerequisites: Node.js 18.17 or newer and npm.

Clone the project

```bash
  git clone https://github.com/Amritanshu312/Taro.git
```

Go to the project directory

```bash
  cd taro
```

Install dependencies

```bash
  npm install
```

Create the local environment file

```bash
  cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead. Fill in the optional AniList and MongoDB values when you need authentication and synced user data.

Start the server

```bash
  npm run dev
```

Optional source backend

For a separate source service, open a second terminal and run:

```bash
  npm run source-api
```

Then set `SOURCE_API_URL=http://localhost:4000` in `.env.local` and restart Next.js. The source backend still requires at least one reachable provider to return video URLs.

Deploy the source backend

The source backend can run on a VPS, Railway, Render, Fly.io, or another Docker host with permitted outbound HTTPS access:

```bash
docker build -f Dockerfile.source -t taro-source-api .
docker run --rm -p 4000:4000 --env-file .env.source taro-source-api
```

Set these values in `.env.source` on the server:

```env
SOURCE_API_PORT=4000
PROVIDER_TIMEOUT_MS=8000
PROVIDER_MAX_RETRIES=1
PROVIDER_COOLDOWN_MS=30000
ENABLE_PROVIDER_HIANIME=true
ENABLE_PROVIDER_ANIMEPAHE=true
ENABLE_PROVIDER_ANIMEUNITY=true
STREAM_ALLOWED_HOSTS=your-authorized-source-domain.example
```

Point the frontend's `SOURCE_API_URL` at the deployed backend. The backend health endpoints are `/api/health` and `/api/providers/health`. A different hosting network may be required if a provider blocks the current deployment IP; the gateway does not bypass provider access controls.

Open http://localhost:3000 in your browser. For a production check, run `npm run build` followed by `npm start`.

## :camera: Preview/Screenshots

### Home

![Home page](https://github.com/Amritanshu312/Taro/blob/main/public/website%20image/home.png)

<br />
<br />

---

<br />

### Watch Page

![Watch Page](https://github.com/Amritanshu312/Taro/blob/main/public/website%20image/watch.png)

<br />
<br />

---

<br />

### Catalog Page

![Catalog Page](https://github.com/Amritanshu312/Taro/blob/main/public/website%20image/catalog.png)

<br />
<br />

---

<br />

### Profile Page

![Profile Page](https://github.com/Amritanshu312/Taro/blob/main/public/website%20image/profile.png)

<br />
<br />

---

<br />

### Statistics Page

![Statistics Page](https://github.com/Amritanshu312/Taro/blob/main/public/website%20image/statistics.png)

---

<br />

### 404 Page

![Watchlist Page 1](https://github.com/Amritanshu312/Taro/blob/main/public/website%20image/404.png)
