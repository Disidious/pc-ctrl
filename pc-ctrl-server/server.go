package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/gorilla/mux"
)

const port = "9876"

var addr = flag.String("addr", "0.0.0.0:"+port, "http service address")

func GetOutboundIP() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)
	return localAddr.IP.String()
}

func main() {
	router := mux.NewRouter()
	http.Handle("/", router)

	router.HandleFunc("/ping", ping).Methods("GET")
	router.HandleFunc("/playpause", playPause).Methods("GET")
	router.HandleFunc("/backward", backward).Methods("GET")
	router.HandleFunc("/forward", forward).Methods("GET")
	router.HandleFunc("/fullscreen", fullScreen).Methods("GET")
	router.HandleFunc("/shakecursor", shakeCursor).Methods("GET")
	router.HandleFunc("/volup", volUp).Methods("GET")
	router.HandleFunc("/voldown", volDown).Methods("GET")
	router.HandleFunc("/touchpad", touchpad)

	fmt.Println("Server running on", GetOutboundIP())
	log.Fatal(http.ListenAndServe(*addr, nil))

}
