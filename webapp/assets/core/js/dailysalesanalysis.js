var dsa = {}
viewModel.dailySalesAnalysis = dsa

dsa.masterCreatedBy = ko.observableArray([])
dsa.masterGeoMarket = ko.observableArray([])
dsa.masterMaterialGroup1 = ko.observableArray([])
dsa.masterPerformingOrganization = ko.observableArray([])
dsa.masterProfitCenter = ko.observableArray([])
dsa.masterSalesOrg = ko.observableArray([])
dsa.masterSubGeoMarket = ko.observableArray([])
dsa.masterSubProductLine = ko.observableArray([])
dsa.masterSalesOrderType = ko.observableArray([])
dsa.masterRejectionStatus = ko.observableArray([])

dsa.filterCreatedBySelected = ko.observableArray([])
dsa.filterGeoMarketSelected = ko.observableArray([])
dsa.filterMaterialGroup1Selected = ko.observableArray([])
dsa.filterPerformingOrganizationSelected = ko.observableArray([])
dsa.filterProfitCenterSelected = ko.observableArray([])
dsa.filterSalesOrgSelected = ko.observableArray([])
dsa.filterSubGeoMarketSelected = ko.observableArray([])
dsa.filterSubProductLineSelected = ko.observableArray([])
dsa.filterSalesOrderTypeSelected = ko.observableArray([])
dsa.filterRejectionStatusSelected = ko.observableArray([])
dsa.filterRequiredDeliveryDateStart = ko.observable('')
dsa.filterRequiredDeliveryDateFinish = ko.observable('')

dsa.getDataValue = function (dateData) {
    return ((dateData || '') == '') ? '' : moment(dateData).format('YYYYMMDD')
}

dsa.getFilterValues = function () {
    return {
        CreatedBy: dsa.filterCreatedBySelected(),
        GeoMarket: dsa.filterGeoMarketSelected(),
        MaterialGroup1: dsa.filterMaterialGroup1Selected(),
        PerformingOrganization: dsa.filterPerformingOrganizationSelected(),
        ProfitCenter: dsa.filterProfitCenterSelected(),
        SalesOrg: dsa.filterSalesOrgSelected(),
        SubGeoMarket: dsa.filterSubGeoMarketSelected(),
        SubProductLine: dsa.filterSubProductLineSelected(),
        SalesOrderType: dsa.filterSalesOrderTypeSelected(),
        RejectionStatus: dsa.filterRejectionStatusSelected(),
        RequiredDeliveryDateStart: dsa.getDataValue(dsa.filterRequiredDeliveryDateStart()),
        RequiredDeliveryDateFinish: dsa.getDataValue(dsa.filterRequiredDeliveryDateFinish()),
        MonthMode: dsa.monthMode(),
        Group: dsa.filterInsightGroupSelected()
    }
}

dsa.monthMode = ko.observable('')
dsa.monthMode.subscribe(function (newValue) {
    dsa.filterCreatedBySelected([])
    dsa.filterGeoMarketSelected([])
    dsa.filterMaterialGroup1Selected([])
    dsa.filterPerformingOrganizationSelected([])
    dsa.filterProfitCenterSelected([])
    dsa.filterSalesOrgSelected([])
    dsa.filterSubGeoMarketSelected([])
    dsa.filterSubProductLineSelected([])
    dsa.filterSalesOrderTypeSelected([])
    dsa.filterRejectionStatusSelected([])
    dsa.filterRequiredDeliveryDateStart('')
    dsa.filterRequiredDeliveryDateFinish('')

    switch (newValue) {
        case 'october': 
            dsa.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected'])
            dsa.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT'])
            dsa.filterRequiredDeliveryDateStart(moment('2017-10-01').toDate())
            dsa.filterRequiredDeliveryDateFinish(moment('2017-10-31').toDate())
        break
        case 'september': 
            dsa.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected'])
            dsa.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT'])
            dsa.filterRequiredDeliveryDateStart(moment('2017-09-01').toDate())
            dsa.filterRequiredDeliveryDateFinish(moment('2017-09-30').toDate())
        break
        case 'august': 
            dsa.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected'])
            dsa.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT'])
            dsa.filterRequiredDeliveryDateStart(moment('2017-07-26').toDate())
            dsa.filterRequiredDeliveryDateFinish(moment('2017-08-31').toDate())
            dsa.insightMode('actualforecast')
            $('[href="#actualforecast"]').parent().addClass('active').siblings().removeClass('active')
        break
    }

    newPromise()
    .then(function () {
        return dsa.refreshChartDailySalesAnalysis()
    })
    .then(function () {
        return dsa.refreshChartDailySalesInsights()
    })
})

