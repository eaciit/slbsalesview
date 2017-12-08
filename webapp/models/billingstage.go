package models

import (
	tk "github.com/eaciit/toolkit"
	"time"
)

func generateGridFilter(payload DailySalesAnalysisPayload) (tk.M, error) {
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
			return nil, err
		}

		dateFinish, err := time.Parse("20060102", payload.RequiredDeliveryDateFinish)
		if err != nil {
			return nil, err
		}

		filter["rddparsed"] = tk.M{"$gt": dateStart, "$lte": dateFinish}
	} else if payload.RequiredDeliveryDateStart != "" {
		dateStart, err := time.Parse("20060102", payload.RequiredDeliveryDateStart)
		dateStart = dateStart.AddDate(0, 0, -1)
		if err != nil {
			return nil, err
		}

		filter["rddparsed"] = tk.M{"$gt": dateStart}
	} else if payload.RequiredDeliveryDateFinish != "" {
		dateFinish, err := time.Parse("20060102", payload.RequiredDeliveryDateFinish)
		if err != nil {
			return nil, err
		}

		filter["rddparsed"] = tk.M{"$lte": dateFinish}
	}

	if payload.SalesOrderDateStart != "" && payload.SalesOrderDateFinish != "" {
		dateStart, err := time.Parse("20060102", payload.SalesOrderDateStart)
		dateStart = dateStart.AddDate(0, 0, -1)
		if err != nil {
			return nil, err
		}

		dateFinish, err := time.Parse("20060102", payload.SalesOrderDateFinish)
		if err != nil {
			return nil, err
		}

		filter["salesorderdate"] = tk.M{"$gt": dateStart, "$lte": dateFinish}
	} else if payload.SalesOrderDateStart != "" {
		dateStart, err := time.Parse("20060102", payload.SalesOrderDateStart)
		dateStart = dateStart.AddDate(0, 0, -1)
		if err != nil {
			return nil, err
		}

		filter["salesorderdate"] = tk.M{"$gt": dateStart}
	} else if payload.SalesOrderDateFinish != "" {
		dateFinish, err := time.Parse("20060102", payload.SalesOrderDateFinish)
		if err != nil {
			return nil, err
		}

		filter["salesorderdate"] = tk.M{"$lte": dateFinish}
	}

	return filter, nil
}

func GetDataGridBillingStage(payload DailySalesAnalysisPayload) ([]tk.M, []tk.M, error) {
	filter, err := generateGridFilter(payload)
	if err != nil {
		return nil, nil, err
	}

	// ============== aggr actual data

	// month := ""
	// switch payload.MonthMode {
	// case "october":
	//  month = "October"
	// case "september":
	//  month = "September"
	// case "august":
	//  month = "August"
	// }

	pipeAggrGrid := []tk.M{}
	if len(filter) > 0 {
		pipeAggrGrid = append(pipeAggrGrid, tk.M{"$match": filter})
	}
	pipeAggrGrid = append(pipeAggrGrid, tk.M{
		"$group": tk.M{
			"_id": "$subgeomarket",
			"totalIncomplete": tk.M{
				"$sum": "$incomplete",
			},
			"totalRequiresOpsApproval": tk.M{
				"$sum": "$requiresopsapproval",
			},
			"totalZSPTNoDelivery": tk.M{
				"$sum": "$zsptnodelivery",
			},
			"totalZSPTDelNotShipped": tk.M{
				"$sum": "$zsptdelnotshipped",
			},
			"totalPendingRevenueRecognition": tk.M{
				"$sum": "$pendingrevenuerecognition",
			},
			"totalEstimateDrecognized": tk.M{
				"$sum": "$estimatedrecognized",
			},
			"totalNetValueUSD": tk.M{
				"$sum": "$netvalue(usd)",
			},
			"totalCreditBlock": tk.M{
				"$sum": "$creditblock",
			},
			"totalInvoiced": tk.M{
				"$sum": "$invoiced",
			},
			"totalPendingInvoice": tk.M{
				"$sum": "$pendinginvoicewaitingonsupportingdocuments",
			},
		},
	})
	pipeAggrGrid = append(pipeAggrGrid, tk.M{
		"$match": tk.M{
			"_id": tk.M{"$ne": 0},
		},
	})

	tk.Println("pipeAggrGrid", tk.JsonString(pipeAggrGrid))

	csrAggrActual, err := Conn.NewQuery().
		Command("pipe", pipeAggrGrid).
		From(NewMainHeaderModel().TableName()).
		Cursor(nil)
	if csrAggrActual != nil {
		defer csrAggrActual.Close()
	}
	if err != nil {
		return nil, nil, err
	}

	resultAggrGrid := make([]tk.M, 0)
	err = csrAggrActual.Fetch(&resultAggrGrid, 0, false)
	if err != nil {
		return nil, nil, err
	}

	return resultAggrGrid, nil, nil
}
