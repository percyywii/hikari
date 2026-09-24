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
    'hikari anime',
    'hikari anime streaming',
    'hikari anime watch online',
    'hikari anime app',
    'anime streaming free',
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
    'anilist-tracker',
    'trending anime',
    'anime watch list',
    'anime reviews',
    'anime recommendations',
    'best anime series',
    'popular anime shows',
    'anime streaming platform',
    'top anime of the year',
    'anime genres',
    'ongoing anime series',
    'anime fan community',
    'anime movie streaming',
    'latest anime movies',
    'upcoming anime releases',
    'anime discussion forums',
    'anime streaming sites',
    'anime online free',
    'anime episode guide',
    'anime release schedule',
    'anime marathons',
    'anime streaming without signup',
    'hikari anime library',
    'hikari anime catalog',
    'latest anime trends',
    'anime simulcast',
    'anime with multiple audio tracks',
    'anime in multiple languages',
    'anime with subtitles',
    'anime episode tracker',
    'free anime episodes',
    'anime streaming high quality',
    'anime HD streaming',
    'anime streaming without ads',
    'anime streaming updates',
    'anime on demand',
    'watch anime in HD',
    'anime streaming experience',
    'anime series marathon',
    'anime streaming service',
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
  let session = null;
  try {
    session = await getAuthSession();
  } catch (error) {
    console.warn("Session load error in RootLayout, proceeding as unauthenticated:", error?.message || error);
    session = null;
  }

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
          <ToastContainer draggable theme="colored" position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