dsa.insightMode = ko.observable('')
dsa.insightMode.subscribe(function (newValue) {
    dsa.refreshChartDailySalesInsights()
})
dsa.insightModeMonthVersusLabel = ko.computed(function () {
    if (dsa.monthMode() == 'october') {
        return 'Oct Vs Sept'
    } else if (dsa.monthMode() == 'september') {
        return 'Sept Vs Aug'
    } else {
        return 'Aug'
    }
}, dsa.monthMode)

dsa.refreshChartDailySalesAnalysis = function () {
    return newPromise()

    .then(function () {
        return dsa.loadDataChartDailySalesAnalysis()
    })
    .then(function (data) {
        return dsa.renderChartDailySalesAnalysis(data)
    })

    .catch(function (errorMessage) {
        swal('Error!', errorMessage, 'error')
    })
}

dsa.loadDataMaster = function () {
    return new Promise(function (resolve, reject) {
        var url = '/DailySalesAnalysis/GetDataMaster'
        var param = { }

        ajaxPost(url, param, function (res) {
            if (res.Status !== "OK") {
                reject(res.Message)
                return
            }

            dsa.masterCreatedBy(res.Data.CreatedBy.map(function (d) { return d._id }))
            dsa.masterGeoMarket(res.Data.GeoMarket.map(function (d) { return d._id }))
            dsa.masterMaterialGroup1(res.Data.MaterialGroup1.map(function (d) { return d._id }))
            dsa.masterPerformingOrganization(res.Data.PerformingOrganization.map(function (d) { return d._id }))
            dsa.masterProfitCenter(res.Data.ProfitCenter.map(function (d) { return d._id }))
            dsa.masterSalesOrg(res.Data.SalesOrg.map(function (d) { return d._id }))
            dsa.masterSubGeoMarket(res.Data.SubGeoMarket.map(function (d) { return d._id }))
            dsa.masterSubProductLine(res.Data.SubProductLine.map(function (d) { return d._id }))
            dsa.masterSalesOrderType(res.Data.SalesOrderType.map(function (d) { return d._id }))
            dsa.masterRejectionStatus(res.Data.RejectionStatus.map(function (d) { return d._id }))
            resolve()
        }, function (res) {
            reject(xhr.responseText)
        })
    })
}

