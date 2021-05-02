import { moonpayBaseAPI } from "./constants";
import { nextStep } from "./utils/types";
import fetch from "./utils/fetch";
import ddb from "./utils/dynamodb";
import roundUp from "./utils/roundUp";
import { getCreationTx } from "./KYC/dynamoTxs";
import { StepError } from "./errors";
import { getPartnerContext } from "./index";

interface BankResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  iban: string | null;
  bic: string | null;
  accountNumber: string | null;
  sortCode: string | null;
  bankName: string;
  currencyId: string;
  customerId: string;
}

type CreateBankResponse = BankResponse;
type GetBanksResponse = BankResponse[];

interface CreateBankTransactionResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  baseCurrencyAmount: number;
  quoteCurrencyAmount: null;
  feeAmount: number;
  extraFeeAmount: number;
  areFeesIncluded: boolean;
  status: "waitingPayment";
  failureReason: null;
  walletAddress: string;
  walletAddressTag: null;
  cryptoTransactionId: null;
  returnUrl: null;
  redirectUrl: null;
  baseCurrencyId: string;
  currencyId: string;
  customerId: string;
  cardId: null;
  bankAccountId: string;
  bankDepositInformation: {
    iban: string;
    bic: string;
    bankName: string;
    bankAddress: string;
    accountName: string;
    accountAddress: string;
  };
  bankTransferReference: string;
  eurRate: number;
  usdRate: number;
  gbpRate: number;
  externalTransactionId: null;
}

type BankInfo =
  | {
      currencyCode: "eur";
      iban: string;
    }
  | {
      currencyCode: "gbp";
      accountNumber: string;
      sortCode: string;
    };

function findBankId(
  bankInfo: BankInfo,
  bankResponse: GetBanksResponse
): string | undefined {
  return bankResponse.find((bank) => {
    if (bankInfo.currencyCode === "eur") {
      return bank.iban === bankInfo.iban;
    }
    return (
      bank.accountNumber === bankInfo.accountNumber &&
      bank.sortCode === bankInfo.sortCode
    );
  })?.id;
}

export default async function (
  txId: string,
  csrfToken: string,
  bankInfo: BankInfo
): Promise<nextStep> {
  const commonAPIParams = {
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
    },
    credentials: "include",
  } as const;
  try {
    const getBanksResponse = (await fetch(`${moonpayBaseAPI}/bank_accounts`, {
      method: "GET",
      ...commonAPIParams,
    }).then((res) => res.json())) as GetBanksResponse;
    let bankId = findBankId(bankInfo, getBanksResponse);
    if (bankId === undefined) {
      const createBankResponse = (await fetch(
        `${moonpayBaseAPI}/bank_accounts`,
        {
          method: "POST",
          ...commonAPIParams,
          body: JSON.stringify(bankInfo),
        }
      ).then((res) => res.json())) as CreateBankResponse;
      bankId = createBankResponse.id;
    }
    const creationTx = await getCreationTx(txId);

    const partnerContext = getPartnerContext()
      ? `${JSON.stringify(getPartnerContext())}`
      : "";

    const txCreationResponse = (await fetch(`${moonpayBaseAPI}/transactions`, {
      method: "POST",
      ...commonAPIParams,
      body: JSON.stringify({
        baseCurrencyAmount: roundUp(creationTx.fiatAmount, 2),
        extraFeePercentage: creationTx.extraFees,
        areFeesIncluded: true,
        walletAddress: creationTx.cryptocurrencyAddress,
        baseCurrencyCode: bankInfo.currencyCode,
        currencyCode: creationTx.cryptoCurrency.toLowerCase(),
        bankAccountId: bankId,
        externalTransactionId: `${txId};${creationTx.apiKey};${partnerContext}`, // separator ';' added in partnerContext string
      }),
    }).then((res) => res.json())) as CreateBankTransactionResponse;
    ddb.put({
      PK: `tx#${txId}`,
      SK: `complete`,
      Timestamp: Date.now(),
      status: txCreationResponse.status,
    });
    return {
      type: "requestBankTransaction",
      depositBankAccount: txCreationResponse.bankDepositInformation,
      reference: txCreationResponse.bankTransferReference,
      hint: `Transfer ${creationTx.fiatAmount} ${bankInfo.currencyCode} into the bank account provided to complete the transaction. Your transaction must cite the reference '${txCreationResponse.bankTransferReference}' to be valid.`,
    };
  } catch (e) {
    throw new StepError("Bank or currency not supported by Moonpay.", null);
  }
}
