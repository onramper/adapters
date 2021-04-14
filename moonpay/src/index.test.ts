import index, {
  baseCreditCardSandboxUrl,
  finishCCTransaction,
  moonpayUrlRegex,
} from "./index";

test("simple type snapshot of all exports", async () => {
  expect(index).toMatchInlineSnapshot(`[Function]`);
  expect(baseCreditCardSandboxUrl).toMatchInlineSnapshot(
    `"https://moonpay.sandbox.onramper.tech"`
  );
  expect(finishCCTransaction).toMatchInlineSnapshot(`[Function]`);
  expect(moonpayUrlRegex).toMatchInlineSnapshot(
    `/https:\\\\/\\\\/\\(upload\\\\\\.\\)\\?\\(staging\\\\\\.\\)\\?onramper\\\\\\.tech\\\\/\\(transaction\\\\/\\)\\?Moonpay\\.\\*/`
  );
  expect(await import("./index")).toMatchInlineSnapshot(`
    Object {
      "baseCreditCardSandboxUrl": "https://moonpay.sandbox.onramper.tech",
      "checkTransaction": [Function],
      "default": [Function],
      "finishCCTransaction": [Function],
      "getPartnerContext": [Function],
      "moonpayUrlRegex": /https:\\\\/\\\\/\\(upload\\\\\\.\\)\\?\\(staging\\\\\\.\\)\\?onramper\\\\\\.tech\\\\/\\(transaction\\\\/\\)\\?Moonpay\\.\\*/,
      "setPartnerContext": [Function],
    }
  `);
});

test("urlRegex matches the urls being used for Moonpay", () => {
  expect(
    moonpayUrlRegex.test(
      "https://staging.onramper.tech/transaction/Moonpay/email/WyIta1RSTWtyZW82TzU4OG9HYnpyWkhnLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0="
    )
  ).toBe(true);
  expect(
    moonpayUrlRegex.test(
      "https://onramper.tech/transaction/Moonpay/email/WyIta1RSTWtyZW82TzU4OG9HYnpyWkhnLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0="
    )
  ).toBe(true);
  expect(
    moonpayUrlRegex.test(
      "https://upload.onramper.tech/Moonpay/passport/123/ESP/sumAuthToken/front"
    )
  ).toBe(true);
  expect(
    moonpayUrlRegex.test(
      "https://upload.staging.onramper.tech/Moonpay/passport/123/ESP/sumAuthToken/front"
    )
  ).toBe(true);
  expect(
    moonpayUrlRegex.test(
      "https://upload.onramper.com/Moonpay/passport/123/ESP/sumAuthToken/front"
    )
  ).toBe(false);
  expect(
    moonpayUrlRegex.test(
      "https://staging.onramper.tech/transaction/Wyre/createOrder/WyJSV19LR0VGQ3VVQ1lkbGplNV9ycHRBLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0="
    )
  ).toBe(false);
});

jest.mock("./processStep");
test("step and token are selected correctly", async () => {
  const processStepMock = ((await import("./processStep"))
    .default as unknown) as jest.Mock;
  const headers = new Headers();
  headers.set("Authorization", "Basic pk_test_MOCK_API_KEY");
  const params = {
    body: "{}",
    headers,
  };
  await index(
    "https://staging.onramper.tech/transaction/Moonpay/email/WyIta1RSTWtyZW82TzU4OG9HYnpyWkhnLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0=",
    params
  );
  await index(
    "https://onramper.tech/transaction/Moonpay/email/WyIta1RSTWtyZW82TzU4OG9HYnpyWkhnLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0=",
    params
  );
  expect(processStepMock.mock.calls[0]).toEqual(processStepMock.mock.calls[1]);
  expect(processStepMock.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "email",
      "WyIta1RSTWtyZW82TzU4OG9HYnpyWkhnLS0iLDIwLCJFVVIiLCJCVEMiLCJjcmVkaXRDYXJkIl0=",
      Object {},
      "pk_test_MOCK_API_KEY",
      "es",
    ]
  `);
});
