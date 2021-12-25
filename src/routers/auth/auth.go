package router

import (
	"log"
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
	"github.com/gin-gonic/gin"
)

type authBody struct {
	username string
	password string
}

func AuthenticateUser(c *gin.Context) {
	var requestBody authBody

	reqBodyErr := c.BindJSON(&requestBody)
	if reqBodyErr != nil {
		log.Println(reqBodyErr)
	}

	// hashed := "$2a$14$nZkXQxK3nXOvHodvaxMJYO8rERWc.sNsHpo0Qn2JlutSoF01EyPuS"
	// log.Println(hashed)
	c.JSON(http.StatusOK, interfaces.AuthResponse{BaseResponse: interfaces.BaseResponse{Success: true, Error: ""}, Data: interfaces.AuthData{Token: hashed}})
}
