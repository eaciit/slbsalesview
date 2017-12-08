package controllers

import (
	"eaciit/slbsalesview/webapp/models"
	"github.com/eaciit/knot/knot.v1"
	// tk "github.com/eaciit/toolkit"
)

type BillingStageController struct {
	*BaseController
}

func (c *BillingStageController) Index(k *knot.WebContext) interface{} {
	c.SetResponseTypeHTML(k)
	if !c.ValidateAccessOfRequestedURL(k) {
		return nil
	}

	return c.SetViewData(nil)
}

func (c *BillingStageController) GetDataGrid(k *knot.WebContext) interface{} {
	c.SetResponseTypeAJAX(k)
	if !c.ValidateAccessOfRequestedURL(k) {
		return nil
	}

	payload := struct {
		models.DailySalesAnalysisPayload
		GridMode int
	}{}
	err := k.GetPayload(&payload)
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	dataAggrGrid, _, err := models.GetDataGridBillingStage(payload.DailySalesAnalysisPayload)
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}
	// dataAggrGrid := make([]tk.M, 0)
	// if payload.GridMode == 1 {
	// 	dataAggrGrid, _, err = models.GetDataGrid1(payload.DailySalesAnalysisPayload)
	// 	if err != nil {
	// 		return c.SetResultError(err.Error(), nil)
	// 	}
	// } else {
	// 	dataAggrGrid, _, err = models.GetDataGrid2(payload.DailySalesAnalysisPayload)
	// 	if err != nil {
	// 		return c.SetResultError(err.Error(), nil)
	// 	}
	// }

	return c.SetResultOK(struct {
		GridData interface{}
	}{
		dataAggrGrid,
	})

	return nil
}
