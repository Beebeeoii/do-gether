package service

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/beebeeoii/do-gether/interfaces"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

const PASSWORD_HASH_COST = 10

func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(generateFinalPassword(password)), PASSWORD_HASH_COST)
	return string(hashedBytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(generateFinalPassword(password)))
	return err == nil
}

func generateFinalPassword(password string) string {
	PASSWORD_SECRET := os.Getenv("PASSWORD_SECRET")
	return fmt.Sprintf("%s%s", password, PASSWORD_SECRET)
}

func GenerateJwt(userId string) (string, error) {
	JWT_SECRET := os.Getenv("JWT_SECRET")

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id": userId,
	})

	return token.SignedString([]byte(JWT_SECRET))
}

func ValidateAuthData(jwtToken string, userId string) (bool, error) {
	JWT_SECRET := os.Getenv("JWT_SECRET")

	token, tokenErr := jwt.Parse(jwtToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(JWT_SECRET), nil
	})

	if tokenErr != nil {
		return false, tokenErr
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid && claims["id"] == userId {
		return true, nil
	} else {
		return false, fmt.Errorf("invalid auth data")
	}
}

func ExtractAuthData(header http.Header) (interfaces.AuthData, error) {
	tokenValue := header.Get("Authorization")
	strArr := strings.Split(tokenValue, " ")
	userIdValue := header.Get("id")

	if len(strArr) == 2 {
		return interfaces.AuthData{
			Token:  strArr[1],
			UserId: userIdValue,
		}, nil
	}

	return interfaces.AuthData{}, fmt.Errorf("invalid auth data provided")
}
