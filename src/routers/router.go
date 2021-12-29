package router

import (
	"github.com/gin-gonic/gin"

	auth "github.com/beebeeoii/do-gether/routers/auth"
	list "github.com/beebeeoii/do-gether/routers/list"
	task "github.com/beebeeoii/do-gether/routers/task"
	user "github.com/beebeeoii/do-gether/routers/user"
	validator "github.com/beebeeoii/do-gether/routers/validator"
)

func Init(address string) {
	router := gin.Default()
	router.Use(CORSMiddleware())

	validator.Init()

	router.GET("/user/authenticate", auth.AuthenticateUser)
	router.POST("/user", user.Register)
	router.GET("/user/:id", user.RetrieveUserById)
	router.GET("/user/friend", user.FindUserByUsername)
	router.DELETE("/user/friend", user.RemoveFriend)
	router.POST("/user/friend/sendReq", user.SendFriendReq)
	router.POST("/user/friend/acceptReq", user.AcceptFriendReq)
	router.DELETE("/user/friend/deleteReq", user.RemoveFriendRequest)

	router.POST("/list", list.CreateList)
	router.GET("/list", list.RetrieveListsByUserId)
	router.GET("/list/:id", list.RetrieveListById)

	router.POST("/task", task.CreateTask)
	router.POST("/task/edit", task.EditTask)
	router.POST("/task/reorder", task.ReorderTasks)
	router.GET("/task", task.RetrieveTasksByListId)
	router.GET("/task/tagSuggestion", task.RetrieveTagSuggestion)

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
