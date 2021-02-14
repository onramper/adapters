import processFileUpload from "./processFileUpload";
import fetchMock from "./utils/fetch";
import { createAllMockTxs } from "./KYC/mockTransactions";

jest.mock("./utils/fetch");

test("parameters are properly retrieved", async () => {
  await createAllMockTxs("123");
  await processFileUpload(
    "https://upload.staging.onramper.tech/Moonpay/passport/123/ESP/sumAuthToken/front",
    new File([""], "b", {
      type: "image/jpeg",
    }),
    "pk_prod_MOCK"
  );
  expect(
    JSON.parse(((fetchMock as unknown) as jest.Mock).mock.calls[2][1].body)
  ).toEqual({
    country: "ESP",
    key: "1596652108131",
    side: "front",
    type: "passport",
  });
});
