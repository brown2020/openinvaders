import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  allowAdvisorRequest,
  clientAddress,
  resetAdvisorRateLimit,
} from "./rate-limit";

describe("allowAdvisorRequest", () => {
  beforeEach(() => {
    resetAdvisorRateLimit();
  });

  it("allows a short burst then rejects with retry-after", () => {
    const now = 1_000_000;
    for (let i = 0; i < 8; i++) {
      assert.equal(allowAdvisorRequest("203.0.113.4", now).ok, true);
    }
    const blocked = allowAdvisorRequest("203.0.113.4", now);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.equal(blocked.retryAfterSeconds, 60);
  });

  it("does not let one address consume another address's budget", () => {
    const now = 2_000_000;
    for (let i = 0; i < 8; i++) {
      allowAdvisorRequest("203.0.113.4", now);
    }
    assert.equal(allowAdvisorRequest("203.0.113.5", now).ok, true);
  });

  it("opens the window again after it expires", () => {
    const now = 3_000_000;
    for (let i = 0; i < 8; i++) allowAdvisorRequest("198.51.100.2", now);
    assert.equal(allowAdvisorRequest("198.51.100.2", now).ok, false);
    assert.equal(allowAdvisorRequest("198.51.100.2", now + 60_000).ok, true);
  });
});

describe("clientAddress", () => {
  it("uses the first forwarded address", () => {
    const req = new Request("http://localhost/api/completion", {
      headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" },
    });
    assert.equal(clientAddress(req), "203.0.113.9");
  });

  it("falls back when no forwarding header is present", () => {
    const req = new Request("http://localhost/api/completion");
    assert.equal(clientAddress(req), "unknown");
  });
});
