package router

import (
	"fmt"
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	validator "github.com/beebeeoii/do-gether/routers/validator"
	authService "github.com/beebeeoii/do-gether/services/auth"
	userService "github.com/beebeeoii/do-gether/services/user"
	utils "github.com/beebeeoii/do-gether/services/utils"
	"github.com/gin-gonic/gin"
)

type registerBody struct {
	Username string `json:"username" validate:"min=1,max=20,required"`
	Password string `json:"password" validate:"min=1,max=20,required"`
}

type findUserByUsernameParams struct {
	Username string `form:"username" validate:"required"`
}

type sendFriendReqBody struct {
	Id string `json:"id"`
}

type acceptFriendReqBody struct {
	Id string `json:"id"`
}

type removeFriendRequestBody struct {
	Id string `form:"id"`
}

type removeFriendBody struct {
	Id string `form:"id"`
}

const (
	USER_ID_HEADER_KEY = "id"
	USER_ID_PARAM_KEY  = "id"
	USERNAME_PARAM_KEY = "username"
)

func Register(c *gin.Context) {
	var requestBody registerBody

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

	hashedPassword, hashPwErr := authService.HashPassword(requestBody.Password)
	if hashPwErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   hashPwErr.Error(),
		})
		return
	}

	newUser, createUserErr := userService.CreateUser(requestBody.Username, hashedPassword)
	if createUserErr != nil {
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	userId := c.Param(USER_ID_PARAM_KEY)

	if userId != c.GetHeader(USER_ID_HEADER_KEY) {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("access denied").Error(),
		})
		return
	}

	user, retrieveErr := userService.RetrieveUserById(userId)
	if retrieveErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
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

func RetrieveAllUserFriends(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

	user, retrieveErr := userService.RetrieveUserById(userId)
	if retrieveErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveErr.Error(),
		})
		return
	}

	var allFriends []interfaces.UserFriend

	for _, outgoingId := range user.Outgoing_req {
		friend, retrieveErr := userService.RetrieveUserById(outgoingId)
		if retrieveErr != nil {
			c.JSON(http.StatusNotFound, interfaces.BaseResponse{
				Success: false,
				Error:   retrieveErr.Error(),
			})
			return
		}

		allFriends = append(allFriends, interfaces.UserFriend{
			Id:       friend.Id,
			Username: friend.Username,
			Type:     "outgoing",
		})
	}

	for _, incomingId := range user.Incoming_req {
		friend, retrieveErr := userService.RetrieveUserById(incomingId)
		if retrieveErr != nil {
			c.JSON(http.StatusNotFound, interfaces.BaseResponse{
				Success: false,
				Error:   retrieveErr.Error(),
			})
			return
		}

		allFriends = append(allFriends, interfaces.UserFriend{
			Id:       friend.Id,
			Username: friend.Username,
			Type:     "incoming",
		})
	}

	for _, friendId := range user.Friends {
		friend, retrieveErr := userService.RetrieveUserById(friendId)
		if retrieveErr != nil {
			c.JSON(http.StatusNotFound, interfaces.BaseResponse{
				Success: false,
				Error:   retrieveErr.Error(),
			})
			return
		}

		allFriends = append(allFriends, interfaces.UserFriend{
			Id:       friend.Id,
			Username: friend.Username,
			Type:     "friend",
		})
	}

	c.JSON(http.StatusOK, interfaces.RetrieveUserFriendsResponse{
		BaseResponse: interfaces.BaseResponse{
			Success: true,
			Error:   "",
		},
		Data: allFriends,
	})
}

func FindUserByUsername(c *gin.Context) {
	authDataValidationErr := validator.ValidateAuthDataFromHeader(c.Request.Header)
	if authDataValidationErr != nil {
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams findUserByUsernameParams

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

	user, retrieveErr := userService.RetrieveUserByUsername(reqParams.Username)
	if retrieveErr != nil {
		c.JSON(http.StatusNotFound, interfaces.BaseResponse{
			Success: false,
			Error:   retrieveErr.Error(),
		})
		return
	}

	userId := c.GetHeader(USER_ID_HEADER_KEY)

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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody sendFriendReqBody

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

	recipientId := requestBody.Id
	senderId := c.GetHeader(USER_ID_HEADER_KEY)

	if recipientId == senderId {
		c.JSON(http.StatusBadRequest, interfaces.BaseResponse{
			Success: false,
			Error:   fmt.Errorf("you cannt send yourself a friend request").Error(),
		})
		return
	}

	sendReqErr := userService.SendFriendRequest(senderId, recipientId)
	if sendReqErr != nil {
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var requestBody acceptFriendReqBody

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

	senderId := requestBody.Id
	recipientId := c.GetHeader(USER_ID_HEADER_KEY)

	acceptReqErr := userService.AcceptFriendRequest(senderId, recipientId)
	if acceptReqErr != nil {
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams removeFriendRequestBody

	reqBodyErr := c.BindJSON(&reqParams)
	if reqBodyErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
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

	removeFriendErr := userService.RemoveFriendRequest(userId, reqParams.Id)
	if removeFriendErr != nil {
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   authDataValidationErr.Error(),
		})
		return
	}

	var reqParams removeFriendBody

	reqBodyErr := c.BindJSON(&reqParams)
	if reqBodyErr != nil {
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   reqBodyErr.Error(),
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

	userId := c.GetHeader("id")

	removeFriendErr := userService.RemoveFriend(userId, reqParams.Id)
	if removeFriendErr != nil {
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
