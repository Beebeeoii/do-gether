package service

import (
	"github.com/beebeeoii/do-gether/db"
	"github.com/beebeeoii/do-gether/interfaces"
	utils "github.com/beebeeoii/do-gether/services/utils"
	"github.com/lib/pq"
)

func CreateTask(task interfaces.TaskCreationData) (interfaces.Task, error) {
	var nTasksInList int
	getTotalCommand := "SELECT COUNT(*) FROM tasks where \"listId\" = $1;"

	queryErr := db.Database.QueryRow(getTotalCommand, task.ListId).Scan(&nTasksInList)
	if queryErr != nil {
		return interfaces.Task{}, queryErr
	}

	sqlCommand := "INSERT INTO tasks (id, owner, title, tags, \"listId\", \"listOrder\", priority, due, \"plannedStart\", \"plannedEnd\", completed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);"

	newTask := interfaces.Task{
		Id:           utils.GenerateUid(),
		Owner:        task.Owner,
		Title:        task.Title,
		Tags:         task.Tags,
		ListId:       task.ListId,
		ListOrder:    nTasksInList,
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
		newTask.ListOrder,
		newTask.Priority,
		newTask.Due,
		newTask.PlannedStart,
		newTask.PlannedEnd,
		newTask.Completed,
	)

	return newTask, execErr
}

func EditTask(task interfaces.TaskEditionData) (interfaces.Task, error) {
	var updatedTask interfaces.Task
	sqlCommand := "UPDATE tasks SET title = $1, tags = $2, priority = $3, due = $4, \"plannedStart\" = $5, \"plannedEnd\" = $6 WHERE id = $7 RETURNING *;"

	queryErr := db.Database.QueryRow(
		sqlCommand,
		task.Title,
		pq.Array(task.Tags),
		task.Priority,
		task.Due,
		task.PlannedStart,
		task.PlannedEnd,
		task.Id,
	).Scan(
		&updatedTask.Id,
		&updatedTask.Owner,
		&updatedTask.Title,
		pq.Array(&updatedTask.Tags),
		&updatedTask.ListId,
		&updatedTask.ListOrder,
		&updatedTask.Priority,
		&updatedTask.Due,
		&updatedTask.PlannedStart,
		&updatedTask.PlannedEnd,
		&updatedTask.Completed,
	)

	return updatedTask, queryErr
}

func DeleteTask(taskId string) (interfaces.Task, error) {
	var deletedTask interfaces.Task
	sqlCommand := "DELETE FROM tasks WHERE id = $1 RETURNING *;"

	queryErr := db.Database.QueryRow(
		sqlCommand,
		taskId,
	).Scan(
		&deletedTask.Id,
		&deletedTask.Owner,
		&deletedTask.Title,
		pq.Array(&deletedTask.Tags),
		&deletedTask.ListId,
		&deletedTask.ListOrder,
		&deletedTask.Priority,
		&deletedTask.Due,
		&deletedTask.PlannedStart,
		&deletedTask.PlannedEnd,
		&deletedTask.Completed,
	)

	return deletedTask, queryErr
}

func DeleteTasksFromList(listId string) error {
	sqlCommand := "DELETE FROM tasks WHERE \"listId\" = $1 RETURNING *;"

	_, queryErr := db.Database.Exec(sqlCommand, listId)
	if queryErr != nil {
		return queryErr
	}

	return nil
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

	return removeDuplicateStr(tags), nil
}

func RetrieveListIdByTaskId(taskId string) (string, error) {
	var listId string
	sqlCommand := "SELECT \"listId\" FROM tasks WHERE id = $1"

	queryErr := db.Database.QueryRow(sqlCommand, taskId).Scan(&listId)
	if queryErr != nil {
		return listId, queryErr
	}

	return listId, nil
}

func ReorderTasksInList(tasks []interfaces.BasicTaskReorderData) ([]interfaces.Task, error) {
	var updatedTasks []interfaces.Task
	sqlCommand := "UPDATE tasks SET \"listOrder\" = $1 WHERE id = $2 RETURNING *"

	for _, task := range tasks {
		updatedTask := interfaces.Task{}
		queryErr := db.Database.QueryRow(sqlCommand, task.ListOrder, task.Id).Scan(
			&updatedTask.Id,
			&updatedTask.Owner,
			&updatedTask.Title,
			pq.Array(&updatedTask.Tags),
			&updatedTask.ListId,
			&updatedTask.ListOrder,
			&updatedTask.Priority,
			&updatedTask.Due,
			&updatedTask.PlannedStart,
			&updatedTask.PlannedEnd,
			&updatedTask.Completed,
		)

		if queryErr != nil {
			return updatedTasks, queryErr
		}
		updatedTasks = append(updatedTasks, updatedTask)
	}

	return updatedTasks, nil
}

func removeDuplicateStr(tagSlice []string) []string {
	tags := make(map[string]bool)
	uniqueTagSlice := []string{}

	for _, tag := range tagSlice {
		if _, value := tags[tag]; !value {
			tags[tag] = true
			uniqueTagSlice = append(uniqueTagSlice, tag)
		}
	}

	return uniqueTagSlice
}
