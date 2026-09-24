import test from "node:test";
import assert from "node:assert/strict";
import { ProviderRegistry, STATUS } from "./provider-registry.mjs";

test("falls back after a provider failure and records health", async () => {
  const registry = new ProviderRegistry([
    { name: "blocked", create: () => ({}) },
    { name: "healthy", create: () => ({}) },
  ], { maxRetries: 0, cooldownMs: 1000 });

  await assert.rejects(() => registry.execute(registry.providers[0], async () => {
    throw new Error("403 forbidden");
  }));
  const result = await registry.execute(registry.providers[1], async () => ({ ok: true }));

  assert.deepEqual(result, { ok: true });
  assert.equal(registry.health()[0].status, STATUS.BLOCKED);
  assert.equal(registry.health()[1].status, STATUS.HEALTHY);
});

test("applies cooldown after repeated failure", async () => {
  const registry = new ProviderRegistry([
    { name: "offline", create: () => ({}) },
  ], { maxRetries: 0, cooldownMs: 60_000 });

  await assert.rejects(() => registry.execute(registry.providers[0], async () => {
    throw new Error("timeout");
  }));

  assert.equal(registry.availableProviders().length, 0);
});
