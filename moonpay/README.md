## Usage
It works like a fetch mock:
```ts
import processMoonpayStep from '@onramper/moonpay-adapter'

const body = step.type === 'file' ? data as File : JSON.stringify(data)
let nextStep: FetchResponse;
if(/https:\/\/(api|upload).onramper.(dev|com)\/(transaction\/)?Moonpay.*/.test(step.url)){
    nextStep = await processMoonpayStep(step.url, body);
} else {
    nextStep = await fetch(`${step.url}?${urlParams}`, { method, body })
}
return processResponse(nextStep)
```

## Note
Due to Moonpay's cookie policy all operations must be performed from the same origin, meaning that the sandbox that handles credit card payments requires a special workaround that doesn't fit our API response model. Namely, the response from the sandbox must be further processed by client-side code before the next step is provided, so the following code is needed:
```ts
import { finishCCTransaction } from '@onramper/moonpay-adapter'

const receiveMessage = async (event: MessageEvent) => {
  if (event.origin !== baseCreditCardSandboxUrl)
    return;
  if (event.data.type) {
    replaceScreen(event.data)
  } else if (event.data.transactionId) {
    const returnedNextStep = await finishCCTransaction(event.data.transactionId, event.data.ccTokenId);
    replaceScreen(returnedNextStep)
  } else {
    setError('Unknow error. Please, contact help@onramper.com and provide the following info: ' + nextStep.url)
  }
}
window.addEventListener("message", receiveMessage);
```
