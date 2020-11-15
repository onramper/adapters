import { publishableApiKey } from "./constants";

test("publishableApiKey gets the right key", () => {
  expect(publishableApiKey("pk_prod_MOCK")).toContain("live");
  expect(publishableApiKey("pk_test_MOCK")).toContain("test");
});
