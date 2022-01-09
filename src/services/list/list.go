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

func EditList(id string, name string, private bool) (interfaces.List, error) {
	var updatedList interfaces.List
	sqlCommand := "UPDATE lists set name = $1, private = $2 WHERE id = $3 RETURNING *;"

	queryErr := db.Database.QueryRow(
		sqlCommand,
		name,
		private,
		id,
	).Scan(
		&updatedList.Id,
		&updatedList.Name,
		&updatedList.Owner,
		&updatedList.Private,
		pq.Array(&updatedList.Members),
	)

	return updatedList, queryErr
}

func EditListMembers(id string, members []string) (interfaces.List, error) {
	var updatedList interfaces.List
	sqlCommand := "UPDATE lists set members = $1 WHERE id = $2 RETURNING *;"

	queryErr := db.Database.QueryRow(
		sqlCommand,
		pq.Array(members),
		id,
	).Scan(
		&updatedList.Id,
		&updatedList.Name,
		&updatedList.Owner,
		&updatedList.Private,
		pq.Array(&updatedList.Members),
	)

	return updatedList, queryErr
}

func DeleteList(listId string) (interfaces.List, error) {
	var deletedList interfaces.List
	sqlCommand := "DELETE FROM lists WHERE id = $1 RETURNING *;"

	queryErr := db.Database.QueryRow(
		sqlCommand,
		listId,
	).Scan(
		&deletedList.Id,
		&deletedList.Name,
		&deletedList.Owner,
		&deletedList.Private,
		pq.Array(&deletedList.Members),
	)

	return deletedList, queryErr
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

func RetrieveMemberUsernamesFromMemberIds(memberIds []string) ([]string, error) {
	var memberUsernames []string

	memberUsernamesQueryCommand := "SELECT username FROM users WHERE id = $1"

	for _, memberId := range memberIds {
		var memberUsername string

		memberUsernamesQueryErr := db.Database.QueryRow(memberUsernamesQueryCommand, memberId).Scan(&memberUsername)
		if memberUsernamesQueryErr != nil {
			return memberUsernames, memberUsernamesQueryErr
		}

		memberUsernames = append(memberUsernames, memberUsername)
	}

	return memberUsernames, nil
}

func RetrieveOwnerIdByListId(listId string) (string, error) {
	var ownerId string

	sqlCommand := "SELECT owner FROM lists WHERE id = $1"

	queryErr := db.Database.QueryRow(sqlCommand, listId).Scan(&ownerId)

	if queryErr != nil {
		return ownerId, queryErr
	}

	return ownerId, nil
}

func RetrieveListById(listId string) (interfaces.List, error) {
	var list interfaces.List

	sqlCommand := "SELECT * FROM lists WHERE id = $1"

	queryErr := db.Database.QueryRow(sqlCommand, listId).Scan(
		&list.Id,
		&list.Name,
		&list.Owner,
		&list.Private,
		pq.Array(&list.Members),
	)

	if queryErr != nil {
		return list, queryErr
	}

	return list, nil
}

func RetrieveNumberTasksInList(listId string) (int, error) {
	var count int

	sqlCommand := "SELECT COUNT(*) FROM tasks WHERE \"listId\" = $1;"

	queryErr := db.Database.QueryRow(sqlCommand, listId).Scan(&count)

	if queryErr != nil {
		return count, queryErr
	}

	return count, nil
}
