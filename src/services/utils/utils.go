package service

import "github.com/rs/xid"

func GenerateUid() string {
	return xid.New().String()
}

func Contains(slice []string, element string) bool {
	for _, a := range slice {
		if a == element {
			return true
		}
	}
	return false
}
