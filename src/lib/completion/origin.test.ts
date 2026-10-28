import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSameOrigin } from "./origin";

function request(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/completion", { headers });
}

describe("isSameOrigin", () => {
  it("allows a missing origin and a matching host", () => {
    assert.equal(isSameOrigin(request({})), true);
    assert.equal(
      isSameOrigin(
        request({
          origin: "https://openinvaders.vercel.app",
          "x-forwarded-host": "openinvaders.vercel.app",
        })
      ),
      true
    );
  });

  it("rejects a cross-origin caller", () => {
    assert.equal(
      isSameOrigin(
        request({
          origin: "https://evil.example",
          host: "localhost",
        })
      ),
      false
    );
    assert.equal(
      isSameOrigin(request({ origin: "not a url", host: "localhost" })),
      false
    );
  });
});
