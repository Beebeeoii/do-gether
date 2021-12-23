package main

import router "github.com/beebeeoii/do-gether/routers"

const (
	serverAddress = "0.0.0.0:8080"
)

func main() {
	router.Init(serverAddress)
}
