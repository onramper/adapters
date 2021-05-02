## Usage
It works like a fetch mock:
```ts
import processMoonpayStep, { moonpayUrlRegex } from '@onramper/moonpay-adapter'

const method = step.type === 'file' ? 'PUT' : 'POST'
const body = step.type === 'file' ? data as File : JSON.stringify(data)

const nextStepType = step.url.split('/')[5]
let nextStep: FetchResponse;
if (isMoonpayStep(step.url) && nextStepType !== "iframe") {
    nextStep = await processMoonpayStep(step.url, { method, headers, body });
} else {
    nextStep = await fetch(step.url, { method, headers, body })
}
return processResponse(nextStep)
```

## Note
Due to Moonpay's cookie policy all operations must be performed from the same origin, meaning that the sandbox that handles credit card payments requires a special workaround that doesn't fit our API response model. Namely, the response from the sandbox must be further processed by client-side code before the next step is provided, so the following code is needed:
```ts
import { finishCCTransaction, baseCreditCardSandboxUrl } from '@onramper/moonpay-adapter'

const receiveMessage = async (event: MessageEvent) => {
  if (event.origin !== baseCreditCardSandboxUrl)
    return;
  if (event.data.type) {
    replaceScreen(event.data)
  } else if (event.data.transactionId) {
    const returnedNextStep = await finishCCTransaction(event.data.transactionId, event.data.ccTokenId);
    replaceScreen(returnedNextStep)
  } else {
    setError('Unknown error. Please, contact help@onramper.com and provide the following info: ' + nextStep.url)
  }
}
window.addEventListener("message", receiveMessage);
```
