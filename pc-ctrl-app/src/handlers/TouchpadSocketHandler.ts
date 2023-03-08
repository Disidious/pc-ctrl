import { Dimensions } from 'react-native';

class TouchpadSocketHandler {
  private socket: WebSocket;
  private onFail: () => void;

  constructor(url: string, onFail: () => void) {
    this.onFail = onFail;
    this.socket = new WebSocket(url + '/touchpad');

    this.socket.onopen = function () {
      const width = Math.max(Dimensions.get('window').height, Dimensions.get('window').width);
      const height = Math.min(Dimensions.get('window').height, Dimensions.get('window').width);
      this.send('ACTIVATED;' + width + ';' + height);
    }
    this.socket.onerror = this.onFail;
  }

  private send(payload: string) {
    if(this.socket.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.socket.send(payload);
  }

  closeSocket() {
    if(this.socket.readyState !== WebSocket.CLOSED) {
      this.socket.close();
    }
  }

  startTouch(x: number, y: number) {
    this.send('START;' + x + ';' + y + ';' + Date.now());
  }

  moveTouch(x: number, y: number) {
    this.send('MOVING;' + x + ';' + y);
  }

  endTouch(x: number, y: number) {
    this.send('END;' + x + ';' + y + ';' + Date.now());
  }

  type(text: string) {
    this.send('TYPE;' + text);
  }
}

export default TouchpadSocketHandler;