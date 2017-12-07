package models

import (
	tk "github.com/eaciit/toolkit"
	"time"
)

type DailySalesAnalysisPayload struct {
	CreatedBy              []string
	GeoMarket              []string
	MaterialGroup1         []string
	PerformingOrganization []string
	ProfitCenter           []int32
	SalesOrg               []string
	SubGeoMarket           []string
	SubProductLine         []string
	SalesOrderType         []string
	RejectionStatus        []string
	RequiredDeliveryDate   string
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
	if len(payload.CreatedBy) > 0 {
		filter["createdby"] = tk.M{"$in": payload.CreatedBy}
	}
	if len(payload.GeoMarket) > 0 {
		filter["geomarket"] = tk.M{"$in": payload.GeoMarket}
	}
	if len(payload.MaterialGroup1) > 0 {
		filter["materialgroup1s"] = tk.M{"$in": payload.MaterialGroup1}
	}
	if len(payload.PerformingOrganization) > 0 {
		filter["performingorganization"] = tk.M{"$in": payload.PerformingOrganization}
	}
	if len(payload.ProfitCenter) > 0 {
		filter["profitcenters"] = tk.M{"$in": payload.ProfitCenter}
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
	if payload.RequiredDeliveryDate != "" {
		date, err := time.Parse("20060102", payload.RequiredDeliveryDate)
		if err != nil {
			return nil, 0, err
		}

		filter["requireddeliverydate"] = date
	}

	whereClauseActual := ""
	if len(filter) > 0 {
		whereClauseActual = `{ "$match": ` + tk.JsonString(filter) + ` },`
	}

	// =========== actual

	pipeActual, err := DeserializeArray(`
        [

        ` + whereClauseActual + `

        {
            "$group": {
                "_id": {
                    "date": "$acceptancedate",
                    "day": {
                        "$dateToString": {
                            "format": "%d",
                            "date": "$acceptancedate"
                        }
                    },
                    "month": {
                        "$dateToString": {
                            "format": "%m",
                            "date": "$acceptancedate"
                        }
                    }
                },
                "actual": {
                    "$sum": "$netvalue(usd)"
                }
            }
        }, {
            "$project": {
                "date": "$_id.date",
                "day": "$_id.day",
                "month": "$_id.month",
                "_id": 1,
                "actual": 1
            }
        }]
    `)
	if err != nil {
		return nil, 0, err
	}

	// tk.Println("----> query actual", tk.JsonString(pipeActual))

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

	month := "September" // "October"
	monthInt := 9        // 10

	filter["forecastmonth"] = month
	filter["salesordertype"] = "Forecast"

	pipeForecast, err := DeserializeArray(`
        [{ 
            "$match": ` + tk.JsonString(filter) + ` 
        }, {
            "$group": {
                "_id": null,
                "forecast": {
                    "$sum": "$forecast"
                }
            }
        }]
    `)
	if err != nil {
		return nil, 0, err
	}

	// tk.Println("----> query actual", tk.JsonString(pipeActual))

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

	proratedForecastValue := float64(0)
	if len(resultForecast) > 0 {
		forecastValue := resultForecast[0]["forecast"].(float64)
		days := DaysInMonth(time.Now().Year(), time.Month(monthInt))
		proratedForecastValue = forecastValue / float64(days)
	}

	return resultActual, proratedForecastValue, nil
}

func GetDataDailySalesInsight(group string) ([]tk.M, []tk.M, error) {

	// ============== aggr data

	pipeAggr, err := DeserializeArray(`
        [{
            "$project": {
                "month": {
                    "$dateToString": {
                        "format": "%m",
                        "date": "$acceptancedate"
                    }
                },
                "netvalue(usd)": 1,
                "subgeomarket": 1,
                "subproductline": 1
            }
        }, {
            "$match": {
                "month": {
                    "$in": ["08", "09"]
                }
            }
        }, {
            "$group": {
                "_id": {
                    "group": "$` + group + `",
                    "month": "$month"
                },
                "actual": {
                    "$sum": "$netvalue(usd)"
                }
            }
        }]
    `)
	if err != nil {
		return nil, nil, err
	}

	csrAggr, err := Conn.NewQuery().
		Command("pipe", pipeAggr).
		From(NewMainHeaderModel().TableName()).
		Cursor(nil)
	if csrAggr != nil {
		defer csrAggr.Close()
	}
	if err != nil {
		return nil, nil, err
	}

	resultAggr := make([]tk.M, 0)
	err = csrAggr.Fetch(&resultAggr, 0, false)
	if err != nil {
		return nil, nil, err
	}

	// ============== master data

	pipeMaster, err := DeserializeArray(`
        [{
            "$group": {
                "_id": "$` + group + `"
            }
        }]
    `)
	if err != nil {
		return nil, nil, err
	}

	csrMaster, err := Conn.NewQuery().
		Command("pipe", pipeMaster).
		From(NewMainHeaderModel().TableName()).
		Cursor(nil)
	if csrMaster != nil {
		defer csrMaster.Close()
	}
	if err != nil {
		return nil, nil, err
	}

	resultMaster := make([]tk.M, 0)
	err = csrMaster.Fetch(&resultMaster, 0, false)
	if err != nil {
		return nil, nil, err
	}

	return resultAggr, resultMaster, nil
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
