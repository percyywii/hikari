/**
 * Safe HLS Quality Plugin for Artplayer
 * Drop-in replacement for artplayer-plugin-hls-quality.
 * Eliminates Parcel v2 legacy loader incompatibility that throws
 * "TypeError: Cannot read properties of undefined (reading 'call')"
 * in Next.js 15 Webpack environments.
 */

export default function safeHlsQualityPlugin(options = {}) {
  return (art) => {
    function getHls() {
      return art.hls || (typeof window !== "undefined" ? window.hls : null);
    }

    function updateQuality() {
      const hls = getHls();
      if (!hls || !Array.isArray(hls.levels) || hls.levels.length === 0) {
        return;
      }

      const autoText = options.auto || "Auto";
      const titleText = options.title || "Quality";
      const getResolution =
        options.getResolution ||
        ((lvl) => (lvl && lvl.height ? `${lvl.height}P` : "Auto"));

      const currentLvl =
        hls.currentLevel >= 0 ? hls.levels[hls.currentLevel] : null;
      const defaultHtml =
        hls.currentLevel === -1 || !currentLvl
          ? autoText
          : getResolution(currentLvl);

      // Selector array: Auto (-1) + resolution levels
      const selector = [
        {
          html: autoText,
          level: -1,
          default: hls.currentLevel === -1,
        },
        ...hls.levels.map((lvl, index) => ({
          html: getResolution(lvl),
          level: index,
          default: hls.currentLevel === index,
        })),
      ];

      // Update control bar widget if enabled
      if (options.control !== false && art.controls && typeof art.controls.update === "function") {
        try {
          art.controls.update({
            name: "hls-quality",
            position: "right",
            html: defaultHtml,
            style: { padding: "0 10px" },
            selector,
            onSelect: (item) => {
              if (hls && typeof item.level === "number") {
                hls.currentLevel = item.level;
                if (art.loading && typeof art.loading.show === "boolean") {
                  art.loading.show = true;
                }
              }
              return item.html;
            },
          });
        } catch {
          // Fallback gracefully
        }
      }

      // Update settings menu widget if enabled
      if (options.setting !== false && art.setting && typeof art.setting.update === "function") {
        try {
          art.setting.update({
            name: "hls-quality",
            tooltip: defaultHtml,
            html: titleText,
            width: 200,
            selector,
            onSelect: (item) => {
              if (hls && typeof item.level === "number") {
                hls.currentLevel = item.level;
                if (art.loading && typeof art.loading.show === "boolean") {
                  art.loading.show = true;
                }
              }
              return item.html;
            },
          });
        } catch {
          // Fallback gracefully
        }
      }
    }

    // Attach listeners
    art.on("ready", updateQuality);
    art.on("restart", updateQuality);

    // Watch for Hls level events
    const checkHlsInterval = setInterval(() => {
      const hls = getHls();
      if (hls && typeof hls.on === "function") {
        clearInterval(checkHlsInterval);
        try {
          hls.on("hlsManifestParsed", updateQuality);
          hls.on("hlsLevelSwitched", updateQuality);
        } catch {
          // Ignore event attachment errors
        }
      }
    }, 500);

    art.on("destroy", () => {
      clearInterval(checkHlsInterval);
    });

    return {
      name: "safeHlsQualityPlugin",
      update: updateQuality,
    };
  };
}
