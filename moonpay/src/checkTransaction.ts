import { getTxAuthToken } from "./KYC/dynamoTxs";
import { moonpayBaseAPI } from "./constants";
import TransactionResponse from "./TransactionResponse";
import { nextStep } from "./utils/types";
import { StepError } from "./errors";

export default async function (
  moonpayTxId: string,
  txId: string
): Promise<nextStep> {
  const authTx = getTxAuthToken(txId);
  const moonpayTx = (await fetch(
    `${moonpayBaseAPI}/transactions/${moonpayTxId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": (await authTx).csrfToken,
      },
      credentials: "include",
    }
  ).then((res) => res.json())) as TransactionResponse;
  if (moonpayTx.status === "completed" || moonpayTx.status === "pending") {
    return {
      type: "completed",
      trackingUrl: `https://buy.moonpay.com/transaction_receipt?transactionId=${moonpayTx.id}`,
    };
  }
  throw new StepError(
    moonpayTx.failureReason ?? "Transaction failed",
    null,
    true
  );
}
