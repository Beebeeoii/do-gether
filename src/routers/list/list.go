package router

import (
	"fmt"
	"log"
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	validator "github.com/beebeeoii/do-gether/routers/validator"
	listService "github.com/beebeeoii/do-gether/services/list"
	"github.com/gin-gonic/gin"
)

type createListBody struct {
	Name    string `json:"name" validate:"min=1,max=20,required"`
	Owner   string `json:"owner" validate:"min=1,max=20,required"`
	Private bool   `json:"private"`
}

const (
	USER_ID_PARAM_KEY = "userId"
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
