package router

import (
	"fmt"
	"log"
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

type reorderTasksBody struct {
	ListId string                            `json:"listId" validate:"min=1,max=20,required"`
	Tasks  []interfaces.BasicTaskReorderData `json:"tasks" validate:"required"`
}

const (
	LIST_ID_PARAM_KEY = "listId"
)

func CreateTask(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody createTaskBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		log.Println(reqBodyErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(requestBody)
	if validationErr != nil {
		log.Println(validationErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader("id")

	if requestBody.Owner != userId {
		log.Println("Id mismatch")
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("id mismatch").Error(),
		})
		return
	}

	list, retrieveListErr := listService.RetrieveListById(requestBody.ListId)
	if retrieveListErr != nil {
		log.Println(retrieveListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListErr.Error(),
		})
		return
	}

	if !validator.HasListPermission(list, userId) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
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
		log.Println(createTaskErr)
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
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody editTaskBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		log.Println(reqBodyErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(requestBody)
	if validationErr != nil {
		log.Println(validationErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader("id")

	list, retrieveListErr := listService.RetrieveListById(requestBody.ListId)
	if retrieveListErr != nil {
		log.Println(retrieveListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListErr.Error(),
		})
		return
	}

	if !validator.HasListPermission(list, userId) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	tasks, retrieveTasksErr := taskService.RetrieveTasksByListId(requestBody.ListId)
	if retrieveTasksErr != nil {
		log.Println(retrieveTasksErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
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
		log.Println(editTaskErr)
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

func RetrieveTasksByListId(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	reqParams := c.Request.URL.Query()
	listId := reqParams.Get(LIST_ID_PARAM_KEY)
	if listId == "" {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("invalid listId provided").Error(),
		})
		return
	}
	userId := c.GetHeader("id")

	list, retrieveListErr := listService.RetrieveListById(listId)
	if retrieveListErr != nil {
		log.Println(retrieveListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListErr.Error(),
		})
		return
	}

	if !validator.HasListPermission(list, userId) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	tasks, retrieveTasksErr := taskService.RetrieveTasksByListId(listId)
	if retrieveTasksErr != nil {
		log.Println(retrieveTasksErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
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
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	reqParams := c.Request.URL.Query()
	listId := reqParams.Get(LIST_ID_PARAM_KEY)
	if listId == "" {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("invalid listId provided").Error(),
		})
		return
	}
	userId := c.GetHeader("id")

	list, retrieveListErr := listService.RetrieveListById(listId)
	if retrieveListErr != nil {
		log.Println(retrieveListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListErr.Error(),
		})
		return
	}

	if !validator.HasListPermission(list, userId) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	tags, retrieveTagsErr := taskService.RetrieveTagsByListId(listId)
	if retrieveTagsErr != nil {
		log.Println(retrieveTagsErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
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
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody reorderTasksBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		log.Println(reqBodyErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(requestBody)
	if validationErr != nil {
		log.Println(validationErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader("id")

	list, retrieveListErr := listService.RetrieveListById(requestBody.ListId)
	if retrieveListErr != nil {
		log.Println(retrieveListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListErr.Error(),
		})
		return
	}

	if !validator.HasListPermission(list, userId) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	tasks, reorderTasksErr := taskService.ReorderTasksInList(requestBody.Tasks)
	if reorderTasksErr != nil {
		log.Println(reorderTasksErr)
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
