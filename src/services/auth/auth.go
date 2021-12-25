package service

import (
	"fmt"
	"os"

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
