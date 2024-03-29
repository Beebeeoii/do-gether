package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	_ "github.com/lib/pq"
)

const (
	DB_DRIVER      = "postgres"
	SSL_MODE       = "disable"
	RETRY_ATTEMPTS = 5
	SLEEP_SECONDS  = 5
)

var Database *sql.DB

func Init() (err error) {
	POSTGRES_HOST := os.Getenv("POSTGRES_HOST")
	POSTGRES_PORT, parseErr := strconv.ParseInt(os.Getenv("POSTGRES_PORT"), 10, 64)
	if parseErr != nil {
		log.Fatalln(parseErr)
	}
	POSTGRES_USER := os.Getenv("POSTGRES_USER")
	POSTGRES_PASSWORD := os.Getenv("POSTGRES_PASSWORD")
	POSTGRES_DB := os.Getenv("POSTGRES_DB")

	log.Println(POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER)

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s", POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, SSL_MODE)

	for i := 0; i < RETRY_ATTEMPTS; i++ {
		connectionErr := connect(psqlInfo)
		if connectionErr != nil {
			log.Printf("attempt %d: retrying psql db connection after %d seconds\n", i, SLEEP_SECONDS)
			time.Sleep(SLEEP_SECONDS * time.Second)
		} else {
			return nil
		}
	}

	return fmt.Errorf("unable to connect to psql db after %d attempts", RETRY_ATTEMPTS)
}

func connect(psqlInfo string) (err error) {
	db, connErr := sql.Open(DB_DRIVER, psqlInfo)
	if connErr != nil {
		return connErr
	}
	Database = db

	pingErr := Database.Ping()
	if pingErr != nil {
		return pingErr
	}

	return nil
}
