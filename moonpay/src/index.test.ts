import processStep, {
  baseCreditCardSandboxUrl,
  finishCCTransaction,
  urlRegex,
} from "./index";

test("simple type snapshot of all exports", async () => {
  expect(processStep).toMatchInlineSnapshot(`[Function]`);
  expect(baseCreditCardSandboxUrl).toMatchInlineSnapshot(
    `"https://sandbox.onramper.com"`
  );
  expect(finishCCTransaction).toMatchInlineSnapshot(`[Function]`);
  expect(urlRegex).toMatchInlineSnapshot(
    `/https:\\\\/\\\\/\\(api\\|upload\\)\\.onramper\\.\\(dev\\|com\\)\\\\/\\(transaction\\\\/\\)\\?Moonpay\\.\\*/`
  );
  expect(await import("./index")).toMatchInlineSnapshot(`
    Object {
      "baseCreditCardSandboxUrl": "https://sandbox.onramper.com",
      "default": [Function],
      "finishCCTransaction": [Function],
      "urlRegex": /https:\\\\/\\\\/\\(api\\|upload\\)\\.onramper\\.\\(dev\\|com\\)\\\\/\\(transaction\\\\/\\)\\?Moonpay\\.\\*/,
    }
  `);
});

test("urlRegex matches the urls being used for Moonpay", () => {
  expect(
    urlRegex.test(
      "https://api.onramper.dev/transaction/Moonpay/email/WyIta1RSTWtyZW82TzU4OG9HYnpyWkhnLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0="
    )
  ).toBe(true);
  expect(
    urlRegex.test(
      "https://api.onramper.com/transaction/Moonpay/email/WyIta1RSTWtyZW82TzU4OG9HYnpyWkhnLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0="
    )
  ).toBe(true);
  expect(
    urlRegex.test(
      "https://upload.onramper.com/Moonpay/passport/123/ESP/sumAuthToken/front"
    )
  ).toBe(true);
  expect(
    urlRegex.test(
      "https://api.onramper.dev/transaction/Wyre/createOrder/WyJSV19LR0VGQ3VVQ1lkbGplNV9ycHRBLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0="
    )
  ).toBe(false);
});
