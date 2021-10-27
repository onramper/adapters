export function publishableApiKey(apiKey: string) {
  return apiKey.substr("pk_".length, "prod".length) === "prod"
    ? "pk_live_MJouyH3Fe3BVaNOaHCt5SvBfJ5Mk7RvQ"
    : "pk_test_PjABKr88VlgosyTueq3exrVnYYLd4ZB";
}
export const moonpayBaseAPI = "https://api.moonpay.io/v3";
// This identifier is also referenced by copy in `infra/src/lambda-edge.ts`, any changes here should also be applied there
export const identifier = "Moonpay";
export const acceptedContentTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];
const domain =
  process.env.STAGE === "prod" ? "onramper.tech" : "staging.onramper.tech";
export const baseCreditCardSandboxUrl = `https://moonpay.sandbox.${domain}`;
export const baseAPIUrl = `https://${domain}`;
export const baseUploadsUrl = `https://upload.${domain}`;
