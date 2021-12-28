package service

import (
	"github.com/beebeeoii/do-gether/db"
	"github.com/beebeeoii/do-gether/interfaces"
	utils "github.com/beebeeoii/do-gether/services/utils"
	"github.com/lib/pq"
)

func RetrieveUserHashedPassword(username string) (string, error) {
	var hashedPassword string
	sqlCommand := "SELECT password FROM users WHERE username = $1"

	queryErr := db.Database.QueryRow(sqlCommand, username).Scan(&hashedPassword)

	return hashedPassword, queryErr
}

func RetrieveUserIdByUsername(username string) (string, error) {
	var userId string
	sqlCommand := "SELECT id FROM users WHERE username = $1"

	queryErr := db.Database.QueryRow(sqlCommand, username).Scan(&userId)

	return userId, queryErr
}

func RetrieveUserById(userId string) (interfaces.User, error) {
	var username string
	var friends pq.StringArray
	var outgoing_req pq.StringArray
	var incoming_req pq.StringArray

	sqlCommand := "SELECT username, friends, outgoing_req, incoming_req FROM users WHERE id = $1"

	queryErr := db.Database.QueryRow(sqlCommand, userId).Scan(&username, &friends, &outgoing_req, &incoming_req)

	return interfaces.User{
		Id:           userId,
		Username:     username,
		Friends:      friends,
		Outgoing_req: outgoing_req,
		Incoming_req: incoming_req,
	}, queryErr
}

func CreateUser(username string, hashedPassword string) (interfaces.User, error) {
	sqlCommand := "INSERT INTO users (id, username, password, friends, outgoing_req, incoming_req) VALUES ($1, $2, $3, $4, $5, $6);"

	newUser := interfaces.User{
		Id:           utils.GenerateUid(),
		Username:     username,
		Friends:      []string{},
		Outgoing_req: []string{},
		Incoming_req: []string{},
	}
	_, execErr := db.Database.Exec(sqlCommand, newUser.Id, newUser.Username, hashedPassword, pq.Array(newUser.Friends), pq.Array(newUser.Outgoing_req), pq.Array(newUser.Incoming_req))

	return newUser, execErr
}
