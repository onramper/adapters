import FetchError from "../../errors/FetchError";

const fetchMock = jest.fn() as jest.Mock<typeof fetch>;

const apiResponses = {
  "https://api.moonpay.io/v3/files/s3_signed_request":
    '{"key":"1596652108131","signedRequest":"https://moonpay-documents.s3-accelerate.amazonaws.com/1596652108131?AWSAccessKeyId=AKIATXOOZY3A25LUDLWI&Content-Type=image%2Fjpeg&Expires=1596652708&Signature=9paR%2BwC5VwMLcpJI5mTXwFnorZo%3D&x-amz-server-side-encryption=AES256"}',
  "https://api.moonpay.io/v3/transactions":
    '{"baseCurrencyAmount":100,"feeAmount":4.99,"extraFeeAmount":0,"areFeesIncluded":false,"status":"waitingAuthorization","walletAddress":"0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2","returnUrl":"https://sandbox.onramper.dev/finished.html","baseCurrencyId":"71435a8d-211c-4664-a59e-2a5361a6c5a7","currencyId":"8d305f63-1fd7-4e01-a220-8445e591aec4","customerId":"b06133f5-e4bc-4295-8c86-4bc0a882b653","eurRate":1,"usdRate":1.179586,"gbpRate":0.90325,"quoteCurrencyAmount":null,"walletAddressTag":null,"cryptoTransactionId":null,"failureReason":null,"redirectUrl":"https://api.moonpay.io/v3/device_authorization?transactionId=70590bd8-0e78-40e1-9086-137d57c2d048&sid=bcc5563c-47b9-4c69-834d-a5232c0a2d46","widgetRedirectUrl":null,"bankTransferReference":null,"cardId":"a9660b8c-97e6-49d9-b265-307b058e8ce2","bankAccountId":null,"bankDepositInformation":null,"externalTransactionId":null,"id":"70590bd8-0e78-40e1-9086-137d57c2d048","createdAt":"2020-08-24T18:59:27.862Z","updatedAt":"2020-08-24T18:59:27.862Z"}',
  "https://api.moonpay.io/v3/customers/email_login":
    '{"preAuthenticated":true,"showTermsOfUse":true}',
  "https://onramper.tech/partner/fees":
    '{"onramper":10,"partner":20,"total":30}',
  "https://onramper.tech/transaction/Moonpay/waypoint_": '{"accepted": true}',
  "https://api.moonpay.io/v3/bank_accounts":
    '{"id":"88888888-d636-4faa-909a-NEW-ID","createdAt":"2019-10-24T08:43:32.013Z","updatedAt":"2019-10-24T08:43:32.013Z","iban":"AT622905300345678901","bic":"OSTBATYYZZZ","accountNumber":null,"sortCode":null,"bankName":"Bank Österreich","currencyId":"71435a8d-211c-4664-a59e-2a5361a6c5a7","customerId":"7138fb07-7c66-4f9a-a83a-a106e66bfde6"}',
  "https://moonpay-documents.s3-accelerate.amazonaws.com/": "",
  "https://api.moonpay.io/v3/files": "",
  "https://api.moonpay.io/v3/customers/me/limits":
    '{"limits":[{"type":"buy_mobile_wallet","dailyLimit":2000,"dailyLimitRemaining":2000,"monthlyLimit":5000,"monthlyLimitRemaining":5000},{"type":"buy_credit_debit_card","dailyLimit":5000,"dailyLimitRemaining":5000,"monthlyLimit":20000,"monthlyLimitRemaining":20000},{"type":"buy_gbp_bank_transfer","dailyLimit":5000,"dailyLimitRemaining":5000,"monthlyLimit":20000,"monthlyLimitRemaining":20000},{"type":"buy_sepa_bank_transfer","dailyLimit":5000,"dailyLimitRemaining":5000,"monthlyLimit":20000,"monthlyLimitRemaining":20000},{"type":"sell_gbp_bank_transfer","dailyLimit":5000,"dailyLimitRemaining":5000,"monthlyLimit":10000,"monthlyLimitRemaining":10000},{"type":"sell_sepa_bank_transfer","dailyLimit":5000,"dailyLimitRemaining":5000,"monthlyLimit":10000,"monthlyLimitRemaining":10000}],"verificationLevels":[{"name":"Level 1","requirements":[{"completed":true,"identifier":"identity_verification"}],"completed":true},{"name":"Level 2","requirements":[{"completed":true,"identifier":"document_verification"},{"completed":true,"identifier":"face_match_verification","showLivenessCheck":true}],"completed":true},{"name":"Level 3","requirements":[{"completed":false,"identifier":"address_verification"}],"completed":false}],"limitIncreaseEligible":true}',
  "https://api.moonpay.io/v3/customers/me":
    '{"id":"5dd1e9bf-2302-42d9-89f4-1969192a00ab","createdAt":"2021-02-14T17:53:59.136Z","updatedAt":"2021-02-14T17:56:09.232Z","firstName":"hala","lastName":"Saja","email":"bentleigh.ezekial@sixdrops.org","walletAddress":null,"phoneNumber":null,"isPhoneNumberVerified":false,"dateOfBirth":"1991-11-11T00:00:00.000Z","liveMode":true,"defaultCurrencyId":"71435a8d-211c-4664-a59e-2a5361a6c5a7","address":{"street":"Hdadqd","subStreet":null,"town":"jaslk","postCode":"433434","state":null,"country":"DEU"}}',
  "https://api.moonpay.io/graphql":
    '{"data":{"networkFeeEstimate":{"fee":0.52,"__typename":"NetworkFeeEstimate"}}}',
};

export function setFetchReturn(data: string, headers?: Map<string, string>) {
  fetchMock.mockImplementationOnce(
    jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(JSON.parse(data)),
      headers: {
        get: (k: string) => headers?.get(k),
      },
    })
  );
}

const singleFailUrls: {
  url: string;
  response: any;
}[] = [];

fetchMock.mockImplementation(
  jest.fn().mockImplementation((url: string) => {
    const indexFailure = singleFailUrls.findIndex((s) => url.startsWith(s.url));
    if (indexFailure !== -1) {
      const res = singleFailUrls[indexFailure].response;
      singleFailUrls.splice(indexFailure, 1);
      throw new FetchError(res);
    }
    for (const [urlStart, response] of Object.entries(apiResponses)) {
      if (url.startsWith(urlStart)) {
        return Promise.resolve({
          text: jest.fn().mockResolvedValue(response),
          json: jest.fn().mockImplementation(() => JSON.parse(response)),
        });
      }
    }
    throw new Error(`url ${url} not in the list of mocked API results`);
  })
);

export function simulateSingleFetchFailure(
  url: string | null = null,
  response?: string
) {
  const parsedResponse = JSON.parse(response ?? "{}");
  if (url === null) {
    fetchMock.mockImplementationOnce(
      jest.fn().mockImplementation(() => {
        throw new FetchError(parsedResponse);
      })
    );
  } else {
    singleFailUrls.push({
      url,
      response: parsedResponse,
    });
  }
}

export default fetchMock;
