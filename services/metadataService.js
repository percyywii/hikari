/**
 * Tenro Metadata Service
 * Produces unified, SEO-optimized metadata, OpenGraph tags, and Twitter cards
 * with the new Tenro brand name.
 */

export const metadataService = {
  getSiteName() {
    return "Hikari";
  },

  getBaseUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL || "https://hikari.app";
  },

  generateAnimeMetadata(animeInfo) {
    const siteName = this.getSiteName();
    const title = animeInfo?.title?.english || animeInfo?.title?.romaji || animeInfo?.title?.userPreferred || "Anime";
    const rawDesc = animeInfo?.description || `Watch ${title} in HD with English Sub and Dub on ${siteName}.`;
    const cleanDesc = rawDesc.replace(/<[^>]*>/g, "").slice(0, 180);
    const poster = animeInfo?.coverImage?.extraLarge || animeInfo?.coverImage?.large || "/images/banner.jpg";

    return {
      title: `${title} - Watch Anime Online | ${siteName}`,
      description: cleanDesc,
      openGraph: {
        title: `Watch ${title} Free on ${siteName}`,
        description: cleanDesc,
        siteName,
        images: [
          {
            url: poster,
            width: 1200,
            height: 675,
            alt: title,
          },
        ],
        type: "video.episode",
      },
      twitter: {
        card: "summary_large_image",
        title: `Watch ${title} on ${siteName}`,
        description: cleanDesc,
        images: [poster],
      },
    };
  },
};

export default metadataService;
