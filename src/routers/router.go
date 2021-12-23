package router

import (
	"github.com/gin-gonic/gin"

	auth "github.com/beebeeoii/do-gether/routers/auth"
)

func Init(address string) {
	router := gin.Default()
	router.GET("/user/auth", auth.AuthenticateUser)

	router.Run(address)
}
