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

func (c *DailySalesAnalysisController) GetDataMaster(k *knot.WebContext) interface{} {
	c.SetResponseTypeAJAX(k)
	if !c.ValidateAccessOfRequestedURL(k) {
		return nil
	}

	masterCreatedBy, err := models.GetDataMasterByField("createdby")
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	masterGeoMarket, err := models.GetDataMasterByField("geomarket")
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	masterMaterialGroup1, err := models.GetDataMasterByField("materialgroup1")
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	masterPerformingOrganization, err := models.GetDataMasterByField("performingorganization")
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	masterProfitCenter, err := models.GetDataMasterByField("profitcenter")
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	masterSalesOrg, err := models.GetDataMasterByField("salesorg")
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	masterSubGeoMarket, err := models.GetDataMasterByField("subgeomarket")
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	masterSubProductLine, err := models.GetDataMasterByField("subproductline")
	if err != nil {
		return c.SetResultError(err.Error(), nil)
	}

	return c.SetResultOK(struct {
		CreatedBy              interface{}
		GeoMarket              interface{}
		MaterialGroup1         interface{}
		PerformingOrganization interface{}
		ProfitCenter           interface{}
		SalesOrg               interface{}
		SubGeoMarket           interface{}
		SubProductLine         interface{}
	}{
		masterCreatedBy,
		masterGeoMarket,
		masterMaterialGroup1,
		masterPerformingOrganization,
		masterProfitCenter,
		masterSalesOrg,
		masterSubGeoMarket,
		masterSubProductLine,
	})
}
