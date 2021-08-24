import fetch from "./utils/fetch";
import { baseAPIUrl, identifier } from "./constants";

export default function (
  token: string,
  onramperApiKey: string,
  step: string,
  data: {
    [param: string]: string | number;
  }
) {
  return fetch(`${baseAPIUrl}/wayPoint/${identifier}/${step}/${token}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: `Basic ${onramperApiKey}`,
    },
  }).catch(() => null);
}
