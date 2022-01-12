package router

import (
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	validator "github.com/beebeeoii/do-gether/routers/validator"
	authService "github.com/beebeeoii/do-gether/services/auth"
	userService "github.com/beebeeoii/do-gether/services/user"
	"github.com/gin-gonic/gin"
)

type authenticateParams struct {
	Username string `form:"username" validate:"required"`
	Password string `form:"password" validate:"required"`
}

const (
	INVALID_USERNAME_ERROR    = "sql: no rows in result set"
	INVALID_USERNAME_RESPONSE = "Incorrect username/password"
	INVALID_PASSWORD_RESPONSE = "Incorrect username/password"
)

func AuthenticateUser(c *gin.Context) {
	var reqParams authenticateParams

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

	hashedPassword, retrieveErr := userService.RetrieveUserHashedPassword(reqParams.Username)
	if retrieveErr != nil {
		if retrieveErr.Error() == INVALID_USERNAME_ERROR {
			c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
				Success: false,
				Error:   INVALID_USERNAME_RESPONSE,
			})
		} else {
			c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
				Success: false,
				Error:   retrieveErr.Error(),
			})
		}
		return
	}

	if authService.DoesPasswordMatchHash(reqParams.Password, hashedPassword) {
		userId, userIdErr := userService.RetrieveUserIdByUsername(reqParams.Username)
		if userIdErr != nil {
			c.JSON(http.StatusNotFound, interfaces.BaseResponse{
				Success: false,
				Error:   userIdErr.Error(),
			})
			return
		}

		jwtToken, jwtTokenErr := authService.GenerateJwt(userId)
		if jwtTokenErr != nil {
			c.JSON(http.StatusInternalServerError, interfaces.BaseResponse{
				Success: false,
				Error:   jwtTokenErr.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, interfaces.AuthResponse{
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
		c.JSON(http.StatusUnauthorized, interfaces.BaseResponse{
			Success: false,
			Error:   INVALID_PASSWORD_RESPONSE,
		})
	}
}
