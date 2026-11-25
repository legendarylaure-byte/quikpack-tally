import assert from "node:assert/strict";
import test from "node:test";
import { toCsv } from "./csv";

test("CSV export escapes quotes, commas and newlines", () => {
  const csv = toCsv([
    { name: 'Kwame, "Kofi"', note: "line one\nline two" },
    { name: "Ama", note: "" },
  ]);
  assert.equal(
    csv,
    'name,note\r\n"Kwame, ""Kofi""","line one\nline two"\r\nAma,\r\n',
  );
});
