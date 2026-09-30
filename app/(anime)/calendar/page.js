import CalendarView from "@/content/calendar/CalendarView";

export const metadata = {
  title: "Anime Broadcast Calendar & Airing Schedule | Hikari",
  description:
    "Live weekly anime release schedule with automatic local timezone conversion, real-time episode countdowns, and instant streaming on Hikari.",
};

export default function CalendarPage() {
  return (
    <div className="w-full flex flex-col items-center z-10 relative main-responsive top-[86px] min-h-[calc(100vh-86px)] pb-24">
      <CalendarView />
    </div>
  );
}
