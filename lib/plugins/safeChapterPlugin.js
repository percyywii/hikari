/**
 * Safe Chapter Plugin for Artplayer
 * Fixes "Error: Illegal chapter time point" thrown by artplayer-plugin-chapter
 * when intro/outro chapter endpoints exceed or desync from art.duration in HLS streams.
 */

export default function safeChapterPlugin(option = {}) {
  return (art) => {
    const { $player } = art.template;
    const { setStyle, append, clamp, query, isMobile, addClass, removeClass } = art.constructor.utils;

    const html = `
      <div class="art-chapter">
        <div class="art-chapter-inner">
          <div class="art-progress-hover"></div>
          <div class="art-progress-loaded"></div>
          <div class="art-progress-played"></div>
        </div>
      </div>
    `;

    let titleTimer = null;
    let $chapters = [];

    const $progress = art.query(".art-control-progress");
    const $inner = art.query(".art-control-progress-inner");
    if (!$inner) return { name: "artplayerPluginChapter" };

    const $control = append($inner, '<div class="art-chapters"></div>');
    const $title = append($inner, '<div class="art-chapter-title"></div>');

    function showTitle({ $chapter, width }) {
      if (!$title || !$chapter) return;
      const title = $chapter.dataset.title?.trim();
      if (title) {
        setStyle($title, "display", "flex");
        $title.innerText = title;
        const titleWidth = $title.clientWidth;
        if (width <= titleWidth / 2) {
          setStyle($title, "left", 0);
        } else if (width > $inner.clientWidth - titleWidth / 2) {
          setStyle($title, "left", `${$inner.clientWidth - titleWidth}px`);
        } else {
          setStyle($title, "left", `${width - titleWidth / 2}px`);
        }
      } else {
        setStyle($title, "display", "none");
      }
    }

    function update(rawChapters = []) {
      try {
        $chapters = [];
        if ($control) $control.innerText = "";
        removeClass($player, "artplayer-plugin-chapter");

        if (!Array.isArray(rawChapters) || rawChapters.length === 0) return;
        const duration = art.duration;
        if (!duration || duration <= 0 || !Number.isFinite(duration)) return;

        // 1. Sanitize & clamp input chapters safely
        const valid = [];
        for (const ch of rawChapters) {
          if (!ch || typeof ch !== "object") continue;
          let start = Number(ch.start);
          let end = Number(ch.end);
          if (!Number.isFinite(start) || start < 0) continue;
          if (end === Infinity || !Number.isFinite(end) || end > duration) {
            end = duration;
          }
          // Clamp start and end to video duration
          start = Math.max(0, Math.min(start, duration - 0.5));
          end = Math.max(start + 0.5, Math.min(end, duration));

          if (start < end) {
            valid.push({
              start,
              end,
              title: typeof ch.title === "string" ? ch.title : "",
            });
          }
        }

        if (valid.length === 0) return;

        // 2. Sort by start time
        valid.sort((a, b) => a.start - b.start);

        // 3. Resolve overlaps smoothly
        for (let i = 0; i < valid.length - 1; i++) {
          if (valid[i].end > valid[i + 1].start) {
            valid[i].end = valid[i + 1].start;
          }
        }

        // Filter out any zero-duration segments after overlap resolution
        const sanitized = valid.filter((ch) => ch.end - ch.start >= 0.2);
        if (sanitized.length === 0) return;

        // 4. Fill gaps (start from 0, fill between chapters, and end at duration)
        if (sanitized[0].start > 0) {
          sanitized.unshift({ start: 0, end: sanitized[0].start, title: "" });
        }
        if (sanitized[sanitized.length - 1].end < duration) {
          sanitized.push({
            start: sanitized[sanitized.length - 1].end,
            end: duration,
            title: "",
          });
        }
        for (let i = 0; i < sanitized.length - 1; i++) {
          if (sanitized[i].end < sanitized[i + 1].start) {
            sanitized.splice(i + 1, 0, {
              start: sanitized[i].end,
              end: sanitized[i + 1].start,
              title: "",
            });
          }
        }

        // 5. Render chapter segments on progress bar
        $chapters = sanitized.map((chapter) => {
          const $chapter = append($control, html);
          const start = clamp(chapter.start, 0, duration);
          const end = clamp(chapter.end, 0, duration);
          const segDuration = end - start;
          const percentage = segDuration / duration;

          $chapter.dataset.start = start;
          $chapter.dataset.end = end;
          $chapter.dataset.duration = segDuration;
          $chapter.dataset.title = (chapter.title || "").trim();
          $chapter.style.width = `${percentage * 100}%`;

          return {
            $chapter,
            $hover: query(".art-progress-hover", $chapter),
            $loaded: query(".art-progress-loaded", $chapter),
            $played: query(".art-progress-played", $chapter),
          };
        });

        addClass($player, "artplayer-plugin-chapter");
        art.emit("setBar", "loaded", art.loaded || 0);
      } catch (err) {
        console.warn("[Tenro Player] Safely handled chapter points:", err?.message || err);
      }
    }

    art.on("setBar", (type, percentage) => {
      try {
        if (!$chapters.length || !art.duration) return;

        for (let i = 0; i < $chapters.length; i++) {
          const { $chapter, $loaded, $played, $hover } = $chapters[i];
          const $target = { hover: $hover, loaded: $loaded, played: $played }[type];
          if (!$target) return;

          const width = $control.clientWidth * percentage;
          const currentTime = art.duration * percentage;
          const segDuration = parseFloat($chapter.dataset.duration);
          const start = parseFloat($chapter.dataset.start);
          const end = parseFloat($chapter.dataset.end);

          if (currentTime < start) {
            setStyle($target, "width", 0);
          } else if (currentTime > end) {
            setStyle($target, "width", "100%");
          } else if (currentTime >= start && currentTime <= end && segDuration > 0) {
            const p = (currentTime - start) / segDuration;
            setStyle($target, "width", `${p * 100}%`);
            if (isMobile) {
              if (type === "played") {
                showTitle({ $chapter, width });
                clearTimeout(titleTimer);
                titleTimer = setTimeout(() => {
                  setStyle($title, "display", "none");
                }, 500);
              }
            } else if (type === "hover") {
              showTitle({ $chapter, width });
            }
          }
        }
      } catch {}
    });

    if (!isMobile && $progress) {
      art.proxy($progress, "mouseleave", () => {
        if ($chapters.length && $title) setStyle($title, "display", "none");
      });
    }

    art.once("video:loadedmetadata", () => {
      update(option.chapters);
    });

    art.on("video:durationchange", () => {
      update(option.chapters);
    });

    return {
      name: "artplayerPluginChapter",
      update: ({ chapters } = {}) => update(chapters),
    };
  };
}
