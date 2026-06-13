import { describe, it, expect } from "vitest";
import { capitalize, camelCase, kebabCase, snakeCase, startCase, escape, unescape, escapeRegExp } from "../lib/string";

describe("string helpers", () => {
  describe("capitalize", () => {
    it("capitalizes the first character", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("")).toBe("");
    });
  });

  describe("camelCase", () => {
    it("converts strings to camel case", () => {
      expect(camelCase("camelCase")).toBe("camelCase");
      expect(camelCase("some whitespace")).toBe("someWhitespace");
      expect(camelCase("hyphen-text")).toBe("hyphenText");
      expect(camelCase("HTTPRequest")).toBe("httpRequest");
    });

    it("normalizes uppercased words in the rest of the string", () => {
      expect(camelCase("FOO BAR")).toBe("fooBar");
    });
  });

  describe("kebabCase", () => {
    it("converts strings to kebab case", () => {
      expect(kebabCase("camelCase")).toBe("camel-case");
      expect(kebabCase("some whitespace")).toBe("some-whitespace");
      expect(kebabCase("hyphen-text")).toBe("hyphen-text");
      expect(kebabCase("HTTPRequest")).toBe("http-request");
    });
  });

  describe("snakeCase", () => {
    it("converts strings to snake case", () => {
      expect(snakeCase("camelCase")).toBe("camel_case");
      expect(snakeCase("some whitespace")).toBe("some_whitespace");
      expect(snakeCase("hyphen-text")).toBe("hyphen_text");
      expect(snakeCase("HTTPRequest")).toBe("http_request");
    });
  });

  describe("startCase", () => {
    it("converts strings to start case", () => {
      expect(startCase("hello world")).toBe("Hello World");
      expect(startCase("HELLO WORLD")).toBe("Hello World");
      expect(startCase("hello-world")).toBe("Hello World");
      expect(startCase("hello_world")).toBe("Hello World");
    });

    it("ignores leading and trailing whitespace", () => {
      expect(startCase("  hello world  ")).toBe("Hello World");
    });
  });

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
