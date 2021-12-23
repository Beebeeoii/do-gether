package router

import (
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	"github.com/gin-gonic/gin"
)

func AuthenticateUser(c *gin.Context) {
	c.JSON(http.StatusOK, interfaces.AuthResponse{BaseResponse: interfaces.BaseResponse{Success: true, Error: ""}, Data: interfaces.AuthData{Token: "testjwttoken"}})
}
