import processStep from "./processStep";
import { InternalError, StepError } from "./errors";
import processFileUpload from "./processFileUpload";
import finishCCTransaction from "./finishCCTransaction";
import checkTransaction from "./checkTransaction";
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

const moonpayUrlRegex = /https:\/\/(upload\.)?(staging\.)?onramper\.tech\/(transaction\/)?Moonpay.*/;

type PartnerContext = { [key: string]: any } | "";
let pContext: PartnerContext;

const setPartnerContext = (partnerContext: PartnerContext) => {
  pContext = partnerContext ?? "";
};

const getPartnerContext = () => {
  return pContext;
};

export {
  finishCCTransaction,
  baseCreditCardSandboxUrl,
  moonpayUrlRegex,
  checkTransaction,
  setPartnerContext,
  getPartnerContext,
};
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
    const urlObj = new URL(url);
    const [step, token] = urlObj.pathname.split("/").splice(3);
    const country = urlObj.searchParams.get("country");
    const parsedBody = JSON.parse(params.body);
    return successResponse(
      await processStep(
        step,
        token,
        parsedBody,
        onramperApiKey,
        country || "es"
      ) // TODO: Pass the country retrieved from params or /gateways
    );
  } catch (e) {
    if (e instanceof StepError) {
      return errorResponse({
        message: e.message,
        field: e.field,
      });
    }
    // eslint-disable-next-line no-new
    new InternalError(JSON.stringify(e));
    return errorResponse({
      message: `Unexpected error happened when handling the request:`,
    });
  }
};
