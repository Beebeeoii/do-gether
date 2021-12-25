package service

import (
	"github.com/beebeeoii/do-gether/db"
	"github.com/beebeeoii/do-gether/interfaces"
	"github.com/lib/pq"
	"github.com/rs/xid"
)

func RetrieveUserHashedPassword(username string) (string, error) {
	var hashedPassword string
	sqlCommand := "SELECT password FROM users WHERE username = $1"

	queryErr := db.Database.QueryRow(sqlCommand, username).Scan(&hashedPassword)

	return hashedPassword, queryErr
}

func CreateUser(username string, hashedPassword string) (interfaces.User, error) {
	sqlCommand := "INSERT INTO users (id, username, password, friends, outgoing_req, incoming_req) VALUES ($1, $2, $3, $4, $5, $6);"

	newUser := interfaces.User{
		Id:           generateUid(),
		Username:     username,
		Friends:      []string{},
		Outgoing_req: []string{},
		Incoming_req: []string{},
	}
	_, execErr := db.Database.Exec(sqlCommand, newUser.Id, newUser.Username, hashedPassword, pq.Array(newUser.Friends), pq.Array(newUser.Outgoing_req), pq.Array(newUser.Incoming_req))

	return newUser, execErr
}

func generateUid() string {
	return xid.New().String()
}
