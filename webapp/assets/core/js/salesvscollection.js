var svc = {}
viewModel.salesVsCollection = svc


svc.getDataValue = function (dateData) {
    if (dateData == 'Invalid Date') {
        return ''
    }

    return ((dateData || '') == '') ? '' : moment(dateData).format('YYYYMMDD')
}

svc.getSalesVsCollectionData = function () {
    return new Promise(function (resolve, reject) {
        var doGetOctober = function (callbackOK) {
            var url = "/BillingStage/GetDataGrid"

            var param1 = {}
            param1.MonthMode = 'october'
            param1.GridMode = 1
            param1.CustomerName = ['Forecast']
            param1.SalesOrderType = ['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT']
            param1.RejectionStatus = ['Nothing Rejected', 'Partially Rejected']
            param1.RequiredDeliveryDateStart = svc.getDataValue(moment('2017-10-01').toDate())
            param1.RequiredDeliveryDateFinish = svc.getDataValue(moment('2017-10-31').toDate())

            ajaxPost(url, param1, function (res) {
                if (res.Status !== "OK") {
                    reject(res.Message)
                    return
                }

                callbackOK(res.Data)
            }, function (res) {
                reject(xhr.responseText)
            })
        }
        
        var doGetSeptember = function (callbackOK) {
            var url = "/BillingStage/GetDataGrid"

            var param2 = {}
            param2.MonthMode = 'september'
            param2.GridMode = 1
            param2.SalesOrderType = (['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT'])
            param2.RejectionStatus = (['Nothing Rejected', 'Partially Rejected'])
            param2.RequiredDeliveryDateStart = svc.getDataValue(moment('2017-09-01').toDate())
            param2.RequiredDeliveryDateFinish = svc.getDataValue(moment('2017-09-30').toDate())

            ajaxPost(url, param2, function (res) {
                if (res.Status !== "OK") {
                    reject(res.Message)
                    return
                }

                callbackOK(res.Data)
            }, function (res) {
                reject(xhr.responseText)
            })
        }
        
        var doGetAugust = function (callbackOK) {
            var url = "/BillingStage/GetDataGrid"

            var param3 = {}
            param3.MonthMode = 'august'
            param3.GridMode = 1
            param3.SalesOrderType = (['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT'])
            param3.RejectionStatus = (['Nothing Rejected', 'Partially Rejected'])
            param3.RequiredDeliveryDateStart = svc.getDataValue(moment('2017-07-26').toDate())
            param3.RequiredDeliveryDateFinish = svc.getDataValue(moment('2017-08-31').toDate())
            param3.SalesOrderDateStart = svc.getDataValue(moment('2017-07-30').toDate())
            param3.SalesOrderDateFinish = svc.getDataValue(moment('2017-08-31').toDate())

            ajaxPost(url, param3, function (res) {
                if (res.Status !== "OK") {
                    reject(res.Message)
                    return
                }

                callbackOK(res.Data)
            }, function (res) {
                reject(xhr.responseText)
            })
        }

        
        doGetOctober(function (dataOctober) {
            doGetSeptember(function (dataSeptember) {
                doGetAugust(function (dataAugust) {
                    var netValueUSDAugust = _.sumBy(dataAugust, 'totalNetValueUSD') || 0
                    var netEstimateRecognizedAugust = _.sumBy(dataAugust, 'totalEstimateDrecognized') || 0
                    var deltaAugust = netValueUSDAugust - netEstimateRecognizedAugust

                    var netValueUSDSeptember = _.sumBy(dataSeptember, 'totalNetValueUSD') || 0
                    var netEstimateRecognizedSeptember = _.sumBy(dataSeptember, 'totalEstimateDrecognized') || 0
                    var deltaSeptember = netValueUSDSeptember - netEstimateRecognizedSeptember

                    var netValueUSDOctober = _.sumBy(dataOctober, 'totalNetValueUSD') || 0
                    var netEstimateRecognizedOctober = _.sumBy(dataOctober, 'totalEstimateDrecognized') || 0
                    var deltaOctober = netValueUSDOctober - netEstimateRecognizedOctober

                    var data = [{
                        month: 'Aug-17',
                        totalNetValueUSD: netValueUSDAugust,
                        totalEstimateDrecognized: netEstimateRecognizedAugust,
                        delta: deltaAugust,
                        deltaCumulative: deltaAugust
                    }, {
                        month: 'Sep-17',
                        totalNetValueUSD: netValueUSDSeptember,
                        totalEstimateDrecognized: netEstimateRecognizedSeptember,
                        delta: deltaSeptember,
                        deltaCumulative: deltaAugust + deltaSeptember
                    }, {
                        month: 'Oct-17',
                        totalNetValueUSD: netValueUSDOctober,
                        totalEstimateDrecognized: netEstimateRecognizedOctober,
                        delta: deltaOctober,
                        deltaCumulative: deltaAugust + deltaSeptember + deltaOctober
                    }]

                    resolve(data)
                })
            })
        })
    })
}

svc.renderChartSalesVsCollection = function (data) {
    console.log('data', data)

    var config = {
        dataSource: {
            data: data
        },
        seriesDefaults: {
            type: 'column'
        },
        series: [{
            field: 'totalEstimateDrecognized',
            name: 'Revenue Recognized',
            color: '#2980b9'
        }, {
            field: 'totalNetValueUSD',
            name: 'Billed',
            color: '#7ccaff'
        }, {
            field: 'delta',
            name: 'Delta',
            color: '#27ae60',
        }, {
            field: 'deltaCumulative',
            name: 'Cumulative Delta',
            type: 'line',
            dashType: 'dash',
            color: '#9b59b6',
        }],
        categoryAxis: {
            field: 'month',
            labels: {
                margin: {
                    top: 40
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
                    return '$ ' + kendo.toString(d.value, 'N0')
                }
            },
            majorGridLines: {
                color: '#f5f5f5'
            },
            line: {
                visible: false
            }
        },
        legend: {
            visible: true,
            position: 'bottom'
        },
        tooltip: {
            visible: true,
            template: function (d) {
                return d.series.name + ' : $' + kendo.toString(d.value, 'N0')
            }
        }
    }

    $('.chart').replaceWith('<div class="chart"></div>')
    $('.chart').kendoChart(config)
}

svc.refresh = function () {
    newPromise()

    .then(function () {
        return svc.getSalesVsCollectionData()
    })
    .then(function (data) {
        svc.renderChartSalesVsCollection(data)
    })

    .catch(function (errorMessage) {
        swal('Error!', errorMessage, 'error')
    })
}


$(function () {
    svc.refresh()
})