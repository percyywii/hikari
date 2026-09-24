import test from "node:test";
import assert from "node:assert/strict";
import { isValidSourceShape, normalizeSources, validateSources } from "./source-validation.mjs";

test("normalizes valid HLS and MP4 sources", () => {
  const sources = normalizeSources({
    sources: [
      { url: "https://video.example/master.m3u8", type: "hls" },
      { url: "https://video.example/file.mp4", type: "mp4" },
      { url: "not-a-url", type: "mp4" },
    ],
    subtitles: [{ url: "https://video.example/sub.vtt" }],
  }, "test-provider");

  assert.equal(sources.length, 2);
  assert.equal(sources[0].provider, "test-provider");
  assert.equal(sources[0].type, "hls");
  assert.equal(isValidSourceShape(sources[1]), true);
});

test("rejects source hosts outside the allowlist", async () => {
  const result = await validateSources([
    { url: "https://untrusted.example/file.mp4", type: "mp4" },
  ], { allowedHosts: ["authorized.example"], checkNetwork: false });

  assert.equal(result.sources.length, 0);
  assert.match(result.failures[0].reason, /allowlisted/);
});

test("requires an allowlist in production mode", async () => {
  const result = await validateSources([
    { url: "https://video.example/master.m3u8", type: "hls" },
  ], { requireAllowlist: true, checkNetwork: false });

  assert.equal(result.sources.length, 0);
  assert.match(result.failures[0].reason, /allowlist/);
});