dsa.loadDataChartDailySalesAnalysis = function () {
    return new Promise(function (resolve, reject) {
        var doIt = function (param, callbackOK, callbackFail) {
            var url = "/DailySalesAnalysis/GetDataForLineChartForecastVsActual"

            param = JSON.parse(JSON.stringify(param))

            // if (param.MonthMode == "october") {
            //     param.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-09-01').toDate())
            //     param.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-09-30').toDate())
            //     param.MonthMode = 'september'
            // }

            ajaxPost(url, param, function (res) {
                if (res.Status !== "OK") {
                    callbackFail(res.Message)
                    return
                }

                callbackOK(res.Data)
            }, function (res) {
                callbackFail(xhr.responseText)
            })
        }

        var param = dsa.getFilterValues()
        if (param.MonthMode === 'october') {
            var param1 = dsa.getFilterValues()
            param1.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-10-01').toDate())
            param1.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-10-31').toDate())
            param1.MonthMode = 'october'
            doIt(param1, function (data1) {
                dsa.constructDataChartDailySalesAnalysis(param1.MonthMode, data1).then(function (data1Constructed) {

                    var param2 = dsa.getFilterValues()
                    param2.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-09-01').toDate())
                    param2.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-09-30').toDate())
                    param2.MonthMode = 'september'
                    doIt(param2, function (data2) {
                        dsa.constructDataChartDailySalesAnalysis(param2.MonthMode, data2).then(function (data2Constructed) {

                            var param3 = dsa.getFilterValues()
                            param3.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-07-26').toDate())
                            param3.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-08-31').toDate())
                            param3.MonthMode = 'august'
                            doIt(param3, function (data3) {
                                dsa.constructDataChartDailySalesAnalysis(param3.MonthMode, data3).then(function (data3Constructed) {

                                    data1Constructed.forEach(function (d, i) {
                                        d.actualAugust = (data3Constructed[i] || { actualAugust: 0 }).actualAugust
                                        d.actualSeptember = (data2Constructed[i] || { actualSeptember: 0 }).actualSeptember

                                        if (i == 30) {
                                            d.actualSeptember = null
                                        }
                                    })

                                    // console.log('data1Constructed', data1Constructed)

                                    resolve(data1Constructed)
                                })
                            }, function (errorMessage) {
                                reject(errorMessage)
                            })
                        })
                    }, function (errorMessage) {
                        reject(errorMessage)
                    })
                })
            }, function (errorMessage) {
                reject(errorMessage)
            })
        } else if (param.MonthMode == 'september') {
            var param2 = dsa.getFilterValues()
            param2.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-09-01').toDate())
            param2.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-09-30').toDate())
            param2.MonthMode = 'september'
            doIt(param2, function (data2) {
                dsa.constructDataChartDailySalesAnalysis(param2.MonthMode, data2).then(function (data2Constructed) {

                    var param3 = dsa.getFilterValues()
                    param3.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-07-26').toDate())
                    param3.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-08-31').toDate())
                    param3.MonthMode = 'august'
                    doIt(param3, function (data3) {
                        dsa.constructDataChartDailySalesAnalysis(param3.MonthMode, data3).then(function (data3Constructed) {

                            data2Constructed.forEach(function (d, i) {
                                d.actualAugust = (data3Constructed[i] || { actualAugust: 0 }).actualAugust
                            })

                            resolve(data2Constructed)
                        })
                    }, function (errorMessage) {
                        reject(errorMessage)
                    })
                })
            }, function (errorMessage) {
                reject(errorMessage)
            })
        } else if (param.MonthMode == 'august') {
            doIt(dsa.getFilterValues(), function (data) {
                dsa.constructDataChartDailySalesAnalysis(param.MonthMode, data).then(function (dataConstructed) {
                    resolve(dataConstructed)
                })
            }, function (errorMessage) {
                reject(errorMessage)
            })
        }
    })
}

