import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/mongodb/db";
import { getServerSession } from "next-auth"

export const authOptions = {
  ...(clientPromise && { adapter: MongoDBAdapter(clientPromise) }),
  secret: process.env.NEXTAUTH_SECRET || "hikari-nextauth-secret-key-production-2026",
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Hikari Account",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "HikariFan" },
        avatar: { label: "Avatar", type: "text" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim() || "Hikari Member";
        const avatarUrl = credentials?.avatar?.trim() || "/images/waifus/1.png";
        return {
          id: `hikari_${Date.now()}`,
          name: username,
          email: `${username.toLowerCase().replace(/[^a-z0-9]/g, "") || "user"}@hikari.app`,
          image: {
            large: avatarUrl,
            medium: avatarUrl,
          },
          avatar: {
            large: avatarUrl,
            medium: avatarUrl,
          },
          bannerImage: "/images/banner.jpg",
          createdAt: Math.floor(Date.now() / 1000),
          isLocal: true,
        };
      },
    }),
    {
      id: "AniListProvider",
      name: "AniList",
      type: "oauth",
      token: "https://anilist.co/api/v2/oauth/token",
      authorization: {
        url: "https://anilist.co/api/v2/oauth/authorize",
        params: { scope: "", response_type: "code" },
      },
      userinfo: {
        url: process.env.GRAPHQL_ENDPOINT || "https://graphql.anilist.co",
        async request(context) {
          try {
            const res = await fetch("https://graphql.anilist.co", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${context.tokens.access_token}`,
                Accept: "application/json",
              },
              body: JSON.stringify({
                query: `
                    query {
                      Viewer {
                        id
                        name
                        avatar {
                          large
                          medium
                        }
                        bannerImage
                        createdAt
                        mediaListOptions {
                          animeList {
                            customLists
                          }
                        }
                      }
                    }
                  `,
              }),
            });
            const { data } = await res.json();
            const viewer = data?.Viewer;
            if (!viewer) {
              throw new Error("Viewer not found in AniList response");
            }

            return {
              token: context.tokens.access_token,
              name: viewer.name,
              sub: String(viewer.id),
              image: viewer.avatar,
              createdAt: viewer.createdAt,
              list: viewer.mediaListOptions?.animeList?.customLists || [],
            };
          } catch (err) {
            console.warn("AniList userinfo fetch warning:", err?.message || err);
            return {
              token: context.tokens.access_token,
              name: "AniList User",
              sub: "anilist_user",
              image: { large: "/images/logo.png", medium: "/images/logo.png" },
              createdAt: Math.floor(Date.now() / 1000),
              list: [],
            };
          }
        },
      },
      clientId: process.env.ANILIST_CLIENT_ID,
      clientSecret: process.env.ANILIST_CLIENT_SECRET,
      profile(profile) {
        return {
          token: profile.token,
          id: profile.sub,
          name: profile?.name,
          image: profile.image,
          createdAt: profile?.createdAt,
          list: profile?.list,
        };
      },
    },
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image || user.avatar;
        token.token = user.token || null;
        token.createdAt = user.createdAt;
        token.list = user.list || [];
        token.isLocal = Boolean(user.isLocal);
        token.bannerImage = user.bannerImage || "/images/banner.jpg";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          ...token,
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions)

export const getAuthSession = async () => {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.warn("Failed to retrieve auth session, continuing unauthenticated:", error?.message || error);
    return null;
  }
};

export { handler as GET, handler as POST }