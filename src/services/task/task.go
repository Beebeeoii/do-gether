package service

import (
	"github.com/beebeeoii/do-gether/db"
	"github.com/beebeeoii/do-gether/interfaces"
	utils "github.com/beebeeoii/do-gether/services/utils"
	"github.com/lib/pq"
)

func CreateTask(task interfaces.TaskCreationData) (interfaces.Task, error) {
	sqlCommand := "INSERT INTO tasks (id, owner, title, tags, \"listId\", \"listOrder\", priority, due, \"plannedStart\", \"plannedEnd\", completed) VALUES ($1, $2, $3, $4, $5, DEFAULT, $6, $7, $8, $9, $10);"

	newTask := interfaces.Task{
		Id:           utils.GenerateUid(),
		Owner:        task.Owner,
		Title:        task.Title,
		Tags:         task.Tags,
		ListId:       task.ListId,
		ListOrder:    -1, // default auto-increment
		Priority:     task.Priority,
		Due:          task.Due,
		PlannedStart: task.PlannedStart,
		PlannedEnd:   task.PlannedEnd,
		Completed:    false,
	}

	_, execErr := db.Database.Exec(
		sqlCommand,
		newTask.Id,
		newTask.Owner,
		newTask.Title,
		pq.Array(newTask.Tags),
		newTask.ListId,
		newTask.Priority,
		newTask.Due,
		newTask.PlannedStart,
		newTask.PlannedEnd,
		newTask.Completed,
	)

	return newTask, execErr
}

func RetrieveTasksByListId(listId string) ([]interfaces.Task, error) {
	var tasks []interfaces.Task
	sqlCommand := "SELECT * FROM tasks WHERE \"listId\" = $1"

	rows, queryErr := db.Database.Query(sqlCommand, listId)
	if queryErr != nil {
		return tasks, queryErr
	}

	for rows.Next() {
		task := interfaces.Task{}
		scanErr := rows.Scan(
			&task.Id,
			&task.Owner,
			&task.Title,
			pq.Array(&task.Tags),
			&task.ListId,
			&task.ListOrder,
			&task.Priority,
			&task.Due,
			&task.PlannedStart,
			&task.PlannedEnd,
			&task.Completed,
		)
		if scanErr != nil {
			return tasks, scanErr
		}

		tasks = append(tasks, task)
	}

	rowsErr := rows.Err()
	if rowsErr != nil {
		return tasks, rowsErr
	}

	return tasks, nil
}

func RetrieveTagsByListId(listId string) ([]string, error) {
	var tags []string
	sqlCommand := "SELECT tags FROM tasks WHERE \"listId\" = $1"

	rows, queryErr := db.Database.Query(sqlCommand, listId)
	if queryErr != nil {
		return tags, queryErr
	}

	for rows.Next() {
		taskTags := []string{}
		scanErr := rows.Scan(pq.Array(&taskTags))
		if scanErr != nil {
			return tags, scanErr
		}

		tags = append(tags, taskTags...)
	}

	rowsErr := rows.Err()
	if rowsErr != nil {
		return tags, rowsErr
	}

	return tags, nil
}
