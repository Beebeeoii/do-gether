package router

import (
	"github.com/gin-gonic/gin"
)

func JSON(c *gin.Context, code int, obj interface{}) {
	c.Header("Access-Control-Allow-Origin", "*")
	c.JSON(code, obj)
}
