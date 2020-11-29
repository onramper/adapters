import processStep from "./processStep";
import { StepError } from "./errors";
import processFileUpload from "./processFileUpload";
import finishCCTransaction from "./finishCCTransaction";
import { baseCreditCardSandboxUrl } from "./constants";

const text = () => Promise.resolve("Unused");

function successResponse(nextStep: any) {
  return {
    ok: true,
    json: () => Promise.resolve(nextStep),
    text,
  };
}

function errorResponse(errorObj: { message: string; field?: string }) {
  return {
    ok: false,
    json: () => Promise.resolve(errorObj),
    text,
  };
}

async function isBrave(): Promise<boolean> {
  return (
    (await (navigator as {
      brave?: {
        isBrave: () => Promise<boolean>;
      };
    }).brave?.isBrave()) || false
  );
}

const moonpayUrlRegex = /https:\/\/(api|upload).onramper.(dev|com)\/(transaction\/)?Moonpay.*/;

export { finishCCTransaction, baseCreditCardSandboxUrl, moonpayUrlRegex };
export default async (
  url: string,
  params: {
    method?: string;
    headers: Headers;
    body: string | File;
  }
) => {
  if (await isBrave()) {
    return errorResponse({
      message:
        "Brave's cookie policy is not compatible with Moonpay, please use a different browser",
    });
  }
  try {
    const rawOnramperApiKey = params.headers.get("Authorization");
    if (rawOnramperApiKey === null) {
      return errorResponse({
        message: "Authorization header with API key was not provided",
      });
    }
    const onramperApiKey = rawOnramperApiKey.substr("Basic ".length);
    if (params.body instanceof File) {
      return successResponse(
        processFileUpload(url, params.body, onramperApiKey)
      );
    }
    const [step, token] = url
      .substr("https://api.onramper.dev/transaction/Moonpay/".length)
      .split("/");
    const parsedBody = JSON.parse(params.body);
    return successResponse(
      await processStep(step, token, parsedBody, onramperApiKey, "es") // TODO: Pass the country retrieved from params or /gateways
    );
  } catch (e) {
    if (e instanceof StepError) {
      return errorResponse({
        message: e.message,
        field: e.field,
      });
    }
    return errorResponse({
      message: "Unexpected error happened when handling the request",
    });
  }
};
