package models

import (
	tk "github.com/eaciit/toolkit"
	"time"
)

type MainHeaderModel struct {
}

func (u *MainHeaderModel) TableName() string {
	return "rawmainheader"
}

func NewMainHeaderModel() *MainHeaderModel {
	return new(MainHeaderModel)
}

func GetDataDailySalesAnalysis(salesorg, geomarket, subgeomarket, performingorganization, PROFITCENTRES, subproductline, createdby, MATERIALGROUP []string) ([]tk.M, float64, error) {

	// =========== actual

	pipeActual, err := DeserializeArray(`
        [{
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

	pipeForecast, err := DeserializeArray(`
        [{
            "$match": {
                "forecastmonth": "` + month + `"
            }
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
