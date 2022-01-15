package main

import (
	"log"
	"os"

	"github.com/beebeeoii/do-gether/db"
	router "github.com/beebeeoii/do-gether/routers"
	"github.com/joho/godotenv"
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

	router.Init(os.Getenv("SERVER_ADD"))
}
