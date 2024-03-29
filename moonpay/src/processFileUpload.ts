import {
  publishableApiKey,
  moonpayBaseAPI,
  baseUploadsUrl,
  acceptedContentTypes,
} from "./constants";
import getDocumentHumanName from "./documents/getDocumentHumanName";
import processStep from "./processStep";
import { encodeToken } from "./utils/token";
import { StepError } from "./errors";
import { nextStep } from "./utils/types";
import fetch from "./utils/fetch";

export default async function (
  url: string,
  file: File,
  onramperApiKey: string
): Promise<nextStep> {
  const urlPath = new URL(url).pathname.substr(1);
  const [
    gatewayIdentifier,
    documentType,
    txId,
    alpha3Country,
    token,
    side,
  ] = urlPath.split("/");
  const contentType = file.type;
  if (!acceptedContentTypes.includes(contentType)) {
    throw new StepError(
      "The only 'content-type's accepted are `image/jpeg`, `image/png` and `application/pdf` but this request is none of these",
      null
    );
  }
  const { signedRequest, key } = (await fetch(
    `${moonpayBaseAPI}/files/s3_signed_request?apiKey=${publishableApiKey(
      onramperApiKey
    )}&fileType=${contentType}`
  ).then((res) => res.json())) as {
    key: string;
    signedRequest: string;
  };

  await fetch(signedRequest, {
    method: "PUT",
    body: file,
  });

  const filesEndpointBody: any = {
    key,
    type: documentType,
    country: alpha3Country,
  };
  if (documentType === "proof_of_income") {
    filesEndpointBody.checkReadability = false;
  } else {
    filesEndpointBody.side = side;
  }

  await fetch(`${moonpayBaseAPI}/files`, {
    method: "POST",
    headers: {
      "X-CSRF-TOKEN": token,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(filesEndpointBody),
  });

  if (
    side === "front" &&
    (documentType === "national_identity_card" ||
      documentType === "driving_licence")
  ) {
    return {
      type: "file",
      eventLabel: "documentBack",
      humanName: `${getDocumentHumanName(documentType)} - Back`,
      url: `${baseUploadsUrl}/${gatewayIdentifier}/${documentType}/${txId}/${alpha3Country}/${token}/back`,
      acceptedContentTypes,
    };
  }
  const followingStep = await processStep(
    "getNextKYCStep",
    encodeToken([txId, token]),
    "{}",
    onramperApiKey,
    "" // Country doesn't matter here
  );
  return followingStep;
}
