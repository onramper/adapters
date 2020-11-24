import hash from "./hash";

test("hash snapshot", async () => {
  expect(hash("a@gmail.com")).toMatchInlineSnapshot(`
    "ĺ���R!�D��k�U�O�]��ܪ���&Es9�,
    	H�;M�	�%�m��
    P�0�I�i"
  `);
});

test("different emails return different hashes", async () => {
  expect(hash("abc")).not.toBe(hash("cba"));
});

test("always returns the same hash when given the same values", async () => {
  const hash1 = hash("abc");
  const hash2 = hash("abc");
  expect(hash1).toBe(hash2);
});
