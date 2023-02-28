import { Dimensions } from 'react-native';
import errorMessages from 'constants/ErrorMessages';

export const socketConnect = (url: string, setError: (err: string) => void, onFail: () => void): WebSocket => {
  const socket = new WebSocket(url + '/touchpad');
  socket.onopen = function () {
    const width = Math.max(Dimensions.get('window').height, Dimensions.get('window').width);
    const height = Math.min(Dimensions.get('window').height, Dimensions.get('window').width);
    try {
      socket!.send('ACTIVATED;' + width + ';' + height);
      setError('');
    } catch(e) {
      setError(errorMessages.connectionError);
      onFail();
    }
  }

  socket.onerror = function () {
    setError(errorMessages.connectionError);
    onFail();
  }

  return socket;
}
  
export const socketClose = (socket?: WebSocket) => {
  if(socket) {
      socket.close();
  }
}