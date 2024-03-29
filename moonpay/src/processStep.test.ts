import processStep from "./processStep";
import { encodeToken } from "./utils/token";
import {
  createMockCreationTx,
  createMockTxAuthToken,
} from "./KYC/mockTransactions";

jest.mock("./utils/fetch");

test("processStep() fails if the token is incorrect or doesn't carry the right data", () => {
  // Incorrect token formating
  expect(() =>
    processStep("", "unformatted_token", {}, "pk_prod_MOCK", "es")
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"URL is incorrect."`);
  // Incorrect token data
  expect(() =>
    processStep(
      "email",
      encodeToken(["a", "b", "c", 2]),
      {},
      "pk_prod_MOCK",
      "es"
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"URL is incorrect."`);
  expect(() =>
    processStep("email", encodeToken(["a"]), {}, "pk_prod_MOCK", "es")
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"URL is incorrect."`);
  expect(() =>
    processStep(
      "verifyEmail",
      encodeToken(["a", "b", "c", 2]),
      {},
      "pk_prod_MOCK",
      "es"
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Parameter 'verifyEmailCode' is not defined on json body."`
  );
});

test("if step doesn't exist, a descriptive error is thrown", () => {
  expect(() =>
    processStep("wrong", encodeToken([1]), {}, "pk_prod_MOCK", "es")
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Step 'wrong' is not defined for Moonpay."`
  );
});

test("missing identity data on body results in an error that reports on the missing field", async () => {
  expect(() =>
    processStep(
      "identity",
      encodeToken(["1"]),
      { town: "A" },
      "pk_prod_MOCK",
      "es"
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Parameter 'firstName' is not defined on json body."`
  );
});

test("wrong country triggers an error on /identity", async () => {
  await createMockCreationTx({});
  await createMockTxAuthToken({});
  expect(
    processStep(
      "identity",
      encodeToken(["123"]),
      {
        firstName: "",
        lastName: "",
        dateOfBirth: { day: 1, month: 1, year: 1991 },
        street: "",
        town: "",
        postCode: "",
        country: "WRONG",
      },
      "pk_prod_MOCK",
      "es"
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Country provided is not a valid ISO 3166-1 alpha2 code. Examples of valid codes are 'es' for Spain, 'us' for the USA and 'gb' for Great Britain."`
  );
});

// Tried to do a step while skipping one of the previous ones