dsa.constructDataChartDailySalesAnalysis = function (monthMode, data) {
    return new Promise(function (resolve, reject) {
        var flatData = []

        var maxDate = 31
        switch (monthMode) {
            case "august": maxDate = 31; break
            case "september": maxDate = 30; break
            case "october": maxDate = 31; break
        }

        for (i = 1; i <= maxDate; i++) {
            var rowData = {
                day: i,
                forecast: data.ProratedForecast,
                actualAugust: 0,
                actualSeptember: 0,
                actualOctober: 0,
            }
            flatData.push(rowData)

            var dataFoundAugust = data.Actual.find(function (d) {
                return d.month == "08" && d.day == i
            })
            if (typeof dataFoundAugust !== 'undefined') {
                rowData.actualAugust = dataFoundAugust.actual
            }

            var dataFoundSeptember = data.Actual.find(function (d) {
                return d.month == "09" && d.day == i
            })
            if (typeof dataFoundSeptember !== 'undefined') {
                rowData.actualSeptember = dataFoundSeptember.actual
            }

            var dataFoundOctober = data.Actual.find(function (d) {
                // return d.month == "10" && d.day == i
                return d.month == "10" && d.day == i
            })
            if (typeof dataFoundOctober !== 'undefined') {
                rowData.actualOctober = dataFoundOctober.actual
            }
        }

        var flatDataSorted = _.orderBy(flatData, 'day')
        var cumulativeData = flatDataSorted.map(function (each, index) {
            let prevData = {
                forecast: 0,
                actualAugust: 0,
                actualSeptember: 0,
                actualOctober: 0,
            }

            if (index > 0) {
                prevData = flatDataSorted[index - 1]
            }

            each.forecast = each.forecast + prevData.forecast
            each.actualAugust = each.actualAugust + prevData.actualAugust
            each.actualSeptember = each.actualSeptember + prevData.actualSeptember
            each.actualOctober = each.actualOctober + prevData.actualOctober

            return each
        })

        resolve(cumulativeData)
    })
}
dsa.renderChartDailySalesAnalysis = function (data) {
    return new Promise(function (resolve, reject) {

        var doIt = function (config) {
            $('.chart-analysis').replaceWith('<div class="chart-analysis"></div>')
            $('.chart-analysis').kendoChart(config)
            resolve()
        }

        var series = []
        if (dsa.monthMode() == 'october') {
            series = [{
                name: 'Oct Actual',
                field: 'actualOctober',
                color: '#3498db'
            }, {
                name: 'Oct Forecast',
                field: 'forecast',
                color: '#e74c3c'
            }, {
                name: 'Oct Forecast based on Avg Sales',
                field: 'octoberForecastBasedOnAvgSales',
                color: '#27ae60',
                dashType: 'dash'
            }, {
                name: 'Oct Actual proj on Delivery Date',
                field: 'octoberActualBasedOnDeliveryDate',
                color: '#2c3e50',
                dashType: 'dash'
            }, {
                name: 'Sept Actual',
                field: 'actualSeptember',
                color: '#9b59b6'
            }, {
                name: 'Aug Actual',
                field: 'actualAugust',
                color: '#f1c40f'
            }]

            data.forEach(function (d, i) {
                d.octoberForecastBasedOnAvgSales = ((d.actualSeptember || 0) + (d.actualAugust || 0)) / 2
            })
        } else if (dsa.monthMode() == 'september') {
            series = [{
                name: 'Sept Forecast',
                field: 'forecast',
                color: '#e74c3c'
            }, {
                name: 'Sept Actual',
                field: 'actualSeptember',
                color: '#9b59b6'
            }, {
                name: 'Aug Actual',
                field: 'actualAugust',
                color: '#f1c40f'
            }]
        } else if (dsa.monthMode() == 'august') {
            series = [{
                name: 'Aug Forecast',
                field: 'forecast',
                color: '#e74c3c'
            }, {
                name: 'Aug Actual',
                field: 'actualAugust',
                color: '#f1c40f'
            }]
        }

        var config = {
            chartArea: {
                background: 'transparent'
            },
            dataSource: {
                data: data
            },
            seriesDefaults: {
                type: "line",
                style: "smooth",
                markers: {
                    visible: false
                }
            },
            series: series,
            categoryAxis: {
                field: 'day',
                labels: {
                    margin: {
                        top: 10
                    }
                },
                justified: true,
                majorGridLines: {
                    color: '#f5f5f5'
                }
            },
            valueAxis: {
                labels: {
                    template: function (d) {
                        return '$' + kendo.toString(d.value / 1000000, 'N0') + ' M'
                    }
                },
                majorGridLines: {
                    color: '#f5f5f5'
                }
            },
            legend: {
                visible: true,
                position: 'bottom',
                margin: {
                    top: 10
                }
            },
            tooltip: {
                visible: true,
                template: function (d) {
                    if (d.series.field == 'octoberActualBasedOnDeliveryDate') {
                        return d.series.name + ' : ' + '$' + kendo.toString(d.value, 'N2')
                    }

                    return d.series.name + ' : ' + '$' + kendo.toString(d.value / 1000000, 'N2') + ' M'
                }
            }
        }

        if (dsa.monthMode() == 'october') {
            var url = '/DailySalesAnalysis/GetForecastBasedOnDeliveryDate'
            var param = dsa.getFilterValues()
            param.RejectionStatus = ["Nothing Rejected", "Partially Rejected"]
            param.SalesOrderType = ["ZFBL", "ZFDP", "ZSOR", "ZSPT"]
            param.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-10-01').toDate())
            param.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-10-31').toDate())

            ajaxPost(url, param, function (res) {
                if (res.Status !== "OK") {
                    reject(res.Message)
                    return
                }

                data.forEach(function (d, i) {
                    d.octoberActualBasedOnDeliveryDate = 0

                    var found = res.Data.find(function (g) {
                        return moment(g._id).date() == d.day
                    })
                    if (typeof found !== 'undefined') {
                        d.octoberActualBasedOnDeliveryDate = found.forecast
                    }

                    if (i > 0) {
                        var prevData = data[i - 1]
                        d.octoberActualBasedOnDeliveryDate += prevData.octoberActualBasedOnDeliveryDate
                    }
                })

                console.log('data', data)

                doIt(config)
            }, function (res) {
                reject(res.responseText)
            })
        } else {
            doIt(config)
        }
    })
}

