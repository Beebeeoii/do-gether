package service

import (
	"github.com/beebeeoii/do-gether/db"
	"github.com/lib/pq"
	"github.com/rs/xid"
)

// func RetrieveUserHashedPassword(username string) (string, error) {

// }

func CreateUser(username string, hashedPassword string) error {
	userSql := "INSERT INTO users (id, username, password, friends, outgoing_req, incoming_req) VALUES ($1, $2, $3, $4, $5, $6);"

	_, err := db.Database.Exec(userSql, generateUid(), username, hashedPassword, pq.Array([]string{}), pq.Array([]string{}), pq.Array([]string{}))
	if err != nil {
		return err
	}

	return nil
}

func generateUid() string {
	return xid.New().String()
}
