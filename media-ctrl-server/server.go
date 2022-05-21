package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-vgo/robotgo"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "0.0.0.0:9876", "http service address")

var upgrader = websocket.Upgrader{}

func touchpad(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	log.Println("Touch Pad Activated by", r.RemoteAddr)

	defer c.Close()
	defer log.Println("Touch Pad Deactivated")

	phoneDim := [2]int{-1, -1}
	startPos := [2]int{-1, -1}
	lastTouchTIme := time.Now()
	holding := false
	scrolling := false
	sumY := 0
	starts := 0
	var clickTimer *time.Timer
	touchPrevPos := [2]int{-1, -1}

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			break
		}

		info := strings.Split(fmt.Sprintf("%s", message), ";")

		switch info[0] {
		case "ACTIVATED":
			width, errW := strconv.ParseFloat(info[1], 64)
			height, errH := strconv.ParseFloat(info[2], 64)

			if errW != nil || errH != nil {
				log.Println("Erro Occured:", errW, errH)
			}

			phoneDim = [2]int{int(width), int(height)}

		case "START":
			starts += 1

			// If more than one finger touched the screen, then do nothing
			if starts > 1 {
				if starts == 2 {
					scrolling = true
				}
				continue
			}

			// Get the time of the last touch and if it's close enough to the current time then hold down left click
			if time.Now().Sub(lastTouchTIme).Milliseconds() < 200 {
				if clickTimer != nil {
					clickTimer.Stop()
				}
				robotgo.Toggle("left", "up")
				robotgo.Toggle("left")
				holding = true
			}

			// Get the position of the touch on the phone screen
			x, errX := strconv.ParseFloat(info[1], 64)
			y, errY := strconv.ParseFloat(info[2], 64)

			if errX != nil || errY != nil {
				log.Println("Error Occured")
				continue
			}

			startPos = [2]int{int(x), int(y)} // Set the starting position of the touch
			lastTouchTIme = time.Now()        // Set the time of the last touch

		case "MOVING":
			// Get the position of the touch after the movement
			tX, errX := strconv.ParseFloat(info[1], 64)
			tY, errY := strconv.ParseFloat(info[2], 64)
			if errX != nil || errY != nil {
				log.Println("Error Occured:", errX, errY)
				continue
			}

			if touchPrevPos[0] == -1 {
				touchPrevPos = [2]int{int(tX), int(tY)}
				continue
			}

			screenWidth, screenHeight := robotgo.GetScreenSize() // Get the PC's screen size

			// Get the factor of the width and height to translate the position on the phone screen to the PC's
			// Add a fixed number on each factor for extra sensitivity
			fX := (screenWidth / phoneDim[0]) + 2
			fY := (screenHeight / phoneDim[1]) + 2

			// Get the difference of the previous position of the touch with the current position to determine direction
			xDiff := int(tX) - touchPrevPos[0]
			yDiff := int(tY) - touchPrevPos[1]

			if scrolling {
				sumY += yDiff * fY

				scrollY := 0
				if sumY > 50 {
					scrollY = 1
					sumY = 0
				} else if sumY < -50 {
					scrollY = -1
					sumY = 0
				}

				if scrollY != 0 {
					robotgo.Scroll(0, scrollY)
				}
			} else {
				currX, currY := robotgo.GetMousePos() // Get current cursor position
				// Calculate the next cursor position
				nextX := currX + (xDiff * fX)
				nextY := currY + (yDiff * fY)
				robotgo.Move(nextX, nextY) // Move cursor to the new position
			}
			touchPrevPos = [2]int{int(tX), int(tY)} // Set the new touch previous position

		case "END":
			// Get the position of the touch on the phone screen
			x, errX := strconv.ParseFloat(info[1], 64)
			y, errY := strconv.ParseFloat(info[2], 64)

			if errX != nil || errY != nil {
				log.Println("Error Occured")
				continue
			}

			// If more than one finger touched the phone screen
			if starts > 1 {
				if starts == 2 {
					if time.Now().Sub(lastTouchTIme).Milliseconds() < 150 {
						// If there are two touches and they are close enough, then it's a right click
						robotgo.Click("right")
					}
					scrolling = false
					sumY = 0
				}
			} else {
				// If the position of the starting touch and the current touch are at the same spot, then it's a left click
				if startPos[0] == int(x) && startPos[1] == int(y) {
					clickTimer = time.AfterFunc(100*time.Millisecond, func() {
						robotgo.Click()
					})
				}

				// If the left click is being held, release it
				if holding {
					robotgo.Toggle("left", "up")
					holding = false
				}

			}

			touchPrevPos = [2]int{-1, -1}
			starts -= 1

		case "TYPE":
			log.Println("Type:", info[1])

			key := info[1]
			if len(key) > 1 {
				key = strings.ToLower(key)
				if len(robotgo.KeyTap(key)) == 0 {
					continue
				}
			}
			robotgo.TypeStr(key)
		}
	}
}

func main() {
	router := mux.NewRouter()
	http.Handle("/", router)

	router.HandleFunc("/playpause", playPause).Methods("GET")
	router.HandleFunc("/backward", backward).Methods("GET")
	router.HandleFunc("/forward", forward).Methods("GET")
	router.HandleFunc("/fullscreen", fullScreen).Methods("GET")
	router.HandleFunc("/shakecursor", shakeCursor).Methods("GET")
	router.HandleFunc("/volup", volUp).Methods("GET")
	router.HandleFunc("/voldown", volDown).Methods("GET")
	router.HandleFunc("/touchpad", touchpad)

	fmt.Println("Server running on port 9876...")
	log.Fatal(http.ListenAndServe(*addr, nil))

}

func playPause(w http.ResponseWriter, r *http.Request) {
	robotgo.KeyTap("space")
	log.Println("Play/Pause")
}

func backward(w http.ResponseWriter, r *http.Request) {
	robotgo.KeyTap("left")
	log.Println("Backward")
}

func forward(w http.ResponseWriter, r *http.Request) {
	robotgo.KeyTap("right")
	log.Println("Foward")
}

func fullScreen(w http.ResponseWriter, r *http.Request) {
	robotgo.KeyTap("f")
	log.Println("Fullscreen")
}

func shakeCursor(w http.ResponseWriter, r *http.Request) {
	_, mY := robotgo.GetMousePos()
	sX, sY := robotgo.GetScreenSize()

	if mY != sY/2 {
		robotgo.Move(sX/2, sY/2)
	} else {
		robotgo.Move(sX/2, (sY/2)+1)
	}
	log.Println("Shake Cursor")
}

func volUp(w http.ResponseWriter, r *http.Request) {
	robotgo.KeyTap("audio_vol_up")
	log.Println("Volume Up")
}

func volDown(w http.ResponseWriter, r *http.Request) {
	robotgo.KeyTap("audio_vol_down")
	log.Println("Volume Down")
}