dsa.loadDataChartDailySalesInsights = function () {
    return new Promise(function (resolve, reject) {
        var doIt = function (param, callbackOK, callbackFail) {
            var url = "/DailySalesAnalysis/GetDataForTornadoChartAugVsOct"

            param = JSON.parse(JSON.stringify(param))

            ajaxPost(url, param, function (res) {
                if (res.Status !== "OK") {
                    callbackFail(res.Message)
                    return
                }

                callbackOK(res.Data)
            }, function (res) {
                callbackFail(xhr.responseText)
            })
        }

        var param = dsa.getFilterValues()
        if (dsa.insightMode() == 'actualforecast') {
            doIt(param, function (data) {
                dsa.constructDataChartDailySalesInsights(param.MonthMode, data).then(function (dataConstructed) {
                    resolve(dataConstructed)
                })
            }, function (errorMessage) {
                reject(errorMessage)
            })

        } else {
            var param = dsa.getFilterValues()

            if (param.MonthMode == 'october') {
                var param1 = dsa.getFilterValues()
                param1.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-10-01').toDate())
                param1.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-10-31').toDate())
                param1.MonthMode = 'october'
                doIt(param1, function (data1) {
                    dsa.constructDataChartDailySalesInsights(param1.MonthMode, data1).then(function (data1Constructed) {

                        var param2 = dsa.getFilterValues()
                        param2.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-09-01').toDate())
                        param2.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-09-30').toDate())
                        param2.MonthMode = 'september'
                        doIt(param2, function (data2) {
                            dsa.constructDataChartDailySalesInsights(param2.MonthMode, data2).then(function (data2Constructed) {

                                data1Constructed.rows.forEach(function (d, i) {
                                    d.prevValue = 0

                                    var found = data2Constructed.rows.find(function (g) {
                                        return g._id == d._id
                                    })
                                    if (typeof found != 'undefined') {
                                        d.prevValue = found.nextValue
                                    }

                                    // console.log(d._id, 'nextValue', d.nextValue, 'prevValue', d.prevValue)
                                    d.difference = d.nextValue - d.prevValue
                                })
                                data1Constructed.rows = _.orderBy(data1Constructed.rows, 'difference', 'desc')

                                data1Constructed.max = _.maxBy([
                                    _.maxBy(data1Constructed.rows, 'difference').difference,
                                    Math.abs(_.minBy(data1Constructed.rows, 'difference').difference),
                                ])

                                resolve(data1Constructed)
                            })
                        }, function (errorMessage) {
                            reject(errorMessage)
                        })
                    })
                }, function (errorMessage) {
                    reject(errorMessage)
                })
            } else if (param.MonthMode == 'september') {
                var param2 = dsa.getFilterValues()
                param2.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-09-01').toDate())
                param2.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-09-30').toDate())
                param2.MonthMode = 'september'
                doIt(param2, function (data2) {
                    dsa.constructDataChartDailySalesInsights(param2.MonthMode, data2).then(function (data2Constructed) {

                        var param3 = dsa.getFilterValues()
                        param3.RequiredDeliveryDateStart = dsa.getDataValue(moment('2017-07-26').toDate())
                        param3.RequiredDeliveryDateFinish = dsa.getDataValue(moment('2017-08-31').toDate())
                        param3.MonthMode = 'august'
                        doIt(param3, function (data3) {
                            dsa.constructDataChartDailySalesInsights(param3.MonthMode, data3).then(function (data3Constructed) {

                                // console.log('data2Constructed', JSON.parse(JSON.stringify(data2Constructed)))
                                // console.log('data3Constructed', JSON.parse(JSON.stringify(data3Constructed)))

                                data2Constructed.rows.forEach(function (d, i) {
                                    d.prevValue = 0

                                    var found = data3Constructed.rows.find(function (g) {
                                        return g._id == d._id
                                    })
                                    if (typeof found != 'undefined') {
                                        d.prevValue = found.nextValue
                                    }

                                    // console.log(d._id, 'nextValue', d.nextValue, 'prevValue', d.prevValue)
                                    d.difference = d.nextValue - d.prevValue
                                })
                                data2Constructed.rows = _.orderBy(data2Constructed.rows, 'difference', 'desc')

                                data2Constructed.max = _.maxBy([
                                    _.maxBy(data2Constructed.rows, 'difference').difference,
                                    Math.abs(_.minBy(data2Constructed.rows, 'difference').difference),
                                ])
                                resolve(data2Constructed)
                            })
                        }, function (errorMessage) {
                            reject(errorMessage)
                        })
                    })
                }, function (errorMessage) {
                    reject(errorMessage)
                })
            }
        }
    })
}

