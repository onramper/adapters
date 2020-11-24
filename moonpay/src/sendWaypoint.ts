import fetch from "./utils/fetch";
import { baseAPIUrl, identifier } from "./constants";

export default function (
  id: string,
  onramperApiKey: string,
  step: string,
  data: {
    [param: string]: string | number;
  }
) {
  return fetch(
    `${baseAPIUrl}/transaction/${identifier}/waypoint_${step}/${id}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: `Basic ${onramperApiKey}`,
      },
    }
  ).catch(() => null);
}
