import StepError from "../../errors/StepError";
import { stepDataItems } from "../types";
import {
  encodeToken,
  safeEncode,
  decodedTokenType,
  decodeToken,
} from "./encodeToken";

export { encodeToken, decodeToken };

export function encodeJson(data: any): string {
  return safeEncode(JSON.stringify(data));
}

export function randomId(): string {
  return Math.random().toString();
}

export function checkTokenTypes<expectedTypes extends decodedTokenType>(
  decodedValues: decodedTokenType,
  sampleValues: expectedTypes
): decodedValues is expectedTypes {
  for (let i = 0; i < sampleValues.length; i += 1) {
    if (typeof decodedValues[i] !== typeof sampleValues[i]) {
      return false;
    }
  }
  return true;
}

function checkInteger(num: any, errorMessage: string, fieldName: string) {
  if (typeof num !== "number") {
    throw new StepError(`${errorMessage} is not a number.`, fieldName);
  }
  if (num % 1 !== 0) {
    throw new StepError(`${errorMessage} is not an integer.`, fieldName);
  }
}

interface RequiredItem {
  required: undefined | boolean;
}

export function checkBodyParams(body: any, keys: stepDataItems) {
  keys.forEach((bodyKey) => {
    if ((bodyKey as RequiredItem).required === false) {
      return;
    }
    const bodyKeyName = bodyKey.name;
    const bodyValue = body[bodyKeyName];
    if (bodyValue === undefined) {
      throw new StepError(
        `Parameter '${bodyKeyName}' is not defined on json body.`,
        bodyKeyName
      );
    }
    if (bodyKey.type === "date") {
      const errorMessage = `Parameter '${bodyKeyName}' is a date, so it should be an object with integer number properties 'day', 'month' and 'year'. However,`;
      if (typeof bodyValue !== "object") {
        throw new StepError(
          `${errorMessage} '${bodyKeyName}' is not an object.`,
          bodyKeyName
        );
      }
      ["day", "month", "year"].forEach((dateKey) =>
        checkInteger(
          bodyValue[dateKey],
          `${errorMessage} property '${dateKey}'`,
          bodyKeyName
        )
      );
    } else if (bodyKey.type === "string") {
      if (typeof bodyValue !== "string") {
        throw new StepError(
          `Parameter '${bodyKeyName}' found on json body is not a string.`,
          bodyKeyName
        );
      }
    } else if (bodyKey.type === "integer") {
      checkInteger(
        bodyValue,
        `Parameter '${bodyKeyName}' found on json body`,
        bodyKeyName
      );
    }
  });
}
