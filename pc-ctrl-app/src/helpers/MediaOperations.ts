import errorMessages from "constants/ErrorMessages";

export const mediaOperation = (url: string, setError: (error: string) => void, type: string, setTimer?: (timeout: NodeJS.Timeout) => void, timeout = 200) => {
  setError('')
  switch (type) {
    case 'PLAYPAUSE':
      fetch(url + "/playpause").catch((_) => {
        setError(errorMessages.connectionError);
      })
      break;

    case 'BACKWARD':
      fetch(url + "/backward").catch((_) => {
        setError(errorMessages.connectionError);
      })
      setTimer && setTimer(setTimeout(()=>mediaOperation(url, setError, 'BACKWARD', setTimer, 50), timeout));
      break;

    case 'FORWARD':
      fetch(url + "/forward").catch((_) => {
        setError(errorMessages.connectionError);
      })
      setTimer && setTimer!(setTimeout(()=>mediaOperation(url, setError, 'FORWARD', setTimer, 50), timeout));
      break;

    case 'FULLSCREEN':
      fetch(url + "/fullscreen").catch((_) => {
        setError(errorMessages.connectionError);
      })
      break;

    case 'SHAKECURSOR':
      fetch(url + "/shakecursor").catch((_) => {
        setError(errorMessages.connectionError);
      })
      break;

    case 'VOLUP':
      fetch(url + "/volup").catch((_) => {
        setError(errorMessages.connectionError);
      })
      setTimer && setTimer(setTimeout(()=>mediaOperation(url, setError, 'VOLUP', setTimer, 50), timeout));
      break;

    case 'VOLDOWN':
      fetch(url + "/voldown").catch((_) => {
        setError(errorMessages.connectionError);
      })
      setTimer && setTimer(setTimeout(()=>mediaOperation(url, setError, 'VOLDOWN', setTimer, 50), timeout));
      break;

    default:
      setError(errorMessages.connectionError);
      break;
  }
}