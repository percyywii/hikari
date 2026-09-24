import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/partials/header/Header";
import Footer from "@/partials/footer/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from "./SessionProvider";
import { getAuthSession } from "./api/auth/[...nextauth]/route";
import { ThemeProvider } from "@/context/ThemeContext";

const outfit = Outfit({ subsets: ["latin"] });


export const metadata = {
  metadataBase: new URL('https://hikari.app'),
  applicationName: "Hikari",
  title: "Hikari : Stream Anime Free in HD Without Annoying Ads",
  icons: {
    icon: '/images/logo.svg',
  },
  description: "Welcome to Hikari (光), your ultimate destination for streaming anime free of charge in HD. Dive into a vast collection of subbed and dubbed anime series and movies with multi-server resilience, synchronized audio, and seamless viewing. At Hikari, your anime journey awaits!",
  keywords: [
    'anime',
    'anilist-tracker',
    'trending anime',
    'watch anime subbed',
    'watch anime dubbed',
    'latest anime episodes',
    'anime streaming sub',
    'anime streaming dub',
    'subbed anime online',
    'dubbed anime online',
    'new anime releases',
    'watch anime sub and dub',
    'anime episodes subtitles',
    'english dubbed anime',
    'subbed and dubbed series',
    'anime series updates',
    'anime episodes english sub',
    'anime episodes english dub',
    'latest subbed anime',
    'latest dubbed anime',
    'subbed anime streaming',
    'dubbed anime streaming',
    'Tenro latest anime',
    'anime watch list',
    'anime reviews',
    'anime news',
    'anime recommendations',
    'best anime series',
    'popular anime shows',
    'anime streaming platform',
    'anime download',
    'top anime of the year',
    'anime genres',
    'ongoing anime series',
    'anime fan community',
    'classic anime series',
    'anime movie streaming',
    'latest anime movies',
    'upcoming anime releases',
    'anime character rankings',
    'anime discussion forums',
    'anime streaming sites',
    'anime online free',
    'anime episode guide',
    'anime synopsis',
    'tenro',
    'tenro anime',
    'tenro anime watch online',
    'tenro-anime website',
    'tenro anime app',
    'tenro app',
    'anime release schedule',
    'watch anime legally',
    'anime marathons',
    'anime streaming without signup',
    'tenro anime library',
    'tenro anime catalog',
    'latest anime trends',
    'anime simulcast',
    'anime with multiple audio tracks',
    'tenro dubbed anime',
    'anime in multiple languages',
    'anime with subtitles',
    'anime episode tracker',
    'tenro anime subscriptions',
    'free anime episodes',
    'latest anime on tenro',
    'anime streaming high quality',
    'discover new anime',
    'anime streaming without ads',
    'tenro anime news',
    'anime streaming schedule',
    'tenro anime events',
    'follow anime on tenro',
    'watch anime in 4K',
    'anime HD streaming',
    'tenro anime blog',
    'anime streaming experience',
    'anime series marathon',
    'popular anime on tenro',
    'anime episode countdown',
    'anime streaming updates',
    'anime on demand',
    'tenro anime guide',
    'anime streaming service tenro',
    'anime streaming interface',
    'watch anime tenro website'
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hikari : Stream Anime Free in HD",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Hikari",
    title: "Hikari : Stream Anime Free in HD Without Annoying Ads",
    description: "Welcome to Hikari (光), your ultimate destination for streaming anime free of charge in HD. Dive into a vast collection of subbed and dubbed anime series and movies with zero interruptions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hikari : Stream Anime Free in HD Without Annoying Ads",
    description: "Welcome to Hikari (光), your ultimate destination for streaming anime free of charge in HD. Dive into a vast collection of subbed and dubbed anime series and movies with zero interruptions.",
  },
  other: {
    'google-site-verification': 'ls1OUoOoLjxYsmKMPQ1ML9P99TWDsm7d5hfnGQjW7Tw',
    "X-Frame-Options": "SAMEORIGIN",
  }
};


export default async function RootLayout({ children }) {
  const session = await getAuthSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider>
          <AuthProvider session={session}>
            <Header />
            {children}
            <Footer />
          </AuthProvider>

          <Analytics />
          <ToastContainer draggable theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}
