import processStep, {
  baseCreditCardSandboxUrl,
  finishCCTransaction,
} from "./index";

test("simple type snapshot of all exports", async () => {
  expect(processStep).toMatchInlineSnapshot(`[Function]`);
  expect(baseCreditCardSandboxUrl).toMatchInlineSnapshot(
    `"https://sandbox.onramper.com"`
  );
  expect(finishCCTransaction).toMatchInlineSnapshot(`[Function]`);
  expect(await import("./index")).toMatchInlineSnapshot(`
    Object {
      "baseCreditCardSandboxUrl": "https://sandbox.onramper.com",
      "default": [Function],
      "finishCCTransaction": [Function],
    }
  `);
});
