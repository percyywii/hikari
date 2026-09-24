const STATUS = {
  HEALTHY: "HEALTHY",
  DEGRADED: "DEGRADED",
  UNAVAILABLE: "UNAVAILABLE",
  RATE_LIMITED: "RATE_LIMITED",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
};

export class ProviderRegistry {
  constructor(providers, options = {}) {
    this.providers = providers;
    this.timeoutMs = options.timeoutMs || 8000;
    this.maxRetries = options.maxRetries ?? 1;
    this.cooldownMs = options.cooldownMs || 30_000;
    this.healthState = new Map(providers.map(({ name }) => [name, {
      provider: name,
      status: STATUS.UNKNOWN,
      lastChecked: null,
      responseTime: null,
      failureCount: 0,
      successCount: 0,
      lastError: null,
      cooldownUntil: null,
    }]));
  }

  availableProviders() {
    const now = Date.now();
    return this.providers.filter((provider) => {
      const state = this.healthState.get(provider.name);
      return provider.enabled !== false && (!state.cooldownUntil || state.cooldownUntil <= now);
    });
  }

  async execute(provider, operation) {
    const state = this.healthState.get(provider.name);
    const startedAt = Date.now();
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        const result = await Promise.race([
          operation(provider.create()),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Provider request timed out")), this.timeoutMs)),
        ]);
        state.status = STATUS.HEALTHY;
        state.lastChecked = new Date().toISOString();
        state.responseTime = Date.now() - startedAt;
        state.successCount += 1;
        state.lastError = null;
        state.cooldownUntil = null;
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 250));
        }
      }
    }

    state.status = classifyFailure(lastError);
    state.lastChecked = new Date().toISOString();
    state.responseTime = Date.now() - startedAt;
    state.failureCount += 1;
    state.lastError = lastError?.message || "Unknown provider error";
    state.cooldownUntil = new Date(Date.now() + this.cooldownMs).toISOString();
    throw lastError;
  }

  health() {
    return [...this.healthState.values()].map((state) => ({ ...state }));
  }
}

export { STATUS };

function classifyFailure(error) {
  const message = error?.message?.toLowerCase() || "";
  if (message.includes("403") || message.includes("forbidden")) return STATUS.BLOCKED;
  if (message.includes("429") || message.includes("rate")) return STATUS.RATE_LIMITED;
  return STATUS.UNAVAILABLE;
}
