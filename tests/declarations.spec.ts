import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const libDirUrl = new URL("../lib/", import.meta.url);

/** Relative specifiers in `import`/`export ... from` statements and dynamic `import()` calls. */
const RELATIVE_SPECIFIER = /(?:from\s+|import\s*\(\s*|import\s+)["'](\.{1,2}\/[^"']+)["']/g;

describe("lib relative import specifiers", () => {
  it("use explicit .js extensions (so emitted .d.ts work under node16/nodenext)", () => {
    const missing: string[] = [];

    for (const file of readdirSync(libDirUrl).filter((name) => name.endsWith(".ts"))) {
      const source = readFileSync(new URL(file, libDirUrl), "utf8");

      for (const match of source.matchAll(RELATIVE_SPECIFIER)) {
        if (!match[1].endsWith(".js")) {
          missing.push(`${file}: ${match[1]}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
