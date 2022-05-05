export type dateInfo = {
  year: number;
  month: number;
  day: number;
};

export type PickOneOption = {
  title: string;
  description?: string;
  icon?: string;
  nextStep: nextStep;
};

export type stepDataItems = Array<
  | {
      type: "select";
      name: string;
      humanName: string;
      options: {
        value: string;
        humanName: string;
      }[];
      hint?: string;
      required?: boolean;
    }
  | {
      type: "string" | "integer";
      humanName: string;
      name: string;
      hint?: string;
      required?: boolean;
    }
  | {
      type: "date";
      name: string;
      humanName: string;
      hint?: string;
      required?: boolean;
      data: [
        {
          type: "integer";
          humanName: "Day";
          name: "day";
        },
        {
          type: "integer";
          humanName: "Month";
          name: "month";
        },
        {
          type: "integer";
          humanName: "Year";
          name: "year";
        }
      ];
    }
  | {
      type: "boolean";
      name: "termsOfUse";
      terms: {
        url: string;
        humanName: string;
      }[];
    }
>;

interface FileStep {
  type: "file";
  humanName: string;
  hint?: string;
  url: string;
  acceptedContentTypes: string[];
}

export type nextStep =
  | {
      type: "iframe";
      url: string;
      fullscreen: boolean;
      neededFeatures?: string;
    }
  | {
      type: "redirect";
      url: string;
      hint?: string;
    }
  | {
      type: "form";
      url: string;
      data: stepDataItems;
      humanName?: string; // TODO: force all forms to have humanName
      hint?: string;
    }
  | FileStep
  | {
      type: "pickOne";
      title: string;
      description?: string;
      options: PickOneOption[];
    }
  | {
      type: "completed";
      trackingUrl: string;
    }
  | {
      type: "wait";
      url: string;
      extraData?: stepDataItems;
    }
  | {
      type: "information";
      message: string;
      url?: string;
      extraData?: stepDataItems;
    }
  | {
      type: "requestBankTransaction";
      depositBankAccount: {
        iban: string;
        bic: string;
        bankName: string;
        bankAddress: string;
        accountName: string;
        accountAddress: string;
      };
      reference: string;
      hint: string;
    };
