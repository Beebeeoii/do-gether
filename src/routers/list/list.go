package router

import (
	"fmt"
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

type retrieveListsByUserIdParams struct {
	Id string `form:"userId" validate:"required,min=1,max=20"`
}

type retrieveListMembersParams struct {
	ListId string `form:"listId" validate:"required,min=1,max=20"`
}

type retrieveListOwnerParams struct {
	ListId string `form:"listId" validate:"required,min=1,max=20"`
}

const (
	USER_ID_HEADER_KEY = "id"
)

func CreateList(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody createListBody

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

	if requestBody.Owner != c.GetHeader(USER_ID_HEADER_KEY) {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("list owner id mismatch with current account id").Error(),
		})
		return
	}

	newList, createListErr := listService.CreateList(requestBody.Name, requestBody.Owner, requestBody.Private)
	if createListErr != nil {
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody editListBody

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

	list, retrieveListErr := listService.RetrieveListById(requestBody.Id)
	if retrieveListErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody editListMembersBody

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

	list, retrieveListErr := listService.RetrieveListById(requestBody.Id)
	if retrieveListErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams deleteListParams

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

	ownerId, retrieveOwnerIdErr := listService.RetrieveOwnerIdByListId(reqParams.Id)
	if retrieveOwnerIdErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
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
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   deleteListErr.Error(),
		})
		return
	}

	deleteTasksErr := taskService.DeleteTasksFromList(reqParams.Id)
	if deleteTasksErr != nil {
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams retrieveListsByUserIdParams

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

	lists, retrieveListsErr := listService.RetrieveListsByUserId(reqParams.Id, userId)
	if retrieveListsErr != nil {
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams retrieveListMembersParams

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

	list, retrieveListErr := listService.RetrieveListById(reqParams.ListId)
	if retrieveListErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
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

	memberUsernames, retrieveMemberUsernamesErr := listService.RetrieveMemberUsernamesFromMemberIds(list.Members)
	if retrieveMemberUsernamesErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveMemberUsernamesErr.Error(),
		})
		return
	}

	var listMembers []interfaces.BasicUser
	for index, member := range list.Members {
		listMembers = append(listMembers, interfaces.BasicUser{
			Id:       member,
			Username: memberUsernames[index],
		})
	}

	c.JSON(http.StatusOK, interfaces.RetrieveListMembersResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: listMembers,
	})
}

func RetrieveListOwner(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams retrieveListOwnerParams

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

	list, retrieveListErr := listService.RetrieveListById(reqParams.ListId)
	if retrieveListErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
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

	ownerUsername, retrievOwnerUsernameErr := listService.RetrieveMemberUsernamesFromMemberIds([]string{list.Owner})
	if retrievOwnerUsernameErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrievOwnerUsernameErr.Error(),
		})
		return
	}

	listOwner := interfaces.BasicUser{
		Id:       list.Owner,
		Username: ownerUsername[0],
	}

	c.JSON(http.StatusOK, interfaces.RetrieveListOwnerResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: listOwner,
	})
}
