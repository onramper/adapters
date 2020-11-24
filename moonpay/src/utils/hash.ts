import { scryptSync } from "crypto";

export default function digestMessage(message: string): string {
  try {
    const salt =
      "6vENsAdhxPX8SBYaE_aF3V8Oc/QRGmyFVLs3VT8vmt6Dg7uY5k41wKnBQCH52JWog1D8r06Ft9AbBHSMtLhqLg==";
    return scryptSync(message, salt, 64).toString();
  } catch (e) {
    return "unsupported";
  }
}
