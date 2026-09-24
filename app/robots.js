export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hikari.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/profile',
        '/settings',
        '/api/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}