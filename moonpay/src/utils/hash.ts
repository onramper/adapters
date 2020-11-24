import { scrypt } from "scrypt-js";

export const salt =
  "6vENsAdhxPX8SBYaE_aF3V8Oc/QRGmyFVLs3VT8vmt6Dg7uY5k41wKnBQCH52JWog1D8r06Ft9AbBHSMtLhqLg==";

function encode(data: string) {
  return new TextEncoder().encode(data);
}

export default async function hash(message: string): Promise<string> {
  try {
    // Use the default parameters of nodejs' scryptSync
    const hashed = await scrypt(encode(message), encode(salt), 16384, 8, 1, 64);
    return new TextDecoder("utf-8").decode(hashed);
  } catch (e) {
    return "unsupported";
  }
}
