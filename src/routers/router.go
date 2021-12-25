package router

import (
	"github.com/gin-gonic/gin"

	auth "github.com/beebeeoii/do-gether/routers/auth"
	user "github.com/beebeeoii/do-gether/routers/user"
)

func Init(address string) {
	router := gin.Default()
	router.GET("/user/auth", auth.AuthenticateUser)
	router.POST("/user", user.Register)

	router.Run(address)
}
