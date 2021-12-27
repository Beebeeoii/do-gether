package router

import (
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
	Private bool   `json:"private" validate:"required"`
}

func CreateList(c *gin.Context) {
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