dsa.constructDataChartDailySalesInsights = function (monthMode, data) {
    return new Promise(function (resolve, reject) {

        var flatData = []

        if (dsa.insightMode() == 'actualforecast') {
            var comparatorMonth = "09"

            if (monthMode == 'october') {
                comparatorMonth = "10"
            } else if (monthMode == 'september') {
                comparatorMonth = "09"
            } else {
                comparatorMonth = "08"
            }

            flatData = data.Master.filter(function (d) {
                return d._id != 0
            }).map(function (d) {
                d.actualValue = 0
                d.forecastValue = 0
                d.group = d._id

                var dataFoundActual = data.DetailActual.find(function (e) {
                    return e._id.group == d.group && e._id.month == comparatorMonth
                })
                if (typeof dataFoundActual !== 'undefined') {
                    d.actualValue = dataFoundActual.actual
                }

                var dataFoundForecast = data.DetailForecast.find(function (e) {
                    // console.log('-----', e._id, d.group)
                    return e._id == d.group
                })
                if (typeof dataFoundForecast !== 'undefined') {
                    d.forecastValue = dataFoundForecast.forecast
                }

                d.difference = d.actualValue - d.forecastValue

                return d
            })
        } else {
            var prevComparatorMonth = "08"
            var nextComparatorMonth = "09"

            if (monthMode == 'october') {
                nextComparatorMonth = "10"
                prevComparatorMonth = "09"
            } else if (monthMode == 'september') {
                nextComparatorMonth = "09"
                prevComparatorMonth = "08"
            } else {
                nextComparatorMonth = "08"
                prevComparatorMonth = "07"
            }

            flatData = data.Master.filter(function (d) {
                return d._id != 0
            }).map(function (d) {
                d.prevValue = 0
                d.nextValue = 0
                d.group = d._id

                var dataFoundPrev = data.DetailActual.find(function (e) {
                    return e._id.group == d.group && e._id.month == prevComparatorMonth
                })
                if (typeof dataFoundPrev !== 'undefined') {
                    d.prevValue = dataFoundPrev.actual
                }

                var dataFoundNext = data.DetailActual.find(function (e) {
                    return e._id.group == d.group && e._id.month == nextComparatorMonth
                })
                if (typeof dataFoundNext !== 'undefined') {
                    d.nextValue = dataFoundNext.actual
                }

                d.difference = d.nextValue - d.prevValue

                return d
            })
        }

        var flatDataSorted = _.orderBy(flatData, 'difference', 'desc')
        var max = Math.abs(_.maxBy(flatDataSorted, function (d) {
            return Math.abs(d.difference)
        }).difference)

        // console.log('flatDataSorted', flatDataSorted)

        resolve({
            rows: flatDataSorted,
            max: max
        })
    })
}

