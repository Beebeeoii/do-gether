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

func RetrieveListsByUserId(ownerId string, userId string) ([]interfaces.BasicListData, error) {
	var listsBasicData []interfaces.BasicListData
	var sqlCommand string

	if ownerId == userId {
		sqlCommand = "SELECT id, name, owner, private FROM lists WHERE owner = $1 OR members @> ARRAY[$1]::varchar[]"
	} else {
		sqlCommand = "SELECT id, name, owner, private FROM lists WHERE private = false AND owner = $1 OR members @> ARRAY[$1]::varchar[]"
	}

	rows, queryErr := db.Database.Query(sqlCommand, ownerId)
	if queryErr != nil {
		return listsBasicData, queryErr
	}

	for rows.Next() {
		listBasicData := interfaces.BasicListData{}
		scanErr := rows.Scan(&listBasicData.Id, &listBasicData.Name, &listBasicData.Owner, &listBasicData.Private)
		if scanErr != nil {
			return listsBasicData, scanErr
		}

		listsBasicData = append(listsBasicData, listBasicData)
	}

	rowsErr := rows.Err()
	if rowsErr != nil {
		return listsBasicData, rowsErr
	}

	return listsBasicData, nil
}

func generateUid() string {
	return xid.New().String()
}
