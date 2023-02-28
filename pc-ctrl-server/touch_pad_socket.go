package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-vgo/robotgo"
	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
)

var upgrader = websocket.Upgrader{}

func errMsg(errs ...error) {
	errStr := ""
	c := 0
	for _, err := range errs {
		if err == nil {
			continue
		}
		c++
		errStr += "- " + err.Error() + "\n"
	}
	log.Println(c, "Error(s) Occured:\n"+errStr)
}

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
	lastTouchTime := -1
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
			if len(info) != 3 {
				errMsg(errors.New("Wrong Data Format"))
				continue
			}

			width, errW := strconv.ParseFloat(info[1], 64)
			height, errH := strconv.ParseFloat(info[2], 64)
			if errW != nil || errH != nil {
				if errW == nil {
					errMsg(errW, errH)
				}
				continue
			}

			phoneDim = [2]int{int(width), int(height)}

		case "START":
			if len(info) != 4 {
				errMsg(errors.New("Wrong Data Format"))
				continue
			}

			starts += 1

			currTime, errConv := strconv.Atoi(info[3])
			if errConv != nil {
				errMsg(errConv)
				continue
			}

			// If more than one finger touched the screen, then do nothing
			if starts > 1 {
				if starts == 2 {
					scrolling = true
				}
				continue
			}

			// Get the time of the last touch and if it's close enough to the current time then hold down left click
			if currTime-lastTouchTime < 200 {
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
				errMsg(errX, errY)
				continue
			}

			startPos = [2]int{int(x), int(y)} // Set the starting position of the touch
			lastTouchTime = currTime          // Set the time of the last touch

		case "MOVING":
			if len(info) != 3 {
				errMsg(errors.New("Wrong Data Format"))
				continue
			}

			// Get the position of the touch after the movement
			tX, errX := strconv.ParseFloat(info[1], 64)
			tY, errY := strconv.ParseFloat(info[2], 64)
			if errX != nil || errY != nil {
				errMsg(errX, errY)
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
				go robotgo.Move(nextX, nextY)
			}
			touchPrevPos = [2]int{int(tX), int(tY)} // Set the new touch previous position

		case "END":
			if len(info) != 4 {
				errMsg(errors.New("Wrong Data Format"))
				continue
			}

			// Get the position of the touch on the phone screen
			x, errX := strconv.ParseFloat(info[1], 64)
			y, errY := strconv.ParseFloat(info[2], 64)
			currTime, errConv := strconv.Atoi(info[3])
			if errConv != nil {
				errMsg(errors.New("Wrong Data Type"))
				continue
			}

			if errX != nil || errY != nil {
				errMsg(errX, errY)
				continue
			}

			// If more than one finger touched the phone screen
			if starts > 1 {
				if starts == 2 {
					if currTime-lastTouchTime < 150 {
						// If there are two touches and they are close enough, then it's a right click
						robotgo.Click("right")
					}
					scrolling = false
					sumY = 0
				}
			} else {
				// If the position of the starting touch and the current touch are at the same spot, then it's a left click
				if startPos[0] == int(x) && startPos[1] == int(y) {
					clickTimer = time.AfterFunc(120*time.Millisecond, func() {
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
