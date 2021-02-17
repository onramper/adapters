import FetchError from "../errors/FetchError";

export default function (
  url: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  return fetch(url, init).then(async (res) => {
    if (!res.ok) {
      let error: any;
      try {
        error = await res.json();
      } catch (e) {
        error = await res.text();
      }
      throw new FetchError(error);
    } else {
      return res;
    }
  });
}

export function setFetchReturn(_data: string, _headers?: Map<string, string>) {}
export function simulateSingleFetchFailure(
  _url: string | null = null,
  _response?: string
) {}
