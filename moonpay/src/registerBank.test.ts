import registerBank from "./registerBank";
import fetch, { setFetchReturn } from "./utils/fetch";
import { createAllMockTxs } from "./KYC/mockTransactions";

jest.mock("./utils/fetch");

const fetchMock = (fetch as unknown) as jest.Mock<typeof fetch>;
const txId = "12345";

function mockGetBanks() {
  setFetchReturn(`[
        {
          "id": "74b38e1a-d636-4faa-909a-24e0beeb5b08",
          "createdAt": "2019-10-24T08:43:32.013Z",
          "updatedAt": "2019-10-24T08:43:32.013Z",
          "iban": "AT622905300345678901",
          "bic": "OSTBATYYZZZ",
          "accountNumber": null,
          "sortCode": null,
          "bankName": "Bank Österreich",
          "currencyId": "71435a8d-211c-4664-a59e-2a5361a6c5a7",
          "customerId": "7138fb07-7c66-4f9a-a83a-a106e66bfde6"
        },
        {
          "id": "43851745-533f-4cd0-b6f4-66652f194125",
          "createdAt": "2019-11-05T09:50:02.011Z",
          "updatedAt": "2019-11-05T09:50:02.011Z",
          "iban": null,
          "bic": null,
          "accountNumber": "31247568",
          "sortCode": "531246",
          "bankName": "City of Glasgow Bank",
          "currencyId": "6f424585-8936-4eb1-b01e-443fb306d1f5",
          "customerId": "7138fb07-7c66-4f9a-a83a-a106e66bfde6"
        }
      ]`);
}

beforeEach(async () => {
  jest.clearAllMocks();
  await createAllMockTxs(txId);
});

test("snapshot returned data", async () => {
  mockGetBanks();
  const response = await registerBank(txId, "A_CSRF_TOKEN", {
    currencyCode: "eur",
    iban: "SOME_IBAN",
  });
  // Returned data is wrong because the call to /transaction returns the data of a CC transaction
  // still useful to store the snapshot to catch structural changes
  expect(response).toMatchInlineSnapshot(`
    Object {
      "depositBankAccount": null,
      "hint": "Transfer 100 eur into the bank account provided to complete the transaction. Your transaction must cite the reference 'null' to be valid.",
      "reference": null,
      "type": "requestBankTransaction",
    }
  `);
});

test("if bank has already been introduced use it's id [IBAN] + snapshot of reqs", async () => {
  mockGetBanks();
  await registerBank(txId, "A_CSRF_TOKEN", {
    currencyCode: "eur",
    iban: "AT622905300345678901",
  });
  expect(fetchMock.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "https://api.moonpay.io/v3/bank_accounts",
        Object {
          "credentials": "include",
          "headers": Object {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": "A_CSRF_TOKEN",
          },
          "method": "GET",
        },
      ],
      Array [
        "https://api.moonpay.io/v3/transactions",
        Object {
          "body": "{\\"baseCurrencyAmount\\":100,\\"extraFeePercentage\\":10,\\"areFeesIncluded\\":true,\\"walletAddress\\":\\"0xpleb\\",\\"baseCurrencyCode\\":\\"eur\\",\\"currencyCode\\":\\"btc\\",\\"bankAccountId\\":\\"74b38e1a-d636-4faa-909a-24e0beeb5b08\\",\\"externalTransactionId\\":\\"12345\\"}",
          "credentials": "include",
          "headers": Object {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": "A_CSRF_TOKEN",
          },
          "method": "POST",
        },
      ],
    ]
  `);
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).bankAccountId).toBe(
    "74b38e1a-d636-4faa-909a-24e0beeb5b08"
  );
});

test("if bank has already been introduced use it's id [GBP BANK]", async () => {
  mockGetBanks();
  await registerBank(txId, "A_CSRF_TOKEN", {
    currencyCode: "gbp",
    accountNumber: "31247568",
    sortCode: "531246",
  });
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).bankAccountId).toBe(
    "43851745-533f-4cd0-b6f4-66652f194125"
  );
  expect(fetchMock.mock.calls.length).toBe(2);
});

test("if bank has not been previously registered, create a record of it in moonpay and use the returned id", async () => {
  mockGetBanks();
  await registerBank(txId, "A_CSRF_TOKEN", {
    currencyCode: "eur",
    iban: "NEW_IBAN",
  });
  expect(JSON.parse(fetchMock.mock.calls[2][1].body).bankAccountId).toBe(
    "88888888-d636-4faa-909a-NEW-ID"
  );
  expect(fetchMock.mock.calls.length).toBe(3);
});

test("if no banks are registered for this user, register a new one + snapshot of reqs", async () => {
  setFetchReturn("[]");
  await registerBank(txId, "A_CSRF_TOKEN", {
    currencyCode: "eur",
    iban: "ANOTHER_NEW_IBAN",
  });
  expect(JSON.parse(fetchMock.mock.calls[2][1].body).bankAccountId).toBe(
    "88888888-d636-4faa-909a-NEW-ID"
  );
  expect(fetchMock.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "https://api.moonpay.io/v3/bank_accounts",
        Object {
          "credentials": "include",
          "headers": Object {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": "A_CSRF_TOKEN",
          },
          "method": "GET",
        },
      ],
      Array [
        "https://api.moonpay.io/v3/bank_accounts",
        Object {
          "body": "{\\"currencyCode\\":\\"eur\\",\\"iban\\":\\"ANOTHER_NEW_IBAN\\"}",
          "credentials": "include",
          "headers": Object {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": "A_CSRF_TOKEN",
          },
          "method": "POST",
        },
      ],
      Array [
        "https://api.moonpay.io/v3/transactions",
        Object {
          "body": "{\\"baseCurrencyAmount\\":100,\\"extraFeePercentage\\":10,\\"areFeesIncluded\\":true,\\"walletAddress\\":\\"0xpleb\\",\\"baseCurrencyCode\\":\\"eur\\",\\"currencyCode\\":\\"btc\\",\\"bankAccountId\\":\\"88888888-d636-4faa-909a-NEW-ID\\",\\"externalTransactionId\\":\\"12345\\"}",
          "credentials": "include",
          "headers": Object {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": "A_CSRF_TOKEN",
          },
          "method": "POST",
        },
      ],
    ]
  `);
});