dsa.renderChartDailySalesInsights = function (data) {
    return new Promise(function (resolve, reject) {

        var config = {
            chartArea: {
                background: 'transparent',
                margin: {
                    left: 35
                }
            },
            dataSource: {
                data: data.rows
            },
            seriesDefaults: {
                type: "bar",
                style: "smooth"
            },
            seriesColors: ['#3498db', '#9b59b6'],
            series: [{
                name: 'Difference',
                field: 'difference',
            }],
            categoryAxis: {
                axisCrossingValues: [0],
                field: 'group',
                labels: {
                    margin: {
                        top: 10,
                        left: -100
                    }
                },
                justified: true,
                majorGridLines: {
                    color: '#f5f5f5'
                }
            },
            valueAxis: {
                labels: {
                    font: '10px Arial, Helvetica, sans-serif',
                    template: function (d) {
                        var text = kendo.toString(d.value / 1000000, 'n0') + 'M'
                        // if (text.indexOf('-') > -1) {
                        //     return text
                        // }

                        return '$' + text
                    }
                },
                majorGridLines: {
                    color: '#f5f5f5'
                },
                line: {
                    visible: false
                },
                max: data.max,
                min: data.max * -1
            },
            legend: {
                visible: false
            },
            tooltip: {
                visible: true,
                template: function (d) {
                    return d.category + ' : ' + '$ ' + kendo.toString(d.value / 1000000, 'N2') + 'M'
                }
            },
            dataBound: function () {
                setTimeout(function () {
                    var iterable = $('.chart-insights [clip-path]').next()
                    while (iterable.length > 0) {
                        var text = iterable.find('text')
                        if (text.length == 0) {
                            break
                        }

                        text.attr('x', 0)
                        text.attr('y', parseInt(text.attr('y'), 10) - 3)

                        iterable = iterable.next()
                    }
                }, 300)
            }
        }

        // console.log('data', data.max)

        $('.chart-insights').replaceWith('<div class="chart-insights"></div>')
        $('.chart-insights').kendoChart(config)
        resolve()
    })
}


dsa.filterInsightGroup = ko.observableArray([
    { value: 'subgeomarket', text: 'Sub Geo Market' },
    { value: 'subproductline', text: 'Sub Product Line' }
])
dsa.filterInsightGroupSelected = ko.observable(dsa.filterInsightGroup()[0].value)
dsa.refreshChartDailySalesInsights = function () {
    return newPromise()

    .then(function () {
        return dsa.loadDataChartDailySalesInsights()
    })
    .then(function (data) {
        return dsa.renderChartDailySalesInsights(data)
    })

    .catch(function (errorMessage) {
        swal('Error!', errorMessage, 'error')
    })
}

dsa.toggleFilter = function (obj) {
    var $target = $(obj).closest('.panel').find('.navigation')
    if ($target.is(':visible')) {
        $target.hide()
    } else {
        $target.show()
    }
}

$(function () {
    newPromise()

    .then(function () {
        return dsa.loadDataMaster()
    })
    .then(function () {
        dsa.monthMode('october')
        dsa.insightMode('actualforecast')
        $('.pre-render').hide().removeClass('pre-render')
    })
    .catch(function (errorMessage) {
        swal('Error!', errorMessage, 'error')
    })
})
