package models

import (
	tk "github.com/eaciit/toolkit"
	"time"
)

type DailySalesAnalysisPayload struct {
	CreatedBy                  []string
	GeoMarket                  []string
	MaterialGroup1             []string
	PerformingOrganization     []string
	ProfitCenter               []int32
	SalesOrg                   []string
	SubGeoMarket               []string
	SubProductLine             []string
	SalesOrderType             []string
	RejectionStatus            []string
	CustomerName               []string
	MonthMode                  string
	Group                      string
	RequiredDeliveryDateStart  string
	RequiredDeliveryDateFinish string

	SalesOrderDateStart  string
	SalesOrderDateFinish string
}

type MainHeaderModel struct {
}

func (u *MainHeaderModel) TableName() string {
	return "rawmainheader"
}

func NewMainHeaderModel() *MainHeaderModel {
	return new(MainHeaderModel)
}

func GetDataDailySalesAnalysis(payload DailySalesAnalysisPayload) ([]tk.M, float64, error) {

	filter := tk.M{}
	if len(payload.GeoMarket) > 0 {
		filter["geomarket"] = tk.M{"$in": payload.GeoMarket}
	}
	if len(payload.MaterialGroup1) > 0 {
		filter["materialgroup1s"] = tk.M{"$in": payload.MaterialGroup1}
	}
	if len(payload.SalesOrg) > 0 {
		filter["salesorg"] = tk.M{"$in": payload.SalesOrg}
	}
	if len(payload.SubGeoMarket) > 0 {
		filter["subgeomarket"] = tk.M{"$in": payload.SubGeoMarket}
	}
	if len(payload.SubProductLine) > 0 {
		filter["subproductline"] = tk.M{"$in": payload.SubProductLine}
	}
	if len(payload.SalesOrderType) > 0 {
		filter["salesordertype"] = tk.M{"$in": payload.SalesOrderType}
	}
	if len(payload.RejectionStatus) > 0 {
		filter["rejectionstatus"] = tk.M{"$in": payload.RejectionStatus}
	}

	if payload.RequiredDeliveryDateStart != "" && payload.RequiredDeliveryDateFinish != "" {
		dateStart, err := time.Parse("20060102", payload.RequiredDeliveryDateStart)
		dateStart = dateStart.AddDate(0, 0, -1)
		if err != nil {
			return nil, 0, err
		}

		dateFinish, err := time.Parse("20060102", payload.RequiredDeliveryDateFinish)
		if err != nil {
			return nil, 0, err
		}

		filter["rddparsed"] = tk.M{"$gt": dateStart, "$lte": dateFinish}
	} else if payload.RequiredDeliveryDateStart != "" {
		dateStart, err := time.Parse("20060102", payload.RequiredDeliveryDateStart)
		dateStart = dateStart.AddDate(0, 0, -1)
		if err != nil {
			return nil, 0, err
		}

		filter["rddparsed"] = tk.M{"$gt": dateStart}
	} else if payload.RequiredDeliveryDateFinish != "" {
		dateFinish, err := time.Parse("20060102", payload.RequiredDeliveryDateFinish)
		if err != nil {
			return nil, 0, err
		}

		filter["rddparsed"] = tk.M{"$lte": dateFinish}
	}

	// =========== actual

	pipeActual := []tk.M{}
	if len(filter) > 0 {
		pipeActual = append(pipeActual, tk.M{"$match": filter})
	}
	pipeActual = append(pipeActual, tk.M{
		"$group": tk.M{
			"_id": tk.M{
				"date": "$salesorderdate",
				"day": tk.M{
					"$dateToString": tk.M{
						"format": "%d",
						"date":   "$salesorderdate",
					},
				},
				"month": tk.M{
					"$dateToString": tk.M{
						"format": "%m",
						"date":   "$salesorderdate",
					},
				},
			},
			"actual": tk.M{
				"$sum": "$netvalue(usd)",
			},
		},
	}, tk.M{
		"$project": tk.M{
			"date":   "$_id.date",
			"day":    "$_id.day",
			"month":  "$_id.month",
			"_id":    1,
			"actual": 1,
		},
	})
	tk.Println("----> query actual", tk.JsonString(pipeActual))

	csr, err := Conn.NewQuery().
		Command("pipe", pipeActual).
		From(NewMainHeaderModel().TableName()).
		Cursor(nil)
	if csr != nil {
		defer csr.Close()
	}
	if err != nil {
		return nil, 0, err
	}

	resultActual := make([]tk.M, 0)
	err = csr.Fetch(&resultActual, 0, false)
	if err != nil {
		return nil, 0, err
	}

	// =========== forecast

	month := "October"
	monthInt := 10

	switch payload.MonthMode {
	case "october":
		// month = "October"
		// monthInt = 10
		month = "September"
		monthInt = 9
	case "september":
		month = "September"
		monthInt = 9
	case "august":
		month = "August"
		monthInt = 8
	}

	filter.Unset("rddparsed")
	filter.Unset("salesordertype")
	filter.Unset("rejectionstatus")

	pipeForecast := []tk.M{
		tk.M{"$match": filter}, // disable filter
		tk.M{"$match": tk.M{
			"forecastmonth":  month,
			"salesordertype": "Forecast",
		}},
		tk.M{"$group": tk.M{
			"_id": nil,
			"forecast": tk.M{
				"$sum": "$forecast",
			},
		}},
	}
	tk.Println("----> query forecast", tk.JsonString(pipeForecast))

	csr, err = Conn.NewQuery().
		Command("pipe", pipeForecast).
		From(NewMainHeaderModel().TableName()).
		Cursor(nil)
	if csr != nil {
		defer csr.Close()
	}
	if err != nil {
		return nil, 0, err
	}

	resultForecast := make([]tk.M, 0)
	err = csr.Fetch(&resultForecast, 0, false)
	if err != nil {
		return nil, 0, err
	}

	tk.Println("resultForecast", resultForecast)

	proratedForecastValue := float64(0)
	if len(resultForecast) > 0 {
		forecastValue := resultForecast[0]["forecast"].(float64)
		days := DaysInMonth(time.Now().Year(), time.Month(monthInt))
		proratedForecastValue = forecastValue / float64(days)
	}

	return resultActual, proratedForecastValue, nil
}

