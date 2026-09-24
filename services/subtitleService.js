/**
 * Tenro Subtitle Service
 * Normalizes subtitle formats, formats language labels, and ensures reliable loading.
 */

import { streamingService } from "./streamingService";

export const subtitleService = {
  /**
   * Normalizes subtitle list from streaming provider.
   */
  normalizeSubtitles(rawSubtitles = [], providerHeaders = {}) {
    if (!Array.isArray(rawSubtitles)) return [];

    return rawSubtitles
      .filter((sub) => sub?.url && typeof sub.url === "string")
      .map((sub) => {
        const rawFormat = String(sub.format || "").toLowerCase().replace(/^\./, "");
        let format = "vtt";
        if (["ass", "ssa", "srt", "vtt"].includes(rawFormat)) {
          format = rawFormat;
        } else {
          const match = sub.url.match(/\.([^./?#]+)(?:[?#].*)?$/i);
          const ext = match?.[1]?.toLowerCase();
          if (["ass", "ssa", "srt", "vtt"].includes(ext)) {
            format = ext;
          }
        }

        const rawLang = String(sub.language || sub.label || "en").toLowerCase();
        let label = sub.label || sub.language || "English";
        if (rawLang.startsWith("eng") || rawLang === "en") label = "English";
        else if (rawLang.startsWith("spa") || rawLang === "es") label = "Spanish";
        else if (rawLang.startsWith("fre") || rawLang.startsWith("fra") || rawLang === "fr") label = "French";
        else if (rawLang.startsWith("ger") || rawLang.startsWith("deu") || rawLang === "de") label = "German";
        else if (rawLang.startsWith("ita") || rawLang === "it") label = "Italian";
        else if (rawLang.startsWith("por") || rawLang === "pt") label = "Portuguese";
        else if (rawLang.startsWith("rus") || rawLang === "ru") label = "Russian";
        else if (rawLang.startsWith("ara") || rawLang === "ar") label = "Arabic";
        else if (rawLang.startsWith("jpn") || rawLang === "ja") label = "Japanese";

        // Proxy external subtitle files to bypass CORS / Hotlink protections
        const proxiedUrl = streamingService.buildProxyUrl(sub.url, providerHeaders);

        return {
          url: proxiedUrl,
          rawUrl: sub.url,
          format,
          language: rawLang,
          label: sub.label && sub.label !== rawLang ? sub.label : label,
          default: Boolean(sub.default),
        };
      });
  },
};

export default subtitleService;
