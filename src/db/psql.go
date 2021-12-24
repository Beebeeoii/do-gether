package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

const (
	DB_DRIVER = "postgres"
	DB_NAME   = "dogether"
	SSL_MODE  = "disable"
)

func Init(host string, port int64, user string, password string) (err error) {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s", host, port, user, password, DB_NAME, SSL_MODE)
	return connect(psqlInfo)
}

func connect(psqlInfo string) (err error) {
	db, connErr := sql.Open(DB_DRIVER, psqlInfo)
	if connErr != nil {
		return connErr
	}
	defer db.Close()

	pingErr := db.Ping()
	if pingErr != nil {
		return pingErr
	}

	return nil
}
