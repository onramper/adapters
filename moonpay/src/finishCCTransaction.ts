import { moonpayBaseAPI, baseCreditCardSandboxUrl } from "./constants";
import { nextStep } from "./utils/types";
import fetch from "./utils/fetch";
import ddb from "./utils/dynamodb";
import roundUp from "./utils/roundUp";
import { getCreationTx, getTxAuthToken } from "./KYC/dynamoTxs";
import { StepError, FetchError } from "./errors";
import sendWaypoint from "./sendWaypoint";
import TransactionResponse from "./TransactionResponse";
import { getPartnerContext } from "./index";

interface NetworkFeeEstimateResponse {
  data: {
    networkFeeEstimate: {
      fee: number;
      __typename: "NetworkFeeEstimate";
    };
  };
}

export default async function (
  txId: string,
  ccTokenId: string
): Promise<nextStep> {
  try {
    const authTx = getTxAuthToken(txId);
    const creationTx = await getCreationTx(txId);
    const networkFeeRequest = (await fetch(`https://api.moonpay.io/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": (await authTx).csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        operationName: "networkFeeEstimate",
        variables: {
          baseCurrencyCode: creationTx.fiatCurrency.toLowerCase(),
          quoteCurrencyCode: creationTx.cryptoCurrency.toLowerCase(),
          walletAddress: creationTx.cryptocurrencyAddress,
        },
        query:
          "query networkFeeEstimate($baseCurrencyCode: String!, $quoteCurrencyCode: String!, $walletAddress: String!) {\n  networkFeeEstimate(baseCurrencyCode: $baseCurrencyCode, quoteCurrencyCode: $quoteCurrencyCode, walletAddress: $walletAddress) {\n    fee\n    __typename\n  }\n}\n",
      }),
    }).then((res) => res.json())) as NetworkFeeEstimateResponse;

    const partnerContext = getPartnerContext()
      ? `${JSON.stringify(getPartnerContext())}`
      : "";

    const moonpayTx = (await fetch(`${moonpayBaseAPI}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": (await authTx).csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        baseCurrencyAmount: roundUp(creationTx.fiatAmount, 2),
        networkFeeAmount: networkFeeRequest.data.networkFeeEstimate.fee,
        extraFeePercentage: creationTx.extraFees,
        areFeesIncluded: true,
        walletAddress: creationTx.cryptocurrencyAddress,
        walletAddressTag: creationTx.cryptocurrencyAddressTag,
        baseCurrencyCode: creationTx.fiatCurrency.toLowerCase(),
        currencyCode: creationTx.cryptoCurrency.toLowerCase(),
        returnUrl: `${baseCreditCardSandboxUrl}/finished.html?txId=${txId}`,
        tokenId: ccTokenId,
        externalTransactionId: `${txId};${creationTx.apiKey};${partnerContext}`,
      }),
    }).then((res) => res.json())) as TransactionResponse;
    ddb.put({
      PK: `tx#${txId}`,
      SK: `complete`,
      Timestamp: Date.now(),
      status: moonpayTx.status,
      moonpayTxId: moonpayTx.id,
    });
    sendWaypoint(txId, creationTx.apiKey, "registerCreditCardToken", {
      status: moonpayTx.status,
    });
    if (moonpayTx.status === "waitingAuthorization") {
      if (typeof moonpayTx.redirectUrl !== "string") {
        throw new StepError(
          "Transaction cannot go through due to your bank's 2FA",
          null,
          true
        );
      }
      return {
        type: "redirect",
        url: moonpayTx.redirectUrl,
      };
    }
    if (moonpayTx.status === "completed" || moonpayTx.status === "pending") {
      return {
        type: "completed",
        trackingUrl: `https://buy.moonpay.com/transaction_receipt?transactionId=${moonpayTx.id}`,
      };
    }
    throw new StepError(
      moonpayTx.failureReason ?? "Transaction rejected by Moonpay",
      null,
      true
    );
  } catch (e) {
    if (e instanceof FetchError) {
      let errorMessage = e.errorObject.message;
      if (errorMessage === "Wallet address does not match regex") {
        errorMessage =
          "Wallet address does not match regex. Note that if you are using a test API Key only testnet addresses are allowed";
      }
      throw new StepError(`Transaction failed: ${errorMessage}.`, null);
    } else if (e instanceof StepError) {
      throw e;
    } else {
      console.log(e);
      throw new StepError(`Transaction failed for unexpected reasons.`, null);
    }
  }
}
