import processStep from "./processStep";
import { StepError } from "./errors";
import processFileUpload from "./processFileUpload";
import finishCCTransaction from "./finishCCTransaction";

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

export { finishCCTransaction };
export default async (url: string, body: string | File) => {
  if (await isBrave()) {
    return errorResponse({
      message:
        "Brave's cookie policy is not compatible with Moonpay, please use a different browser",
    });
  }
  try {
    if (body instanceof File) {
      return successResponse(processFileUpload(url, body));
    }
    const [step, token] = url
      .substr("https://api.onramper.dev/transaction/Moonpay/".length)
      .split("/");
    const parsedBody = JSON.parse(body);
    return successResponse(
      await processStep(step, token, parsedBody, "es") // TODO: Pass the country retrieved from params or /gateways
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
