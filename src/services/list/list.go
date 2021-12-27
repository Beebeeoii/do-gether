package service

import (
	"github.com/beebeeoii/do-gether/db"
	"github.com/beebeeoii/do-gether/interfaces"
	"github.com/lib/pq"
	"github.com/rs/xid"
)

func CreateList(name string, ownerId string, private bool) (interfaces.List, error) {
	sqlCommand := "INSERT INTO lists (id, name, owner, private, members) VALUES ($1, $2, $3, $4, $5);"

	newList := interfaces.List{
		Id:      generateUid(),
		Name:    name,
		Owner:   ownerId,
		Private: private,
		Members: []string{},
	}
	_, execErr := db.Database.Exec(sqlCommand, newList.Id, newList.Name, newList.Owner, newList.Private, pq.Array(newList.Members))

	return newList, execErr
}

func generateUid() string {
	return xid.New().String()
}
