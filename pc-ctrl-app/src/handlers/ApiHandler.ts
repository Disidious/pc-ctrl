import MediaOperations from "constants/MediaOperations";

class ApiHandler {
  url: string
  abortSignal: AbortSignal
  private onSuccess: () => void
  private onFail: () => void
  private holdingTimer: NodeJS.Timeout | undefined
  
  private beforeHoldingDelay = 200
  private holdingDelay = 50

  constructor(url: string, abortSignal: AbortSignal, onSuccess: () => void, onFail: () => void) {
    this.url = url;
    this.abortSignal = abortSignal;
    this.onSuccess = onSuccess;
    this.onFail = onFail;
  }

  private callApi(endpoint: string, hold: boolean = false, delay: number = this.beforeHoldingDelay) {
    fetch(this.url + endpoint, {
      signal: this.abortSignal
    }).then((response) => {
      if(response.ok) {
        this.onSuccess();
      } else {
        this.onFail();
      }
    }).catch(() => {
      this.onFail();
    })

    if(hold) {
      this.holdingTimer = setTimeout(() => this.callApi(endpoint, true, this.holdingDelay), delay);
    }
  }

  setUrl(url: string) {
    this.url = url;
  }

  ping() {
    this.callApi("/ping");
  }

  mediaOperation(operation: MediaOperations) {
    switch (operation) {
      case MediaOperations.PLAYPAUSE:
        this.callApi("/playpause");
        break;
  
      case MediaOperations.BACKWARD:
        this.callApi("/backward", true);
        break;
  
      case MediaOperations.FORWARD:
        this.callApi("/forward", true);
        break;
  
      case MediaOperations.FULLSCREEN:
        this.callApi("/fullscreen");
        break;
  
      case MediaOperations.SHAKECURSOR:
        this.callApi("/shakecursor");
        break;
  
      case MediaOperations.VOLUP:
        this.callApi("/volup", true);
        break;
  
      case MediaOperations.VOLDOWN:
        this.callApi("/voldown", true);
        break;
  
      default:
        this.onFail();
        break;
    }
  }

  unhold() {
    clearTimeout(this.holdingTimer);
  }
}

export default ApiHandler;