import AppStates from "constants/AppStates";

export const ping = (url: string, abortSignal: AbortSignal, setState: (status: AppStates) => void) => {
  setState(AppStates.Pinging);
  fetch(url + "/ping", {
    signal: abortSignal
  }).then((response) => {
    if(response.ok) {
      setState(AppStates.Reachable);
    } else {
      setState(AppStates.Unreachable);
    }
  }).catch(() => {
    setState(AppStates.Unreachable);
  })
}

export const mediaOperation = (url: string, abortSignal: AbortSignal, setState: (status: AppStates) => void, type: string, setTimer?: (timeout: NodeJS.Timeout) => void, timeout = 200) => {
  switch (type) {
    case 'PLAYPAUSE':
      fetch(url + "/playpause", {
        signal: abortSignal
      }).catch(() => {
        setState(AppStates.Unreachable);
      })
      break;

    case 'BACKWARD':
      fetch(url + "/backward", {
        signal: abortSignal
      }).catch(() => {
        setState(AppStates.Unreachable);
      })
      setTimer && setTimer(setTimeout(()=>mediaOperation(url, abortSignal, setState, 'BACKWARD', setTimer, 50), timeout));
      break;

    case 'FORWARD':
      fetch(url + "/forward", {
        signal: abortSignal
      }).catch(() => {
        setState(AppStates.Unreachable);
      })
      setTimer && setTimer!(setTimeout(()=>mediaOperation(url, abortSignal, setState, 'FORWARD', setTimer, 50), timeout));
      break;

    case 'FULLSCREEN':
      fetch(url + "/fullscreen", {
        signal: abortSignal
      }).catch(() => {
        setState(AppStates.Unreachable);
      })
      break;

    case 'SHAKECURSOR':
      fetch(url + "/shakecursor", {
        signal: abortSignal
      }).catch(() => {
        setState(AppStates.Unreachable);
      })
      break;

    case 'VOLUP':
      fetch(url + "/volup", {
        signal: abortSignal
      }).catch(() => {
        setState(AppStates.Unreachable);
      })
      setTimer && setTimer(setTimeout(()=>mediaOperation(url, abortSignal, setState, 'VOLUP', setTimer, 50), timeout));
      break;

    case 'VOLDOWN':
      fetch(url + "/voldown", {
        signal: abortSignal
      }).catch(() => {
        setState(AppStates.Unreachable);
      })
      setTimer && setTimer(setTimeout(()=>mediaOperation(url, abortSignal, setState, 'VOLDOWN', setTimer, 50), timeout));
      break;

    default:
      setState(AppStates.Unreachable);
      break;
  }
}