package router

import (
	"net/http"

	"github.com/beebeeoii/do-gether/interfaces"
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

func HasListPermission(list interfaces.List, userId string) bool {
	if list.Private && list.Owner != userId && !contains(list.Members, userId) {
		return false
	}

	return true
}

func contains(slice []string, element string) bool {
	for _, a := range slice {
		if a == element {
			return true
		}
	}
	return false
}
