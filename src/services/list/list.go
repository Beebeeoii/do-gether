package service

import (
	"github.com/beebeeoii/do-gether/db"
	"github.com/beebeeoii/do-gether/interfaces"
	utils "github.com/beebeeoii/do-gether/services/utils"
	"github.com/lib/pq"
)

func CreateList(name string, ownerId string, private bool) (interfaces.List, error) {
	sqlCommand := "INSERT INTO lists (id, name, owner, private, members) VALUES ($1, $2, $3, $4, $5);"

	newList := interfaces.List{
		Id:      utils.GenerateUid(),
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

func RetrieveListById(listId string) (interfaces.List, error) {
	var list interfaces.List

	sqlCommand := "SELECT id, name, owner, private, members FROM lists WHERE id = $1"

	queryErr := db.Database.QueryRow(sqlCommand, listId).Scan(&list.Id, &list.Name, &list.Owner, &list.Private, pq.Array(&list.Members))
	if queryErr != nil {
		return list, queryErr
	}

	return list, nil
}
