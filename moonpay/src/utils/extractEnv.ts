import { StepError } from "../errors";

export default function (apiKey: string): "test" | "prod" {
  const env = apiKey.substr("pk_".length, "prod".length);
  if (env === "prod" || env === "test") {
    return env;
  }
  throw new StepError("Wrong API Key", null);
}
