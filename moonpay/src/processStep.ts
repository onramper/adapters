import { decodeToken, checkTokenTypes, checkBodyParams } from "./utils/token";
import { StepError } from "./errors";
import {
  registerEmail,
  verifyEmail,
  registerPhone,
  verifyPhone,
  registerIdentity,
} from "./KYC";
import { nextStep } from "./utils/types";
import * as items from "./KYC/items";
import getNextKYCStepFromTxIdAndToken from "./KYC/getNextKYCStepFromTxIdAndToken";
import registerBank from "./registerBank";
import sendWaypoint from "./sendWaypoint";
import { setPartnerContext } from "./index";
import processDiligenceVerificationStep, {
  processsEnhancedDiligenceVerificationProofOfIncomeStep,
} from "./KYC/processDiligenceVerificationStep";

// Separated cause it's too bulky
function processIdentityState(
  tokenValues: (string | number)[],
  body: any,
  onramperApiKey: string
) {
  if (
    !checkTokenTypes<
      [
        string,
        string,
        string,
        number,
        number,
        number,
        string,
        string,
        string,
        string
      ]
    >(tokenValues, ["", "", "", 0, 0, 0, "", "", "", ""])
  ) {
    throw new StepError("URL is incorrect.", null);
  }
  const [
    id,
    firstName,
    lastName,
    day,
    month,
    year,
    street,
    town,
    postCode,
    providedCountry,
  ] = tokenValues;
  checkBodyParams(body, [items.stateItem]);
  const state = body[items.stateItem.name];
  if (state === "") {
    throw new StepError(
      `Parameter ${items.stateItem.name} must not be empty.`,
      items.stateItem.name
    );
  }
  return registerIdentity(
    id,
    onramperApiKey,
    firstName,
    lastName,
    { day, month, year },
    street,
    town,
    postCode,
    body[items.stateItem.name],
    providedCountry
  );
}

export default function (
  step: string,
  token: string,
  body: any,
  onramperApiKey: string,
  country: string
): Promise<nextStep> {
  let tokenValues: (string | number)[];
  try {
    tokenValues = decodeToken(token);
  } catch (e) {
    throw new StepError("URL is incorrect.", null);
  }
  if (
    step !== "email" &&
    step !== "identity" &&
    step !== "registerCreditCardToken"
  ) {
    sendWaypoint(tokenValues[0].toString(), onramperApiKey, step, {});
  }
  if (step === "email") {
    setPartnerContext(body.partnerContext);
    if (
      !checkTokenTypes<[string, number, string, string, string]>(tokenValues, [
        "",
        0,
        "",
        "",
        "",
      ])
    ) {
      throw new StepError("URL is incorrect.", null);
    }
    const [
      id,
      amount,
      fiatCurrency,
      cryptoCurrency,
      paymentMethod,
    ] = tokenValues;
    checkBodyParams(body, [
      items.emailItem,
      items.cryptocurrencyAddress,
      items.cryptocurrencyAddressTag,
    ]);
    return registerEmail(
      id,
      amount,
      fiatCurrency,
      cryptoCurrency,
      paymentMethod,
      onramperApiKey,
      body[items.emailItem.name],
      body[items.cryptocurrencyAddress.name],
      body[items.cryptocurrencyAddressTag.name],
      country
    );
  }
  if (step === "verifyEmail") {
    if (!checkTokenTypes<[string, string]>(tokenValues, ["", ""])) {
      throw new StepError("URL is incorrect.", null);
    }
    const [id, email] = tokenValues;
    checkBodyParams(body, [items.verifyEmailCodeItem]);
    return verifyEmail(
      id,
      email,
      body[items.verifyEmailCodeItem.name],
      onramperApiKey,
      country
    );
  }
  if (step === "identity") {
    if (!checkTokenTypes<[string]>(tokenValues, [""])) {
      throw new StepError("URL is incorrect.", null);
    }
    const [id] = tokenValues;
    checkBodyParams(body, [
      items.firstNameItem,
      items.lastNameItem,
      items.dateOfBirthItem,
      items.streetItem,
      items.townItem,
      items.postCodeItem,
      items.countryItem,
    ]); // Doesn't include 'state', it's optional
    return registerIdentity(
      id,
      onramperApiKey,
      body[items.firstNameItem.name],
      body[items.lastNameItem.name],
      body[items.dateOfBirthItem.name],
      body[items.streetItem.name],
      body[items.townItem.name],
      body[items.postCodeItem.name],
      body[items.stateItem.name],
      body[items.countryItem.name]
    );
  }
  if (step === "identityState") {
    return processIdentityState(tokenValues, body, onramperApiKey);
  }
  if (step === "diligenceVerification") {
    return processDiligenceVerificationStep(tokenValues, body, onramperApiKey);
  }
  if (step === "proofOfIncome") {
    return processsEnhancedDiligenceVerificationProofOfIncomeStep(
      tokenValues,
      body,
      onramperApiKey
    );
  }
  if (step === "getNextKYCStep") {
    if (!checkTokenTypes<[string, string]>(tokenValues, ["", ""])) {
      throw new StepError("URL is incorrect.", null);
    }
    const [id, csrfToken] = tokenValues;
    return getNextKYCStepFromTxIdAndToken(id, csrfToken, onramperApiKey);
  }
  if (step === "registerPhone") {
    if (!checkTokenTypes<[string, string]>(tokenValues, ["", ""])) {
      throw new StepError("URL is incorrect.", null);
    }
    const [id, csrfToken] = tokenValues;
    checkBodyParams(body, [items.phoneCountryCodeItem, items.phoneNumberItem]);
    return registerPhone(
      id,
      csrfToken,
      body[items.phoneCountryCodeItem.name],
      body[items.phoneNumberItem.name]
    );
  }
  if (step === "verifyPhone") {
    if (!checkTokenTypes<[string, string]>(tokenValues, ["", ""])) {
      throw new StepError("URL is incorrect.", null);
    }
    const [id, csrfToken] = tokenValues;
    checkBodyParams(body, [items.verifyPhoneCodeItem]);
    return verifyPhone(
      id,
      csrfToken,
      body[items.verifyPhoneCodeItem.name],
      onramperApiKey
    );
  }
  if (step === "registerBank") {
    if (!checkTokenTypes<[string, string, string]>(tokenValues, ["", "", ""])) {
      throw new StepError("URL is incorrect.", null);
    }
    const [id, csrfToken, fiatCurrency] = tokenValues;
    if (fiatCurrency === "EUR") {
      checkBodyParams(body, [items.bankIbanItem]);
      return registerBank(id, csrfToken, {
        currencyCode: "eur",
        iban: body[items.bankIbanItem.name],
      });
    }
    if (fiatCurrency === "GBP") {
      checkBodyParams(body, [
        items.bankSortCodeItem,
        items.bankAccountNumberItem,
      ]);
      return registerBank(id, csrfToken, {
        currencyCode: "gbp",
        accountNumber: body[items.bankAccountNumberItem.name],
        sortCode: body[items.bankSortCodeItem.name],
      });
    }
    throw new StepError("URL is incorrect, unaccepted fiat currency.", null);
  }
  if (step === "registerCreditCardToken") {
    throw new StepError(
      `The last step of the credit card flow, 'registerCreditCardToken', should not be called through the default method, instead it should be called with the function 'finishCCTransaction' that is directly exported from the package. Check the package's readme for more details.`,
      null
    );
  }
  throw new StepError(`Step '${step}' is not defined for Moonpay.`, null);
}
