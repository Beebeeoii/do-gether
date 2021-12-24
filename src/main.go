package main

import (
	"log"
	"os"
	"strconv"

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

	POSTGRES_HOST := os.Getenv("POSTGRES_HOST")
	POSTGRES_PORT, parseErr := strconv.ParseInt(os.Getenv("POSTGRES_PORT"), 10, 64)
	if parseErr != nil {
		log.Fatalln(parseErr)
	}
	POSTGRES_USER := os.Getenv("POSTGRES_USER")
	POSTGRES_PASSWORD := os.Getenv("POSTGRES_PASSWORD")
	psqlDbErr := db.Init(POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD)
	if psqlDbErr != nil {
		log.Fatalln(psqlDbErr)
	}

	router.Init(serverAddress)
}
