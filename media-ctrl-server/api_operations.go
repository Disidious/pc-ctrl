package main

import (
	"log"
	"net/http"

	"github.com/go-vgo/robotgo"
)

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
	log.Println("Full Screen")
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
