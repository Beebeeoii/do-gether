package router

import (
	"github.com/gin-gonic/gin"

	auth "github.com/beebeeoii/do-gether/routers/auth"
	user "github.com/beebeeoii/do-gether/routers/user"
)

func Init(address string) {
	router := gin.Default()
	router.Use(CORSMiddleware())
	router.GET("/user/authenticate", auth.AuthenticateUser)
	router.POST("/user", user.Register)
	router.GET("/user/:id", user.RetrieveUserById)

	router.Run(address)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, id")
		c.Header("Access-Control-Allow-Methods", "POST,HEAD,PATCH, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
