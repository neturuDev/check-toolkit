import { describe, it, expect } from "vitest";
import { escape, unescape, escapeRegExp } from "../lib/string";

describe("string helpers", () => {
  describe("escape & unescape", () => {
    it("escapes HTML special characters", () => {
      const original = `& < > " '`;
      expect(escape(original)).toBe("&amp; &lt; &gt; &quot; &#39;");
    });

    it("unescapes HTML entities", () => {
      const encoded = "&amp;&lt;&gt;&quot;&#39;";
      expect(unescape(encoded)).toBe("&<>\"'");
    });

    it("unescape(escape(x)) === x for typical strings", () => {
      const s = `Tom & Jerry <cartoon> "fun" 'yes'`;
      expect(unescape(escape(s))).toBe(s);
    });
  });

  describe("escapeRegExp", () => {
    it("escapes regexp special characters so result can be used as literal", () => {
      const special = `^$.*+?()[\\]{}|`;
      const escaped = escapeRegExp(special);
      const re = new RegExp("^" + escaped + "$");
      expect(re.test(special)).toBe(true);
    });

    it("leaves normal characters unchanged except escaping specials", () => {
      const plain = "abc123";
      expect(escapeRegExp(plain)).toBe(plain);
    });
  });
});
