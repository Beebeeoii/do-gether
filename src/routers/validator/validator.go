package router

import (
	"net/http"

	authService "github.com/beebeeoii/do-gether/services/auth"
	"github.com/go-playground/validator/v10"
)

var Validate *validator.Validate

func Init() {
	Validate = validator.New()
}

func ValidateAuthDataFromHeader(header http.Header) error {
	authData, authDataErr := authService.ExtractAuthData(header)
	if authDataErr != nil {
		return authDataErr
	}

	_, validationErr := authService.ValidateAuthData(authData.Token, authData.UserId)
	if validationErr != nil {
		return validationErr
	}

	return nil
}
