package router

import (
	"log"
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	authService "github.com/beebeeoii/do-gether/services/auth"
	userService "github.com/beebeeoii/do-gether/services/user"
	"github.com/gin-gonic/gin"
)

type registerBody struct {
	Username string
	Password string
}

func Register(c *gin.Context) {
	var requestBody registerBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		log.Println(reqBodyErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	hashedPassword, hashPwErr := authService.HashPassword(requestBody.Password)
	if hashPwErr != nil {
		log.Println(hashPwErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   hashPwErr.Error(),
		})
		return
	}

	newUser, createUserErr := userService.CreateUser(requestBody.Username, hashedPassword)
	if createUserErr != nil {
		log.Println(createUserErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   createUserErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.CreateUserResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: newUser,
	})
}
