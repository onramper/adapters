export default interface TransactionResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  baseCurrencyAmount: number;
  quoteCurrencyAmount: null;
  feeAmount: number;
  extraFeeAmount: number;
  areFeesIncluded: boolean;
  status:
    | "waitingPayment"
    | "pending"
    | "waitingAuthorization"
    | "completed"
    | "failed";
  failureReason: null | string;
  walletAddress: string;
  walletAddressTag: null;
  cryptoTransactionId: null;
  returnUrl: string;
  redirectUrl: null | string;
  baseCurrencyId: string;
  currencyId: string;
  customerId: string;
  cardId: string;
  bankAccountId: null;
  bankDepositInformation: null;
  bankTransferReference: null;
  eurRate: number;
  usdRate: number;
  gbpRate: number;
  externalTransactionId: null;
}
