import { StepError } from "../../errors";
import {
  checkBodyParams,
  checkTokenTypes,
  encodeToken,
} from "../../utils/token";
import * as items from "../items";
import getNextKYCStepFromTxIdAndToken from "../getNextKYCStepFromTxIdAndToken";
import { baseAPIUrl, baseUploadsUrl, identifier } from "../../constants";
import { nextStep } from "../../utils/types";
import { sentryHub } from "../getNextKYCStep";

export async function generateDiligenceVerificationStep(
  txId: string,
  fiatCurrency: string,
  token: string
): Promise<nextStep> {
  return {
    type: "form",
    humanName: "Answer some final questions",
    eventLabel: "diligenceVerificationForm",
    hint: "To protect your account, we need to ask you some final questions.",
    url: `${baseAPIUrl}/transaction/${identifier}/diligenceVerification/${encodeToken(
      [txId, fiatCurrency, token]
    )}`,
    data: [
      items.accountPurpose,
      items.employmentStatus,
      items.grossAnnualIncome,
      items.sourceOfFunds,
      items.annualExpectedActivity,
    ],
  };
}

export async function generateEnhancedDiligenceVerificationStep(
  txId: string,
  fiatCurrency: string,
  alpha3Country: string,
  token: string
): Promise<nextStep> {
  return {
    type: "form",
    humanName: "Answer some final questions",
    eventLabel: "proofOfIncomeForm",
    hint: "To protect your account, we need to ask you a few final questions.",
    url: `${baseAPIUrl}/transaction/${identifier}/proofOfIncome/${encodeToken([
      txId,
      fiatCurrency,
      alpha3Country,
      token,
    ])}`,
    data: [items.netWorth, items.profession],
  };
}

export async function processsEnhancedDiligenceVerificationProofOfIncomeStep(
  tokenValues: (string | number)[],
  body: any,
  _onramperApiKey: string
): Promise<nextStep> {
  if (
    !checkTokenTypes<[string, string, string, string]>(tokenValues, [
      "",
      "",
      "",
      "",
    ])
  ) {
    throw new StepError("URL is incorrect.", null);
  }
  const [id, fiatCurrency, alpha3Country, csrfToken] = tokenValues;
  const result = (await fetch(`https://api.moonpay.io/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
    },
    credentials: "include",
    body: JSON.stringify({
      operationName: "updateEnhancedDueDiligence",
      variables: {
        netWorth: body[items.netWorth.name],
        profession: body[items.profession.name],
        currencyCode: fiatCurrency.toLowerCase(),
      },
      query:
        "mutation updateEnhancedDueDiligence($currencyCode: String, $netWorth: NetWorth!, $profession: String!) {\n  updateEnhancedDueDiligence(currencyCode: $currencyCode, netWorth: $netWorth, profession: $profession) {\n    success\n    __typename\n  }\n}\n",
    }),
  })
    .then((res) => res.json())
    .catch((e: any) => {
      throw new StepError(
        `Customer due diligence verification failed: ${e.errors[0].message}`,
        null
      );
    })) as EnhancedDiligenceResponse;
  if (!result.data.updateEnhancedDueDiligence.success) {
    sentryHub.addBreadcrumb({
      message: `updateEnhancedDueDiligence`,
      data: { d: JSON.stringify(result) },
    });
    throw new StepError(
      `Customer due diligence verification failed, please, contact support@onramper.com ${JSON.stringify(
        result
      )}`,
      null
    );
  }

  return {
    type: "file",
    eventLabel: "proofOfIncomeForm",
    humanName: "Proof of income document",
    hint: "You can upload payslips, bank statements, tax returns, etc.",
    url: `${baseUploadsUrl}/${identifier}/proof_of_income/${id}/${alpha3Country}/${csrfToken}`,
    acceptedContentTypes: [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "application/pdf",
    ],
  };
}

interface DiligenceResponse {
  data: {
    updateCustomerDueDiligence: {
      success: boolean;
      __typename: "SuccessPayload";
    };
  };
}

interface EnhancedDiligenceResponse {
  data: {
    updateEnhancedDueDiligence: {
      success: boolean;
      __typename: "SuccessPayload";
    };
  };
}

export default async function (
  tokenValues: (string | number)[],
  body: any,
  onramperApiKey: string
) {
  if (!checkTokenTypes<[string, string, string]>(tokenValues, ["", "", ""])) {
    throw new StepError("URL is incorrect.", null);
  }
  const [id, fiatCurrency, csrfToken] = tokenValues;
  checkBodyParams(body, [
    items.accountPurpose,
    items.employmentStatus,
    items.grossAnnualIncome,
    items.sourceOfFunds,
    items.annualExpectedActivity,
  ]);

  const result = (await fetch(`https://api.moonpay.io/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
    },
    credentials: "include",
    body: JSON.stringify({
      operationName: "updateCustomerDueDiligence",
      variables: {
        accountPurpose: body[items.accountPurpose.name],
        annualExpectedActivity: body[items.annualExpectedActivity.name],
        currencyCode: fiatCurrency.toLowerCase(),
        employmentStatus: body[items.employmentStatus.name],
        grossAnnualIncome: body[items.grossAnnualIncome.name],
        sourceOfFunds: body[items.sourceOfFunds.name],
      },
      query:
        "mutation updateCustomerDueDiligence($currencyCode: String!, $employmentStatus: EmploymentStatus!, $sourceOfFunds: SourceOfFunds!, $accountPurpose: AccountPurpose!, $annualExpectedActivity: AnnualExpectedActivity!, $grossAnnualIncome: GrossAnnualIncome!) {\n  updateCustomerDueDiligence(currencyCode: $currencyCode, employmentStatus: $employmentStatus, sourceOfFunds: $sourceOfFunds, accountPurpose: $accountPurpose, annualExpectedActivity: $annualExpectedActivity, grossAnnualIncome: $grossAnnualIncome) {\n    success\n    __typename\n  }\n}\n",
    }),
  }).then((res) => res.json())) as DiligenceResponse;

  if (!result.data.updateCustomerDueDiligence.success) {
    sentryHub.addBreadcrumb({
      message: `updateCustomerDueDiligence`,
      data: { d: JSON.stringify(result) },
    });
    throw new StepError(
      "Customer due diligence verification failed, please, contact support@onramper.com",
      null
    );
  }

  return getNextKYCStepFromTxIdAndToken(id, csrfToken, onramperApiKey);
}

