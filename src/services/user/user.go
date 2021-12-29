package service

import (
	"fmt"

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

func RetrieveUserByUsername(username string) (interfaces.User, error) {
	var id string
	var friends pq.StringArray

	sqlCommand := "SELECT id, friends FROM users WHERE username = $1"

	queryErr := db.Database.QueryRow(sqlCommand, username).Scan(&id, &friends)

	return interfaces.User{
		Id:           id,
		Username:     username,
		Friends:      friends,
		Outgoing_req: []string{},
		Incoming_req: []string{},
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

func SendFriendRequest(senderId string, recipientId string) error {
	recipientIncomingReq, recipientIncomingErr := RetrievePendingIncomingFriendRequest(recipientId)
	if recipientIncomingErr != nil {
		return recipientIncomingErr
	}
	senderOutgoingReq, senderOutgoingErr := RetrievePendingOutgoingFriendRequest(senderId)
	if senderOutgoingErr != nil {
		return senderOutgoingErr
	}
	doesRequestExist := utils.Contains(recipientIncomingReq, senderId) && utils.Contains(senderOutgoingReq, recipientId)
	if doesRequestExist {
		return fmt.Errorf("request is pending for response")
	}

	recipientOutgoingReq, recipientOutgoingErr := RetrievePendingOutgoingFriendRequest(recipientId)
	if recipientOutgoingErr != nil {
		return recipientOutgoingErr
	}
	senderIncomingReq, senderIncomingErr := RetrievePendingIncomingFriendRequest(senderId)
	if senderIncomingErr != nil {
		return senderIncomingErr
	}
	doesRequestExist = utils.Contains(recipientOutgoingReq, senderId) && utils.Contains(senderIncomingReq, recipientId)
	if doesRequestExist {
		return fmt.Errorf("request is pending for you to accept")
	}

	if !utils.Contains(recipientIncomingReq, senderId) {
		updateIncomingCommand := "UPDATE users SET incoming_req = array_append(incoming_req, $1) WHERE id = $2;"

		_, updateIncomingErr := db.Database.Exec(updateIncomingCommand, senderId, recipientId)
		if updateIncomingErr != nil {
			return updateIncomingErr
		}
	}

	if !utils.Contains(senderOutgoingReq, recipientId) {
		updateOutgoingCommand := "UPDATE users SET outgoing_req = array_append(outgoing_req, $1) WHERE id = $2;"

		_, updateOutgoingErr := db.Database.Exec(updateOutgoingCommand, recipientId, senderId)
		if updateOutgoingErr != nil {
			return updateOutgoingErr
		}
	}

	return nil
}

func AcceptFriendRequest(senderId string, recipientId string) error {
	recipientIncomingReq, retrieveErr := RetrievePendingIncomingFriendRequest(recipientId)
	if retrieveErr != nil {
		return retrieveErr
	}

	senderOutgoingReq, senderOutgoingErr := RetrievePendingOutgoingFriendRequest(senderId)
	if senderOutgoingErr != nil {
		return senderOutgoingErr
	}

	doesRequestExist := utils.Contains(recipientIncomingReq, senderId) && utils.Contains(senderOutgoingReq, recipientId)
	if !doesRequestExist {
		return fmt.Errorf("request is non-existent")
	}

	updateIncomingCommand := "UPDATE users SET incoming_req = array_remove(incoming_req, $1) WHERE id = $2;"
	_, updateIncomingErr := db.Database.Exec(updateIncomingCommand, senderId, recipientId)
	if updateIncomingErr != nil {
		return updateIncomingErr
	}

	updateOutgoingCommand := "UPDATE users SET outgoing_req = array_remove(outgoing_req, $1) WHERE id = $2;"
	_, updateOutgoingErr := db.Database.Exec(updateOutgoingCommand, recipientId, senderId)
	if updateOutgoingErr != nil {
		return updateOutgoingErr
	}

	updateFriendsCommand := "UPDATE users SET friends = array_append(friends, $1) WHERE id = $2;"
	_, updateFriends1Err := db.Database.Exec(updateFriendsCommand, recipientId, senderId)
	if updateFriends1Err != nil {
		return updateFriends1Err
	}
	_, updateFriends2Err := db.Database.Exec(updateFriendsCommand, senderId, recipientId)
	if updateFriends2Err != nil {
		return updateFriends2Err
	}

	return nil
}

func RemoveFriendRequest(userId string, pendingFriendId string) error {
	userIncomingReq, userIncomingErr := RetrievePendingIncomingFriendRequest(userId)
	if userIncomingErr != nil {
		return userIncomingErr
	}
	pendingFriendOutgoingReq, pendingFriendOutgoingErr := RetrievePendingOutgoingFriendRequest(pendingFriendId)
	if pendingFriendOutgoingErr != nil {
		return pendingFriendOutgoingErr
	}
	pendingFriendIncomingReq, pendingFriendIncomingErr := RetrievePendingIncomingFriendRequest(pendingFriendId)
	if pendingFriendIncomingErr != nil {
		return pendingFriendIncomingErr
	}
	userOutgoingReq, userOutgoingErr := RetrievePendingOutgoingFriendRequest(userId)
	if userOutgoingErr != nil {
		return userOutgoingErr
	}

	doesRequestExist := (utils.Contains(userIncomingReq, pendingFriendId) && utils.Contains(pendingFriendOutgoingReq, userId)) || (utils.Contains(pendingFriendIncomingReq, userId) && utils.Contains(userOutgoingReq, pendingFriendId))
	if !doesRequestExist {
		return fmt.Errorf("request is non-existent")
	}

	updateIncomingCommand := "UPDATE users SET incoming_req = array_remove(incoming_req, $1) WHERE id = $2;"
	updateOutgoingCommand := "UPDATE users SET outgoing_req = array_remove(outgoing_req, $1) WHERE id = $2;"

	_, update1Err := db.Database.Exec(updateIncomingCommand, userId, pendingFriendId)
	if update1Err != nil {
		return update1Err
	}
	_, update2Err := db.Database.Exec(updateIncomingCommand, pendingFriendId, userId)
	if update2Err != nil {
		return update2Err
	}
	_, update3Err := db.Database.Exec(updateOutgoingCommand, userId, pendingFriendId)
	if update3Err != nil {
		return update3Err
	}
	_, update4Err := db.Database.Exec(updateOutgoingCommand, pendingFriendId, userId)
	if update4Err != nil {
		return update4Err
	}

	return nil
}

func RemoveFriend(userId string, friendId string) error {
	friends, friendsErr := RetrieveFriends(userId)
	if friendsErr != nil {
		return friendsErr
	}

	isFriend := utils.Contains(friends, friendId)
	if !isFriend {
		return fmt.Errorf("friend is non-existent")
	}

	updateFriendsCommand := "UPDATE users SET friends = array_remove(friends, $1) WHERE id = $2;"
	_, updateFriends1Err := db.Database.Exec(updateFriendsCommand, userId, friendId)
	if updateFriends1Err != nil {
		return updateFriends1Err
	}
	_, updateFriends2Err := db.Database.Exec(updateFriendsCommand, friendId, userId)
	if updateFriends2Err != nil {
		return updateFriends2Err
	}

	return nil
}

func RetrieveFriends(userId string) ([]string, error) {
	var friends pq.StringArray
	sqlCommand := "SELECT friends FROM users WHERE id = $1"

	queryErr := db.Database.QueryRow(sqlCommand, userId).Scan(&friends)

	return friends, queryErr
}

func RetrievePendingOutgoingFriendRequest(userId string) ([]string, error) {
	var outgoing_req pq.StringArray
	sqlCommand := "SELECT outgoing_req FROM users WHERE id = $1"

	queryErr := db.Database.QueryRow(sqlCommand, userId).Scan(&outgoing_req)

	return outgoing_req, queryErr
}

func RetrievePendingIncomingFriendRequest(userId string) ([]string, error) {
	var incoming_req pq.StringArray
	sqlCommand := "SELECT incoming_req FROM users WHERE id = $1"

	queryErr := db.Database.QueryRow(sqlCommand, userId).Scan(&incoming_req)

	return incoming_req, queryErr
}
