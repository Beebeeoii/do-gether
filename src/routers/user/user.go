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

const (
	USER_ID_PARAM_KEY = "id"
)

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

func RetrieveUserById(c *gin.Context) {
	userId := c.Param("id")

	authData, authDataErr := authService.ExtractAuthData(c.Request.Header)
	if authDataErr != nil {
		log.Println(authDataErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataErr.Error(),
		})
		return
	}

	isValid, validationErr := authService.ValidateAuthData(authData.Token, authData.UserId)
	if validationErr != nil || !isValid {
		log.Println(validationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   validationErr.Error(),
		})
		return
	}

	user, retrieveErr := userService.RetrieveUserById(userId)
	if retrieveErr != nil {
		log.Println(retrieveErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.RetrieveUserResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: interfaces.User{
			Id:           user.Id,
			Username:     user.Username,
			Friends:      user.Friends,
			Outgoing_req: user.Outgoing_req,
			Incoming_req: user.Incoming_req,
		},
	})
}
