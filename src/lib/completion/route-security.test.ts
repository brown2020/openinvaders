import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const routeFile = path.join(here, "../../app/api/completion/route.ts");

describe("completion route security", () => {
  it("defers OpenAI client init and tolerates missing secrets", () => {
    const src = fs.readFileSync(routeFile, "utf8");
    assert.match(src, /createOpenAI/);
    assert.match(src, /await import\(["']@ai-sdk\/openai["']\)/);
    assert.equal(/import\s+\{\s*openai\s*\}/.test(src), false);
    assert.match(src, /OPENAI_API_KEY/);
    assert.match(src, /OPENAI_API_KEY/);
    assert.equal(/sk-[a-zA-Z0-9]{10,}/.test(src), false);
    assert.match(src, /parseCompletionRequest/);
  });

  it("does not embed API key literals", () => {
    const src = fs.readFileSync(routeFile, "utf8");
    assert.equal(/sk-[a-zA-Z0-9]/.test(src), false);
  });
});
