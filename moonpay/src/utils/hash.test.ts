import { scryptSync } from "crypto";

// Polyfill unsupported browser globals in Jest
import { TextEncoder, TextDecoder } from "util";
import hash, { salt } from "./hash";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

test("hash snapshot", async () => {
  const hashed = await hash("a@gmail.com");
  expect(hashed).toMatchInlineSnapshot(`
    "ĺ���R!�D��k�U�O�]��ܪ���&Es9�,
    	H�;M�	�%�m��
    P�0�I�i"
  `);
});

test("different emails return different hashes", async () => {
  expect(await hash("abc")).not.toBe(await hash("cba"));
});

test("always returns the same hash when given the same values", async () => {
  const hash1 = await hash("abc");
  const hash2 = await hash("abc");
  expect(hash1).toBe(hash2);
});

test("matches node's scryptSync from the 'crypto' library", async () => {
  const message = "hash_me";
  expect(await hash(message)).toEqual(scryptSync(message, salt, 64).toString());
});
