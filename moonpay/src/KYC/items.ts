import { stepDataItems } from "../utils/types";

export type stepItem = stepDataItems[0];

export const dateOfBirthItem: stepItem = {
  type: "date",
  name: "dateOfBirth",
  humanName: "Date of Birth",
  data: [
    {
      type: "integer",
      humanName: "Day",
      name: "day",
    },
    {
      type: "integer",
      humanName: "Month",
      name: "month",
    },
    {
      type: "integer",
      humanName: "Year",
      name: "year",
    },
  ],
};

export const firstNameItem: stepItem = {
  type: "string",
  name: "firstName",
  humanName: "First name",
};

export const lastNameItem: stepItem = {
  type: "string",
  name: "lastName",
  humanName: "Last Name",
};
export const streetItem: stepItem = {
  type: "string",
  name: "street",
  humanName: "Street",
};

export const townItem: stepItem = {
  type: "string",
  name: "town",
  humanName: "City",
};

export const postCodeItem: stepItem = {
  type: "string",
  name: "postCode",
  humanName: "Postal Code",
};

export const countryItem: stepItem = {
  type: "string",
  name: "country",
  humanName: "Country",
};

export const stateItem: stepItem = {
  type: "string",
  name: "state",
  humanName: "State",
};

export const optionalStateItem: stepItem = {
  ...stateItem,
  hint: "Only required if you ",
  required: false,
};

export const emailItem: stepItem = {
  type: "string",
  name: "email",
  humanName: "Email",
  hint: "We will send a code to your email.",
};

export const verifyEmailCodeItem: stepItem = {
  type: "string",
  name: "verifyEmailCode",
  humanName: "Email verification code",
};

export const phoneNumberItem: stepItem = {
  type: "integer",
  name: "phoneNumber",
  humanName: "Phone number",
};

export const phoneCountryCodeItem: stepItem = {
  type: "integer",
  name: "phoneCountryCode",
  humanName: "Country code",
};

export const verifyPhoneCodeItem: stepItem = {
  type: "string",
  name: "verifyPhoneCode",
  humanName: "Phone verification code",
};

export const bankIbanItem: stepItem = {
  type: "string",
  name: "bankIban",
  humanName: "IBAN",
};

export const bankSortCodeItem: stepItem = {
  type: "string",
  name: "bankSortCode",
  humanName: "Sort code",
};

export const bankAccountNumberItem: stepItem = {
  type: "string",
  name: "bankAccountNumber",
  humanName: "Bank account number",
};

export const cryptocurrencyAddress: stepItem = {
  type: "string",
  name: "cryptocurrencyAddress",
  humanName: "Cryptocurrency wallet address",
};

export const transactionId: stepItem = {
  type: "string",
  name: "transactionId",
  humanName: "Transaction Id",
};

export const creditCardTokenId: stepItem = {
  type: "string",
  name: "ccTokenId",
  humanName: "Credit Card Token Id",
};

export const cryptocurrencyAddressTag: stepItem = {
  type: "string",
  name: "cryptocurrencyAddressTag",
  humanName: "Cryptocurrency address tag",
  required: false,
};

export const accountPurpose: stepItem = {
  type: "select",
  name: "accountPurpose",
  humanName: "How do you intend to use Moonpay?",
  required: true,
  options: [
    {
      value: "Beginner",
      humanName: "Beginner seeking investment",
    },
    {
      value: "Trading",
      humanName: "Trading",
    },
    {
      value: "Payments",
      humanName: "Making payments",
    },
    {
      value: "Other",
      humanName: "Other",
    },
  ],
};

export const employmentStatus: stepItem = {
  type: "select",
  name: "employmentStatus",
  humanName: "What is your current employment status?",
  required: true,
  options: [
    {
      value: "Employed",
      humanName: "Employed",
    },
    {
      value: "SelfEmployed",
      humanName: "Self Employed",
    },
    {
      value: "Student",
      humanName: "Student",
    },
    {
      value: "NotEmployed",
      humanName: "Not Employed",
    },
    {
      value: "Retired",
      humanName: "Retired",
    },
  ],
};

export const grossAnnualIncome: stepItem = {
  type: "select",
  name: "grossAnnualIncome",
  humanName: "What is your yearly gross income in EUR?",
  required: true,
  options: [
    {
      value: "LessThan10k",
      humanName: "9,999 EUR or less",
    },
    {
      value: "MoreThan10k",
      humanName: "10,000 - 19,999 EUR",
    },
    {
      value: "MoreThan20k",
      humanName: "20,000 - 39,999 EUR",
    },
    {
      value: "MoreThan40k",
      humanName: "40,000 - 59,999 EUR",
    },
    {
      value: "MoreThan60k",
      humanName: "60,000 - 79,999 EUR",
    },
    {
      value: "MoreThan80k",
      humanName: "80,000 - 99,999 EUR",
    },
    {
      value: "MoreThan100k",
      humanName: "100,000 EUR or more",
    },
  ],
};

export const sourceOfFunds: stepItem = {
  type: "select",
  name: "sourceOfFunds",
  humanName: "What is the origin of funds?",
  required: true,
  options: [
    {
      value: "Salary",
      humanName: "Salary (Personal income)",
    },
    {
      value: "Savings",
      humanName: "Savings",
    },
    {
      value: "Pension",
      humanName: "Pension",
    },
    {
      value: "Investments",
      humanName: "Income from investments",
    },
    {
      value: "Other",
      humanName: "Other",
    },
    {
      value: "Mining",
      humanName: "Mining",
    },
  ],
};

export const annualExpectedActivity: stepItem = {
  type: "select",
  name: "annualExpectedActivity",
  humanName: "What is your annual expected activity on Moonpay?",
  required: true,
  options: [
    {
      value: "LessThan1k",
      humanName: "999 EUR or less",
    },
    {
      value: "MoreThan1k",
      humanName: "1,000 - 9,999 EUR",
    },
    {
      value: "MoreThan10k",
      humanName: "10,000 - 24,999 EUR",
    },
    {
      value: "MoreThan25k",
      humanName: "25,000 EUR or more",
    },
  ],
};
