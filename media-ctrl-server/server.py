from flask import Flask
from flask_socketio import SocketIO
import pyautogui
import logging
from engineio.payload import Payload

Payload.max_decode_packets = 50

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app, log_output=False)

if __name__ == '__main__':
    socketio.run(app)

cursorPrevPos = None
startPos = None
moving = False
pyautogui.FAILSAFE = False

@socketio.on('connect')
def connect(data):
    print('Touch Pad Activated')

@socketio.on('disconnect')
def test_disconnect():
    print('Touch Pad Deactivated')

@socketio.on('touchStart')
def touchStart(data):
    global startPos, moving
    x = data['x']
    y = data['y']
    startPos = [x, y]

    moving = True

@socketio.on('touchEnd')
def touchEnd(data):
    global startPos, cursorPrevPos, moving
    x = data['x']
    y = data['y']

    if [x,y] == startPos:
        pyautogui.click()
        print('Click')

    cursorPrevPos = None
    moving = False

@socketio.on('touchCoords')
def moveCursor(data):
    global cursorPrevPos

    if not moving:
        return

    x = data['x']
    y = data['y']
    width = data['width']
    height = data['height']

    if cursorPrevPos == None:
        cursorPrevPos = [x, y]
        return 

    xDiff = x - cursorPrevPos[0]
    yDiff = y - cursorPrevPos[1]

    screenWidth = pyautogui.size()[0]
    screenHeight = pyautogui.size()[1]

    widthFactor = screenWidth/width
    heightFactor = screenHeight/height
    
    currX = pyautogui.position()[0]
    currY = pyautogui.position()[1]

    nextX = currX + (xDiff * widthFactor)
    nextY = currY + (yDiff * heightFactor)

    cursorPrevPos = [x, y]

    pyautogui.moveTo(nextX, nextY)

@app.route("/pauseplay")
def pauseplay():
    pyautogui.press("space")
    print('Paused/Played')
    return ""

@app.route("/back")
def back():
    pyautogui.press("left")
    print('Backward')
    return ""

@app.route("/forward")
def forward():
    pyautogui.press("right")
    print('Forward')
    return ""

@app.route("/screen")
def screen():
    pyautogui.write("f")
    print('Enter/Exit Full Screen')
    return ""

@app.route("/shakeCursor")
def shakeCursor():
    _, y = pyautogui.position()
    screenWidth = pyautogui.size()[0] / 2
    screenHeight = pyautogui.size()[1] / 2
    if y == screenHeight:
        pyautogui.moveTo(screenWidth, screenHeight + 1)
    else:
        pyautogui.moveTo(screenWidth, screenHeight)
    print('Cursor Shake')
    return ""