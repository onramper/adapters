export function replaceAll(
  src: string,
  oldStr: string,
  newStr: string
): string {
  return src.split(oldStr).join(newStr);
}

// Use 'URL and Filename Safe Alphabet' encoding to avoid '/' characters
// See https://tools.ietf.org/html/rfc4648#section-5
export function safeEncode(buf: string) {
  return replaceAll(replaceAll(btoa(buf), "/", "_"), "+", "-");
}

export type decodedTokenType = Array<number | string>;

export function encodeToken(data: decodedTokenType) {
  return safeEncode(JSON.stringify(data));
}

export function decodeToken(token: string): decodedTokenType {
  const base64Token = replaceAll(replaceAll(token, "_", "/"), "-", "+");
  return JSON.parse(atob(base64Token));
}
