package main

import (
	"log"

	"github.com/beebeeoii/do-gether/db"
	router "github.com/beebeeoii/do-gether/routers"
	"github.com/joho/godotenv"
)

const (
	serverAddress = "0.0.0.0:8080"
)

func main() {
	envLoadErr := godotenv.Load()
	if envLoadErr != nil {
		log.Fatalln(envLoadErr)
	}

	psqlDbErr := db.Init()
	if psqlDbErr != nil {
		log.Fatalln(psqlDbErr)
	}

	router.Init(serverAddress)
}
