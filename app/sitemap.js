import { TrendingAnilist, Top100Anilist, SeasonalAnilist } from '@/lib/Anilistfunction';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hikari.app';

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/continue-watching`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {
    const [trendingData, top100Data, seasonalData] = await Promise.all([
      TrendingAnilist().catch(() => []),
      Top100Anilist().catch(() => []),
      SeasonalAnilist().catch(() => []),
    ]);

    const seenIds = new Set();
    const dynamicRoutes = [];

    const allAnime = [
      ...(Array.isArray(trendingData) ? trendingData : []),
      ...(Array.isArray(top100Data) ? top100Data : []),
      ...(Array.isArray(seasonalData) ? seasonalData : []),
    ];

    for (const anime of allAnime) {
      if (anime?.id && !seenIds.has(anime.id)) {
        seenIds.add(anime.id);
        dynamicRoutes.push({
          url: `${baseUrl}/watch/${anime.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
