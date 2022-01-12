package router

import (
	"fmt"
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	validator "github.com/beebeeoii/do-gether/routers/validator"
	listService "github.com/beebeeoii/do-gether/services/list"
	taskService "github.com/beebeeoii/do-gether/services/task"
	"github.com/gin-gonic/gin"
)

type createTaskBody struct {
	Owner        string   `json:"owner" validate:"min=1,max=20,required"`
	Title        string   `json:"title" validate:"required"`
	Tags         []string `json:"tags" validate:"required"`
	ListId       string   `json:"listId" validate:"min=1,max=20,required"`
	Priority     int      `json:"priority"`
	Due          int      `json:"due" validate:"required"`
	PlannedStart int      `json:"plannedStart" validate:"required"`
	PlannedEnd   int      `json:"plannedEnd" validate:"required"`
}

type editTaskBody struct {
	Id           string   `json:"id" validate:"min=1,max=20,required"`
	ListId       string   `json:"listId" validate:"min=1,max=20,required"`
	Title        string   `json:"title" validate:"required"`
	Tags         []string `json:"tags" validate:"required"`
	Priority     int      `json:"priority"`
	Due          int      `json:"due" validate:"required"`
	PlannedStart int      `json:"plannedStart" validate:"required"`
	PlannedEnd   int      `json:"plannedEnd" validate:"required"`
}

type editTaskCompletedBody struct {
	Id        string `json:"id" validate:"min=1,max=20,required"`
	ListId    string `json:"listId" validate:"min=1,max=20,required"`
	Completed bool   `json:"completed"`
}

type deleteTaskParams struct {
	Id string `form:"taskId" validate:"required,min=1,max=20"`
}

type retrieveTasksByListIdParams struct {
	ListId string `form:"listId" validate:"required,min=1,max=20"`
}

type retrieveTagSuggestionParams struct {
	ListId string `form:"listId" validate:"required,min=1,max=20"`
}

type reorderTaskBody struct {
	Id           string `json:"id" validate:"min=1,max=20,required"`
	ListId       string `json:"listId" validate:"min=1,max=20,required"`
	NewListOrder int    `json:"newListOrder"`
}

type moveTaskBody struct {
	Id             string `json:"id" validate:"min=1,max=20,required"`
	OriginalListId string `json:"originalListId" validate:"min=1,max=20,required"`
	NewListId      string `json:"newListId" validate:"min=1,max=20,required"`
}

const (
	USER_ID_HEADER_KEY = "id"
)

func verifyUserWritePerms(listId string, userId string) error {
	list, retrieveListErr := listService.RetrieveListById(listId)
	if retrieveListErr != nil {
		return retrieveListErr
	}

	if !validator.HasListReadWritePermission(list, userId) {
		return fmt.Errorf("access denied")
	}

	return nil
}

func reorderTasksInList(taskId string, listId string, taskNewOrder int) ([]interfaces.BasicTaskReorderData, error) {
	var updatedTasks []interfaces.BasicTaskReorderData
	taskInitialOrder := -1

	tasks, retrieveTasksErr := taskService.RetrieveTasksByListId(listId)
	if retrieveTasksErr != nil {
		return updatedTasks, retrieveTasksErr
	}

	for index, task := range tasks {
		if task.Id == taskId {
			taskInitialOrder = task.ListOrder
		}

		updatedTasks = append(updatedTasks, interfaces.BasicTaskReorderData{
			Id:        task.Id,
			ListOrder: index,
		})
	}

	if taskInitialOrder == -1 {
		return updatedTasks, fmt.Errorf("task not found in list")
	}

	updatedTasks[taskInitialOrder].ListOrder = taskNewOrder

	if taskInitialOrder > taskNewOrder {
		for i := taskNewOrder; i < taskInitialOrder; i++ {
			updatedTasks[i].ListOrder += 1
		}
	}

	if taskNewOrder > taskInitialOrder {
		for i := taskInitialOrder + 1; i < taskNewOrder+1; i++ {
			updatedTasks[i].ListOrder -= 1
		}
	}

	return updatedTasks, nil
}

func CreateTask(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody createTaskBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(requestBody)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	if requestBody.Owner != userId {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("list owner id mismatch with current account id").Error(),
		})
		return
	}

	verifyErr := verifyUserWritePerms(requestBody.ListId, userId)
	if verifyErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyErr.Error(),
		})
		return
	}

	taskCreationData := interfaces.TaskCreationData{
		Owner:        requestBody.Owner,
		Title:        requestBody.Title,
		Tags:         requestBody.Tags,
		ListId:       requestBody.ListId,
		Priority:     requestBody.Priority,
		Due:          requestBody.Due,
		PlannedStart: requestBody.PlannedStart,
		PlannedEnd:   requestBody.PlannedEnd,
	}

	newTask, createTaskErr := taskService.CreateTask(taskCreationData)
	if createTaskErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   createTaskErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.CreateTaskResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: newTask,
	})
}

func EditTask(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody editTaskBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(requestBody)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	verifyErr := verifyUserWritePerms(requestBody.ListId, userId)
	if verifyErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyErr.Error(),
		})
		return
	}

	tasks, retrieveTasksErr := taskService.RetrieveTasksByListId(requestBody.ListId)
	if retrieveTasksErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveTasksErr.Error(),
		})
		return
	}

	doesTaskExistInList := false

	for _, task := range tasks {
		if task.Id == requestBody.Id {
			doesTaskExistInList = true
			break
		}
	}

	if !doesTaskExistInList {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("task does not exist in the list").Error(),
		})
		return
	}

	taskEditionData := interfaces.TaskEditionData{
		Id:           requestBody.Id,
		Title:        requestBody.Title,
		Tags:         requestBody.Tags,
		Priority:     requestBody.Priority,
		Due:          requestBody.Due,
		PlannedStart: requestBody.PlannedStart,
		PlannedEnd:   requestBody.PlannedEnd,
	}

	updatedTask, editTaskErr := taskService.EditTask(taskEditionData)
	if editTaskErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   editTaskErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.EditTaskResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: updatedTask,
	})
}

