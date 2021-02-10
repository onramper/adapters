import { nextStep, stepDataItems } from "../utils/types";
import {
  moonpayBaseAPI,
  identifier,
  publishableApiKey,
  baseAPIUrl,
} from "../constants";
import { verifyEmailAPIResponse } from "./api";
import { StepError, ApiError, FetchError } from "../errors";
import { encodeToken } from "../utils/token";
import { emailVerifiedTx } from "./dynamoTxs";
import ddb from "../utils/dynamodb";
import getNextKYCStepFromTxIdAndToken from "./getNextKYCStepFromTxIdAndToken";
import fetch from "../utils/fetch";
import * as items from "./items";

export default async function (
  id: string,
  email: string,
  code: string,
  onramperApiKey: string,
  country: string
): Promise<nextStep> {
  let res: verifyEmailAPIResponse;
  try {
    res = await fetch(
      `${moonpayBaseAPI}/customers/email_login?apiKey=${publishableApiKey(
        onramperApiKey
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          securityCode: code,
        }),
      }
    ).then((response) => response.json());
  } catch (e) {
    throw new StepError(
      "The email code has been rejected.",
      items.verifyEmailCodeItem.name
    );
  }
  const customer = res.customer;
  const token = res.csrfToken;
  if (token === undefined) {
    throw new ApiError(
      "Moonpay API has changed and no longer sets cookies on the /customers/email_login endpoint."
    );
  }
  await ddb.put({
    PK: `tx#${id}`,
    SK: `verifyEmail`,
    Timestamp: Date.now(),
    csrfToken: token,
  } as emailVerifiedTx);
  if (
    customer.firstName === null ||
    customer.dateOfBirth === null ||
    customer.address.street === null
  ) {
    const requiredData: stepDataItems = [
      items.firstNameItem,
      items.lastNameItem,
      items.streetItem,
      items.townItem,
      items.postCodeItem,
      items.countryItem,
    ];
    requiredData.push(items.dateOfBirthItem);
    if (country === "us") {
      requiredData.push(items.optionalStateItem);
    }
    return {
      type: "form",
      url: `${baseAPIUrl}/transaction/${identifier}/identity/${encodeToken([
        id,
      ])}`,
      data: requiredData,
    };
  }
  try {
    const nextKYCStep = await getNextKYCStepFromTxIdAndToken(id, token);
    return nextKYCStep;
  } catch (e) {
    if (e instanceof FetchError && e.errorObject.type === "UnauthorizedError") {
      throw new StepError(
        "This browser's cookie policy is not compatible with Moonpay, please use a different browser",
        null
      );
    }
    throw e;
  }
}
