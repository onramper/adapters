import ddb from "../utils/dynamodb";
import { creationTxType, emailVerifiedTx, createCreationTx } from "./dynamoTxs";

export async function createMockCreationTx(tx: Partial<creationTxType>) {
  await createCreationTx({
    PK: `tx#123`,
    SK: `create`,
    Timestamp: 12340,
    fiatCurrency: "EUR",
    cryptoCurrency: "BTC",
    fiatAmount: 100,
    paymentMethod: "creditCard",
    country: "es",
    cryptocurrencyAddress: "0xpleb",
    apiKey: "pk_test_MOCK",
    extraFees: 10,
    ...tx,
  });
}
export async function createMockTxAuthToken(tx: Partial<emailVerifiedTx>) {
  await ddb.put({
    PK: `tx#123`,
    SK: `verifyEmail`,
    Timestamp: 12345,
    csrfToken: "moonpayCsrfToken",
    ...tx,
  });
}

export async function createAllMockTxs(id: string = "123") {
  await createMockCreationTx({ PK: `tx#${id}` });
  await createMockTxAuthToken({ PK: `tx#${id}` });
}