func DeleteTask(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams deleteTaskParams

	reqParamsErr := c.BindQuery(&reqParams)
	if reqParamsErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqParamsErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(reqParams)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	listId, retrieveListIdErr := taskService.RetrieveListIdByTaskId(reqParams.Id)
	if retrieveListIdErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListIdErr.Error(),
		})
		return
	}

	verifyErr := verifyUserWritePerms(listId, userId)
	if verifyErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyErr.Error(),
		})
		return
	}

	deletedTask, deleteTaskErr := taskService.DeleteTask(reqParams.Id)
	if deleteTaskErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   deleteTaskErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.DeleteTaskResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: deletedTask,
	})
}

func RetrieveTasksByListId(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams retrieveTasksByListIdParams

	reqParamsErr := c.BindQuery(&reqParams)
	if reqParamsErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqParamsErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(reqParams)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	verifyErr := verifyUserWritePerms(reqParams.ListId, userId)
	if verifyErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyErr.Error(),
		})
		return
	}

	tasks, retrieveTasksErr := taskService.RetrieveTasksByListId(reqParams.ListId)
	if retrieveTasksErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveTasksErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.RetrieveTasksResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: tasks,
	})
}

func RetrieveTagSuggestion(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams retrieveTagSuggestionParams

	reqParamsErr := c.BindQuery(&reqParams)
	if reqParamsErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqParamsErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(reqParams)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	verifyErr := verifyUserWritePerms(reqParams.ListId, userId)
	if verifyErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyErr.Error(),
		})
		return
	}

	tags, retrieveTagsErr := taskService.RetrieveTagsByListId(reqParams.ListId)
	if retrieveTagsErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveTagsErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.RetrieveTagsResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: tags,
	})
}

func ReorderTasks(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody reorderTaskBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(requestBody)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	verifyErr := verifyUserWritePerms(requestBody.ListId, userId)
	if verifyErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyErr.Error(),
		})
		return
	}

	reorderTaskData, reorderErr := reorderTasksInList(requestBody.Id, requestBody.ListId, requestBody.NewListOrder)
	if reorderErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reorderErr.Error(),
		})
		return
	}

	tasks, reorderTasksErr := taskService.ReorderTasksInList(reorderTaskData)
	if reorderTasksErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reorderTasksErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.RetrieveTasksResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: tasks,
	})
}

func EditTaskCompleted(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody editTaskCompletedBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(requestBody)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	verifyErr := verifyUserWritePerms(requestBody.ListId, userId)
	if verifyErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyErr.Error(),
		})
		return
	}

	tasks, retrieveTasksErr := taskService.RetrieveTasksByListId(requestBody.ListId)
	if retrieveTasksErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveTasksErr.Error(),
		})
		return
	}

	doesTaskExistInList := false

	for _, task := range tasks {
		if task.Id == requestBody.Id {
			doesTaskExistInList = true
			break
		}
	}

	if !doesTaskExistInList {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("task does not exist in the list").Error(),
		})
		return
	}

	taskEditCompletedData := interfaces.TaskEditCompletedData{
		Id:        requestBody.Id,
		Completed: requestBody.Completed,
	}

	updatedTask, editTaskErr := taskService.EditTaskCompleted(taskEditCompletedData)
	if editTaskErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   editTaskErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.EditTaskResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: updatedTask,
	})
}

func MoveTask(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody moveTaskBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(requestBody)
	if validationErr != nil {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	if requestBody.OriginalListId == requestBody.NewListId {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("you cannot move a list to the same list").Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	verifyOldListErr := verifyUserWritePerms(requestBody.OriginalListId, userId)
	if verifyOldListErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyOldListErr.Error(),
		})
		return
	}

	verifyNewListErr := verifyUserWritePerms(requestBody.NewListId, userId)
	if verifyNewListErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   verifyNewListErr.Error(),
		})
		return
	}

	tasks, retrieveTasksErr := taskService.RetrieveTasksByListId(requestBody.OriginalListId)
	if retrieveTasksErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveTasksErr.Error(),
		})
		return
	}

	doesTaskExistInList := false

	for _, task := range tasks {
		if task.Id == requestBody.Id {
			doesTaskExistInList = true
			break
		}
	}

	if !doesTaskExistInList {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("task does not exist in the list").Error(),
		})
		return
	}

	nTasksInOriginalList, retrieveNTasksErr := listService.RetrieveNumberTasksInList(requestBody.OriginalListId)
	if retrieveNTasksErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveNTasksErr.Error(),
		})
		return
	}

	nTasksInNewList, retrieveNTasksErr := listService.RetrieveNumberTasksInList(requestBody.NewListId)
	if retrieveNTasksErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveNTasksErr.Error(),
		})
		return
	}

	reorderTaskData, reorderErr := reorderTasksInList(requestBody.Id, requestBody.OriginalListId, nTasksInOriginalList-1)
	if reorderErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reorderErr.Error(),
		})
		return
	}

	_, reorderTasksErr := taskService.ReorderTasksInList(reorderTaskData)
	if reorderTasksErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reorderTasksErr.Error(),
		})
		return
	}

	updatedTask, moveTaskErr := taskService.MoveTask(interfaces.MoveTaskData{
		Id:           requestBody.Id,
		NewListId:    requestBody.NewListId,
		NewListOrder: nTasksInNewList,
	})
	if moveTaskErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   moveTaskErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.MoveTaskResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: updatedTask,
	})
}
