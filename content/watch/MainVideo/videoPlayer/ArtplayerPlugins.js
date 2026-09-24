import safeHlsQualityPlugin from "@/lib/plugins/safeHlsQualityPlugin";
import safeChapterPlugin from "@/lib/plugins/safeChapterPlugin";

export const ArtplayerPlugins = (watchInfo) => {
  const intro = watchInfo?.watchData?.intro;
  const outro = watchInfo?.watchData?.outro;

  const chapters = [];
  if (
    intro?.start != null &&
    intro?.end != null &&
    intro.start !== intro.end
  ) {
    chapters.push({
      start: intro.start,
      end: intro.end,
      title: "Opening",
    });
  }

  if (
    outro?.start != null &&
    outro?.end != null &&
    outro.start !== outro.end
  ) {
    chapters.push({
      start: outro.start,
      end: outro.end,
      title: "Ending",
    });
  }

  return [
    safeHlsQualityPlugin({
      control: true,
      setting: true,
      getResolution: (level) => `${level.height}P`,
      title: "Quality",
      auto: "Auto",
    }),
    ...(chapters.length ? [safeChapterPlugin({ chapters })] : []),
  ];
};

export default ArtplayerPlugins;
