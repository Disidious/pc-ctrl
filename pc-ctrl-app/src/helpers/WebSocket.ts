import AppStates from 'constants/AppStates';
import { Dimensions } from 'react-native';

export const socketConnect = (url: string, setState: (status: AppStates) => void, onFail: () => void): WebSocket => {
  const socket = new WebSocket(url + '/touchpad');
  socket.onopen = function () {
    const width = Math.max(Dimensions.get('window').height, Dimensions.get('window').width);
    const height = Math.min(Dimensions.get('window').height, Dimensions.get('window').width);
    try {
      socket!.send('ACTIVATED;' + width + ';' + height);
    } catch(e) {
      setState(AppStates.Unreachable);
      onFail();
    }
  }

  socket.onerror = function () {
    setState(AppStates.Unreachable);
    onFail();
  }

  return socket;
}
  
export const socketClose = (socket?: WebSocket) => {
  if(socket) {
      socket.close();
  }
}