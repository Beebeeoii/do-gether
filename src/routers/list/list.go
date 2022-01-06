package router

import (
	"fmt"
	"log"
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	validator "github.com/beebeeoii/do-gether/routers/validator"
	listService "github.com/beebeeoii/do-gether/services/list"
	taskService "github.com/beebeeoii/do-gether/services/task"
	userService "github.com/beebeeoii/do-gether/services/user"
	"github.com/gin-gonic/gin"
)

type createListBody struct {
	Name    string `json:"name" validate:"min=1,max=20,required"`
	Owner   string `json:"owner" validate:"min=1,max=20,required"`
	Private bool   `json:"private"`
}

type editListBody struct {
	Id      string `json:"id" validate:"min=1,max=20,required"`
	Name    string `json:"name" validate:"min=1,max=20,required"`
	Private bool   `json:"private"`
}

type editListMembersBody struct {
	Id      string   `json:"id" validate:"min=1,max=20,required"`
	Members []string `json:"members" validate:"required"`
}

type deleteListParams struct {
	Id string `form:"listId" validate:"required,min=1,max=20"`
}

const (
	USER_ID_PARAM_KEY = "userId"
	LIST_ID_PARAM_KEY = "listId"
)

func CreateList(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody createListBody

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

	if requestBody.Owner != c.GetHeader("id") {
		log.Println("Id mismatch")
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("id mismatch").Error(),
		})
		return
	}

	newList, createListErr := listService.CreateList(requestBody.Name, requestBody.Owner, requestBody.Private)
	if createListErr != nil {
		log.Println(createListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   createListErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.CreateListResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: newList,
	})
}

func EditList(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody editListBody

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

	list, retrieveListErr := listService.RetrieveListById(requestBody.Id)
	if retrieveListErr != nil {
		log.Println(retrieveListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListErr.Error(),
		})
		return
	}

	if !validator.HasListEditPermission(list, userId) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	updatedList, editListErr := listService.EditList(requestBody.Id, requestBody.Name, requestBody.Private)
	if editListErr != nil {
		log.Println(editListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   editListErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.EditListResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: updatedList,
	})
}

func EditListMembers(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody editListMembersBody

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

	list, retrieveListErr := listService.RetrieveListById(requestBody.Id)
	if retrieveListErr != nil {
		log.Println(retrieveListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListErr.Error(),
		})
		return
	}

	if !validator.HasListEditPermission(list, userId) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	for _, memberId := range requestBody.Members {
		_, retrieveUserErr := userService.RetrieveUserById(memberId)
		if retrieveUserErr != nil || memberId == userId {
			c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
				Success: false,
				Error:   fmt.Errorf("invalid user").Error(),
			})
			return
		}
	}

	updatedList, editListMembersErr := listService.EditListMembers(requestBody.Id, requestBody.Members)
	if editListMembersErr != nil {
		log.Println(editListMembersErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   editListMembersErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.EditListResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: updatedList,
	})
}

func DeleteList(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams deleteListParams

	reqParamsErr := c.BindQuery(&reqParams)
	if reqParamsErr != nil {
		log.Println(reqParamsErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqParamsErr.Error(),
		})
		return
	}

	validationErr := validator.Validate.Struct(reqParams)
	if validationErr != nil {
		log.Println(validationErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	userId := c.GetHeader("id")

	ownerId, retrieveOwnerIdErr := listService.RetrieveOwnerIdByListId(reqParams.Id)
	if retrieveOwnerIdErr != nil {
		log.Println(retrieveOwnerIdErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveOwnerIdErr.Error(),
		})
		return
	}

	if ownerId != userId {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	deletedList, deleteListErr := listService.DeleteList(reqParams.Id)
	if deleteListErr != nil {
		log.Println(deleteListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   deleteListErr.Error(),
		})
		return
	}

	deleteTasksErr := taskService.DeleteTasksFromList(reqParams.Id)
	if deleteTasksErr != nil {
		log.Println(deleteTasksErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   deleteTasksErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.DeleteListResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: deletedList,
	})
}

func RetrieveListsByUserId(c *gin.Context) {
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
	ownerId := reqParams.Get(USER_ID_PARAM_KEY)
	if ownerId == "" {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("invalid userId provided").Error(),
		})
		return
	}
	userId := c.GetHeader("id")

	lists, retrieveListsErr := listService.RetrieveListsByUserId(ownerId, userId)
	if retrieveListsErr != nil {
		log.Println(retrieveListsErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListsErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.RetrieveListsResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: lists,
	})
}

func RetrieveListMembers(c *gin.Context) {
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

	if !validator.HasListReadWritePermission(list, userId) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	memberUsernames, retrieveMemberUsernamesErr := listService.RetrieveMemberUsernamesFromMemberIds(append(list.Members, list.Owner))
	if retrieveMemberUsernamesErr != nil {
		log.Println(retrieveMemberUsernamesErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveMemberUsernamesErr.Error(),
		})
		return
	}

	var listMembers []interfaces.UserFriend
	for index, member := range list.Members {
		listMembers = append(listMembers, interfaces.UserFriend{
			Id:       member,
			Username: memberUsernames[index],
			Type:     "friend",
		})
	}
	listMembers = append(listMembers, interfaces.UserFriend{
		Id:       userId,
		Username: memberUsernames[len(listMembers)],
		Type:     "friend",
	})

	c.JSON(http.StatusOK, interfaces.RetrieveListMembersResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: listMembers,
	})
}

func RetrieveListById(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	listId := c.Param("id")
	if listId == "" {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("invalid id provided").Error(),
		})
		return
	}

	list, retrieveListErr := listService.RetrieveListById(listId)
	if retrieveListErr != nil {
		log.Println(retrieveListErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveListErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.RetrieveListResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: list,
	})
}
