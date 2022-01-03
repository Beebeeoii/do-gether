package router

import (
	"fmt"
	"log"
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	validator "github.com/beebeeoii/do-gether/routers/validator"
	authService "github.com/beebeeoii/do-gether/services/auth"
	userService "github.com/beebeeoii/do-gether/services/user"
	utils "github.com/beebeeoii/do-gether/services/utils"
	"github.com/gin-gonic/gin"
)

type registerBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type sendFriendReqBody struct {
	Id string `json:"id"`
}

type acceptFriendReqBody struct {
	Id string `json:"id"`
}

const (
	USER_ID_PARAM_KEY  = "id"
	USERNAME_PARAM_KEY = "username"
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
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	userId := c.Param("id")

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

func FindUserByUsername(c *gin.Context) {
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
	username := reqParams.Get(USERNAME_PARAM_KEY)

	user, retrieveErr := userService.RetrieveUserByUsername(username)
	if retrieveErr != nil {
		log.Println(retrieveErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveErr.Error(),
		})
		return
	}

	userId := c.GetHeader("id")

	if !utils.Contains(user.Friends, userId) {
		user = interfaces.User{
			Id:           user.Id,
			Username:     user.Username,
			Friends:      []string{},
			Outgoing_req: []string{},
			Incoming_req: []string{},
		}
	}

	c.JSON(http.StatusOK, interfaces.RetrieveUserResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: user,
	})
}

func SendFriendReq(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody sendFriendReqBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		log.Println(reqBodyErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	recipientId := requestBody.Id
	senderId := c.GetHeader("id")

	if recipientId == senderId {
		log.Println(recipientId, senderId)
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("you cannt send yourself a friend request").Error(),
		})
		return
	}

	sendReqErr := userService.SendFriendRequest(senderId, recipientId)
	if sendReqErr != nil {
		log.Println(sendReqErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   sendReqErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.BaseResponse{
		Success: true,
		Error:   "",
	})
}

func AcceptFriendReq(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		log.Println(authDataValidationErr)
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody acceptFriendReqBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		log.Println(reqBodyErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
		})
		return
	}

	senderId := requestBody.Id
	recipientId := c.GetHeader("id")

	acceptReqErr := userService.AcceptFriendRequest(senderId, recipientId)
	if acceptReqErr != nil {
		log.Println(acceptReqErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   acceptReqErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.BaseResponse{
		Success: true,
		Error:   "",
	})
}

func RemoveFriendRequest(c *gin.Context) {
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
	pendingFriendId := reqParams.Get(USER_ID_PARAM_KEY)
	userId := c.GetHeader("id")

	removeFriendErr := userService.RemoveFriendRequest(userId, pendingFriendId)
	if removeFriendErr != nil {
		log.Println(removeFriendErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   removeFriendErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.BaseResponse{
		Success: true,
		Error:   "",
	})
}

func RemoveFriend(c *gin.Context) {
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
	friendId := reqParams.Get(USER_ID_PARAM_KEY)
	userId := c.GetHeader("id")

	removeFriendErr := userService.RemoveFriend(userId, friendId)
	if removeFriendErr != nil {
		log.Println(removeFriendErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   removeFriendErr.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, interfaces.BaseResponse{
		Success: true,
		Error:   "",
	})
}
