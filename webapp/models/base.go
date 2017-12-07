package models

import (
	db "github.com/eaciit/dbox"
	tk "github.com/eaciit/toolkit"
	"time"
)

var Conn db.IConnection

func DeserializeObject(queryString string) (tk.M, error) {
	query := make(tk.M)
	err := tk.UnjsonFromString(queryString, &query)
	if err != nil {
		return nil, err
	}

	return query, err
}

func DeserializeArray(queryString string) ([]tk.M, error) {
	query := make([]tk.M, 0)
	err := tk.UnjsonFromString(queryString, &query)
	if err != nil {
		return nil, err
	}

	return query, err
}

func DaysInMonth(year int, m time.Month) int {
	return time.Date(year, m+1, 0, 0, 0, 0, 0, time.UTC).Day()
}
