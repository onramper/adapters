import { InternalError } from "../../errors";
import moonpayRegexes from "./moonpayRegexes";

export default function (address: string, cryptocurrency: string): boolean {
  let valid: boolean;
  const regex = moonpayRegexes[cryptocurrency];
  if (regex === undefined) {
    try {
      // We are missing a validator for this currency, accept the address (it will end up being rejected later in the flow if it is incorrect) and notify us about the problem
      throw new InternalError(
        `The moonpay adapter received a request to validate an address from cryptocurrency ${cryptocurrency} but it can't find a proper validator for it`
      );
    } catch (e) {
      valid = true;
    }
  } else {
    valid = regex.test(address);
  }
  return valid;
}
