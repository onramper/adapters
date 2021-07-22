import extractEnv from "./extractEnv";

test("extraction is done correctly for both prod and test keys", () => {
  expect(extractEnv("pk_test_RANDOM")).toBe("test");
  expect(extractEnv("pk_prod_RANDOM")).toBe("prod");
});

test("an empty api key throws an error", () => {
  expect(() => extractEnv("")).toThrowErrorMatchingInlineSnapshot(
    `"Wrong API Key"`
  );
});

test("if env can't be extracted throw an error", () => {
  expect(() => extractEnv("pk_")).toThrowErrorMatchingInlineSnapshot(
    `"Wrong API Key"`
  );
  expect(() => extractEnv("pk_sa")).toThrowErrorMatchingInlineSnapshot(
    `"Wrong API Key"`
  );
});

test("if the extracted env is neither test nor prod throw an error", () => {
  expect(() => extractEnv("pk_wron_RANDOM")).toThrowErrorMatchingInlineSnapshot(
    `"Wrong API Key"`
  );
});
