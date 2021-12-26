package router

import (
	"log"
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	routerWrapper "github.com/beebeeoii/do-gether/routers/wrapper"
	authService "github.com/beebeeoii/do-gether/services/auth"
	userService "github.com/beebeeoii/do-gether/services/user"
	"github.com/gin-gonic/gin"
)

const (
	USERNAME_PARAM_KEY        = "username"
	PASSWORD_PARAM_KEY        = "password"
	INVALID_USERNAME_ERROR    = "sql: no rows in result set"
	INVALID_USERNAME_RESPONSE = "Incorrect username/password"
	INVALID_PASSWORD_RESPONSE = "Incorrect username/password"
)

func AuthenticateUser(c *gin.Context) {
	reqParams := c.Request.URL.Query()
	username := reqParams.Get(USERNAME_PARAM_KEY)
	password := reqParams.Get(PASSWORD_PARAM_KEY)

	hashedPassword, retrieveErr := userService.RetrieveUserHashedPassword(username)
	if retrieveErr != nil {
		log.Println(retrieveErr)

		if retrieveErr.Error() == INVALID_USERNAME_ERROR {
			routerWrapper.JSON(c, http.StatusUnauthorized, interfaces.BaseResponse{
				Success: false,
				Error:   INVALID_USERNAME_RESPONSE,
			})
		} else {
			routerWrapper.JSON(c, http.StatusInternalServerError, interfaces.BaseResponse{
				Success: false,
				Error:   retrieveErr.Error(),
			})
		}
		return
	}

	isMatch := authService.CheckPasswordHash(password, hashedPassword)

	userId, userIdErr := userService.RetrieveUserIdByUsername(username)
	if userIdErr != nil {
		log.Println(userIdErr)
		c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
			Success: false,
			Error:   userIdErr.Error(),
		})
		return
	}

	if isMatch {
		jwtToken, jwtTokenErr := authService.GenerateJwt(userId)
		if jwtTokenErr != nil {
			log.Println(jwtTokenErr)
			c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
				Success: false,
				Error:   jwtTokenErr.Error(),
			})
			return
		}

		routerWrapper.JSON(c, http.StatusOK, interfaces.AuthResponse{
			BaseResponse: interfaces.BaseResponse{
				Success: true,
				Error:   "",
			},
			Data: interfaces.AuthData{
				Token:  jwtToken,
				UserId: userId,
			},
		})
	} else {
		routerWrapper.JSON(c, http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   INVALID_PASSWORD_RESPONSE,
		})
	}
}
