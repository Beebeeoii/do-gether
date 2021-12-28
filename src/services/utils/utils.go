package service

import "github.com/rs/xid"

func GenerateUid() string {
	return xid.New().String()
}