func GetDataDailySalesInsight(payload DailySalesAnalysisPayload) ([]tk.M, []tk.M, []tk.M, error) {
	filter := make(tk.M, 0)

	if len(payload.SalesOrderType) > 0 {
		filter["salesordertype"] = tk.M{"$in": payload.SalesOrderType}
	}
	if len(payload.RejectionStatus) > 0 {
		filter["rejectionstatus"] = tk.M{"$in": payload.RejectionStatus}
	}

	if payload.RequiredDeliveryDateStart != "" && payload.RequiredDeliveryDateFinish != "" {
		dateStart, err := time.Parse("20060102", payload.RequiredDeliveryDateStart)
		dateStart = dateStart.AddDate(0, 0, -1)
		if err != nil {
			return nil, nil, nil, err
		}

		dateFinish, err := time.Parse("20060102", payload.RequiredDeliveryDateFinish)
		if err != nil {
			return nil, nil, nil, err
		}

		filter["rddparsed"] = tk.M{"$gt": dateStart, "$lte": dateFinish}
	} else if payload.RequiredDeliveryDateStart != "" {
		dateStart, err := time.Parse("20060102", payload.RequiredDeliveryDateStart)
		dateStart = dateStart.AddDate(0, 0, -1)
		if err != nil {
			return nil, nil, nil, err
		}

		filter["rddparsed"] = tk.M{"$gt": dateStart}
	} else if payload.RequiredDeliveryDateFinish != "" {
		dateFinish, err := time.Parse("20060102", payload.RequiredDeliveryDateFinish)
		if err != nil {
			return nil, nil, nil, err
		}

		filter["rddparsed"] = tk.M{"$lte": dateFinish}
	}

	// ============== aggr actual data

	month := "October"
	monthInt := "10"
	switch payload.MonthMode {
	case "october":
		month = "October"
		monthInt = "10"
	case "september":
		month = "September"
		monthInt = "09"
	case "august":
		month = "August"
		monthInt = "08"
	}
	_ = monthInt

	pipeAggrActual := []tk.M{}
	if len(filter) > 0 {
		pipeAggrActual = append(pipeAggrActual, tk.M{"$match": filter})
	}
	pipeAggrActual = append(pipeAggrActual, tk.M{
		"$project": tk.M{
			"month": tk.M{
				"$dateToString": tk.M{
					"format": "%m",
					"date":   "$salesorderdate",
				},
			},
			"netvalue(usd)":  1,
			"subgeomarket":   1,
			"subproductline": 1,
		},
	}, tk.M{
		"$match": tk.M{
			"month": tk.M{"$in": []string{"08", "09", "10"}},
		},
	}, tk.M{
		"$group": tk.M{
			"_id": tk.M{
				"group": "$" + payload.Group,
				"month": "$month",
			},
			"actual": tk.M{
				"$sum": "$netvalue(usd)",
			},
		},
	})

	tk.Println("pipeAggrActual", tk.JsonString(pipeAggrActual))

	csrAggrActual, err := Conn.NewQuery().
		Command("pipe", pipeAggrActual).
		From(NewMainHeaderModel().TableName()).
		Cursor(nil)
	if csrAggrActual != nil {
		defer csrAggrActual.Close()
	}
	if err != nil {
		return nil, nil, nil, err
	}

	resultAggrActual := make([]tk.M, 0)
	err = csrAggrActual.Fetch(&resultAggrActual, 0, false)
	if err != nil {
		return nil, nil, nil, err
	}

	// ============== aggr forecast data

	month = "October"
	monthInt = "10"
	switch payload.MonthMode {
	case "october":
		// month = "October"
		// monthInt = "10"
		month = "September"
		monthInt = "09"
	case "september":
		month = "September"
		monthInt = "09"
	case "august":
		month = "August"
		monthInt = "08"
	}
	_ = monthInt

	pipeAggrForecast := []tk.M{}
	// if len(filter) > 0 {
	// 	pipeAggrForecast = append(pipeAggrForecast, tk.M{"$match": filter})
	// }
	pipeAggrForecast = append(pipeAggrForecast, tk.M{
		"$project": tk.M{
			"forecastmonth":  1,
			"subgeomarket":   1,
			"subproductline": 1,
			"salesordertype": 1,
			"forecast":       1,
		},
	}, tk.M{
		"$match": tk.M{
			"salesordertype": "Forecast",
			"forecastmonth":  month,
		},
	}, tk.M{
		"$group": tk.M{
			"_id": "$" + payload.Group,
			"forecast": tk.M{
				"$sum": "$forecast",
			},
		},
	})

	tk.Println("=======>pipeAggrForecast", tk.JsonString(pipeAggrForecast))

	csrAggrForecast, err := Conn.NewQuery().
		Command("pipe", pipeAggrForecast).
		From(NewMainHeaderModel().TableName()).
		Cursor(nil)
	if csrAggrForecast != nil {
		defer csrAggrForecast.Close()
	}
	if err != nil {
		return nil, nil, nil, err
	}

	resultAggrForecast := make([]tk.M, 0)
	err = csrAggrForecast.Fetch(&resultAggrForecast, 0, false)
	if err != nil {
		return nil, nil, nil, err
	}

	// ============== master data

	pipeMaster := []tk.M{tk.M{
		"$group": tk.M{"_id": "$" + payload.Group},
	}}

	csrMaster, err := Conn.NewQuery().
		Command("pipe", pipeMaster).
		From(NewMainHeaderModel().TableName()).
		Cursor(nil)
	if csrMaster != nil {
		defer csrMaster.Close()
	}
	if err != nil {
		return nil, nil, nil, err
	}

	resultMaster := make([]tk.M, 0)
	err = csrMaster.Fetch(&resultMaster, 0, false)
	if err != nil {
		return nil, nil, nil, err
	}

	return resultAggrActual, resultAggrForecast, resultMaster, nil
}

func GetDataMasterByField(field string) ([]tk.M, error) {
	csr, err := Conn.NewQuery().
		From("master" + field).
		Select().
		Cursor(nil)
	if csr != nil {
		defer csr.Close()
	}
	if err != nil {
		return nil, err
	}

	result := make([]tk.M, 0)
	err = csr.Fetch(&result, 0, false)
	if err != nil {
		return nil, err
	}

	return result, nil
}
