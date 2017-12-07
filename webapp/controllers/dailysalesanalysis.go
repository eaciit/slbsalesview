package controllers

import (
	"eaciit/slbsalesview/webapp/models"
	"github.com/eaciit/knot/knot.v1"
)

type DailySalesAnalysisController struct {
	*BaseController
}

func (c *DailySalesAnalysisController) Index(k *knot.WebContext) interface{} {
	c.SetResponseTypeHTML(k)
	if !c.ValidateAccessOfRequestedURL(k) {
		return nil
	}

	return c.SetViewData(nil)
}

func (c *DailySalesAnalysisController) GetDataForLineChartForecastVsActual(k *knot.WebContext) interface{} {
	c.SetResponseTypeAJAX(k)
	if !c.ValidateAccessOfRequestedURL(k) {
		return nil
	}

	dataActual, dataForecast, err := models.GetDataDailySalesAnalysis([]string{}, []string{}, []string{}, []string{}, []string{}, []string{}, []string{}, []string{})
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	return c.SetResultOK(struct {
		Actual           interface{}
		ProratedForecast interface{}
	}{
		dataActual,
		dataForecast,
	})

	return nil
}

func (c *DailySalesAnalysisController) GetDataForTornadoChartAugVsOct(k *knot.WebContext) interface{} {
	c.SetResponseTypeAJAX(k)
	if !c.ValidateAccessOfRequestedURL(k) {
		return nil
	}

	payload := struct {
		Group string
	}{}
	err := k.GetPayload(&payload)
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	dataAggr, dataMaster, err := models.GetDataDailySalesInsight(payload.Group)
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	return c.SetResultOK(struct {
		Detail interface{}
		Master interface{}
	}{
		dataAggr,
		dataMaster,
	})

	return nil
}