export async function enhancedDiligenceVerification(
  tokenValues: (string | number)[],
  body: any,
  onramperApiKey: string
) {
  if (!checkTokenTypes<[string, string, string]>(tokenValues, ["", "", ""])) {
    throw new StepError("URL is incorrect.", null);
  }
  const [id, fiatCurrency, csrfToken] = tokenValues;
  checkBodyParams(body, [
    items.accountPurpose,
    items.employmentStatus,
    items.grossAnnualIncome,
    items.sourceOfFunds,
    items.annualExpectedActivity,
  ]);

  const result = (await fetch(`https://api.moonpay.io/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
    },
    credentials: "include",
    body: JSON.stringify({
      operationName: "updateCustomerDueDiligence",
      variables: {
        accountPurpose: body[items.accountPurpose.name],
        annualExpectedActivity: body[items.annualExpectedActivity.name],
        currencyCode: fiatCurrency.toLowerCase(),
        employmentStatus: body[items.employmentStatus.name],
        grossAnnualIncome: body[items.grossAnnualIncome.name],
        sourceOfFunds: body[items.sourceOfFunds.name],
      },
      query:
        "mutation updateCustomerDueDiligence($currencyCode: String!, $employmentStatus: EmploymentStatus!, $sourceOfFunds: SourceOfFunds!, $accountPurpose: AccountPurpose!, $annualExpectedActivity: AnnualExpectedActivity!, $grossAnnualIncome: GrossAnnualIncome!) {\n  updateCustomerDueDiligence(currencyCode: $currencyCode, employmentStatus: $employmentStatus, sourceOfFunds: $sourceOfFunds, accountPurpose: $accountPurpose, annualExpectedActivity: $annualExpectedActivity, grossAnnualIncome: $grossAnnualIncome) {\n    success\n    __typename\n  }\n}\n",
    }),
  }).then((res) => res.json())) as DiligenceResponse;

  if (!result.data.updateCustomerDueDiligence.success) {
    sentryHub.addBreadcrumb({
      message: `updateCustomerDueDiligence`,
      data: { d: JSON.stringify(result) },
    });
    throw new StepError(
      "Customer due diligence verification failed, please, contact support@onramper.com",
      null
    );
  }

  return getNextKYCStepFromTxIdAndToken(id, csrfToken, onramperApiKey);
}
