import assert from "node:assert/strict";
import test from "node:test";
import { parseCsv, parseCsvObjects, toCsv } from "./csv";

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

test("parseCsv handles quoted commas, escaped quotes and blank rows", () => {
  assert.deepEqual(
    parseCsv('sku,name\r\nA-1,"Kwame, ""Kofi"""\r\n\r\nB-2,Ama\n'),
    [
      ["sku", "name"],
      ["A-1", 'Kwame, "Kofi"'],
      ["B-2", "Ama"],
    ],
  );
});

test("parseCsvObjects normalizes headers", () => {
  assert.deepEqual(parseCsvObjects("Sale Price,Reorder Level\n45.00,10\n"), [
    { saleprice: "45.00", reorderlevel: "10" },
  ]);
});
