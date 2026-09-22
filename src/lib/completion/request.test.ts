import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCompletionRequest } from "./request";

describe("parseCompletionRequest", () => {
  it("accepts a trimmed prompt", () => {
    const result = parseCompletionRequest({ prompt: "  hold the left flank  " });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.prompt, "hold the left flank");
  });

  it("rejects empty and oversized prompts", () => {
    assert.equal(parseCompletionRequest({ prompt: "" }).ok, false);
    assert.equal(parseCompletionRequest({ prompt: "x".repeat(2001) }).ok, false);
    assert.equal(parseCompletionRequest({}).ok, false);
  });
});
