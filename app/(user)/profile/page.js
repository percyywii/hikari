import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import Banner from "@/content/profile/Banner";
import CategoryMain from "@/content/profile/CategoryMain";
import GuestProfile from "@/content/profile/GuestProfile";
import { UserProfile } from "@/lib/AnilistUser";
import { Fragment } from "react";

export const metadata = {
  title: "Profile - Hikari",
  description: "View your anime lists, statistics, and watching history on Hikari.",
};

const Page = async () => {
  let session = null;
  try {
    session = await getAuthSession();
  } catch {
    session = null;
  }

  if (!session || !session.user) {
    return <GuestProfile />;
  }

  const data = await UserProfile(session?.user?.token, session?.user?.name);
  const user = data?.user || session.user;
  const lists = Array.isArray(data?.lists) ? data.lists : [];

  const watchedAnime = lists.find((item) => item?.status === "COMPLETED") || null;

  return (
    <Fragment>
      <Banner info={user} data={watchedAnime} />
      <CategoryMain lists={lists} user={user} watchedAnime={watchedAnime} />

      {/* background glow */}
      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px] pointer-events-none"></div>
      <div className="fixed w-[500px] h-[370.13px] right-[50%] bottom-[50%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-full pointer-events-none"></div>
    </Fragment>
  );
};

export default Page;