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
        RequiredDeliveryDateStart: ((dsa.filterRequiredDeliveryDateStart() || '') == '') ? '' : moment(dsa.filterRequiredDeliveryDateStart()).format('YYYYMMDD'),
        RequiredDeliveryDateFinish: ((dsa.filterRequiredDeliveryDateFinish() || '') == '') ? '' : moment(dsa.filterRequiredDeliveryDateFinish()).format('YYYYMMDD'),
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
            dsa.filterRequiredDeliveryDateStart(moment('2017-06-26').toDate())
            dsa.filterRequiredDeliveryDateFinish(moment('2017-08-31').toDate())
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

dsa.refreshChartDailySalesAnalysis = function () {
    return newPromise()

    .then(function () {
        return dsa.loadDataChartDailySalesAnalysis()
    })
    .then(function (data) {
        return dsa.constructDataChartDailySalesAnalysis(data)
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
        var url = "/DailySalesAnalysis/GetDataForLineChartForecastVsActual"
        var param = dsa.getFilterValues()

        ajaxPost(url, param, function (res) {
            if (res.Status !== "OK") {
                reject(res.Message)
                return
            }

            resolve(res.Data)
        }, function (res) {
            reject(xhr.responseText)
        })
    })
}

dsa.constructDataChartDailySalesAnalysis = function (data) {
    return new Promise(function (resolve, reject) {

        var flatData = []
        var iterableDate = moment("2017-08-01").toDate()
        var finishDate = moment("2017-11-01").toDate()

        for (i = 1; i <= 31; i++) {
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

        var series = [{
            name: 'Sept Forecast',
            field: 'forecast',
        }, {
            name: 'Sept Actual',
            field: 'actualSeptember',
        }]

        // var series = [{
        //     name: 'Oct Forecast',
        //     field: 'forecast',
        // }, {
        //     name: 'Aug Actual',
        //     field: 'actualAugust',
        // }, {
        //     name: 'Sept Actual',
        //     field: 'actualSeptember',
        // }, {
        //     name: 'Oct Actual',
        //     field: 'actualOctober',
        // }]
        
        // if (dsa.monthMode() == 'august') {
        //     series = [{
        //         name: 'Aug Forecast',
        //         field: 'forecast',
        //     }, {
        //         name: 'Aug Actual',
        //         field: 'actualAugust',
        //     }]
        // } else if (dsa.monthMode() == 'september') {
        //     series = [{
        //         name: 'Sept Forecast',
        //         field: 'forecast',
        //     }, {
        //         name: 'Sept Actual',
        //         field: 'actualSeptember',
        //     }]
        // }

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
            seriesColors: ['#e74c3c', '#3498db', '#9b59b6', '#f1c40f'],
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
                    top: 20
                }
            },
            tooltip: {
                visible: true,
                template: function (d) {
                    return d.series.name + ' : ' + '$' + kendo.toString(d.value / 1000000, 'N2') + ' M'
                }
            }
        }

        $('.chart-analysis').replaceWith('<div class="chart-analysis"></div>')
        $('.chart-analysis').kendoChart(config)
        resolve()
    })
}

dsa.loadDataChartDailySalesInsights = function () {
    return new Promise(function (resolve, reject) {
        var month = "October"
        if (dsa.monthMode() == 'august') {
            month = "August"
        } else if (dsa.monthMode() == 'september') {
            month = "September"
        }

        var url = "/DailySalesAnalysis/GetDataForTornadoChartAugVsOct"
        var param = dsa.getFilterValues()

        ajaxPost(url, param, function (res) {
            if (res.Status !== "OK") {
                reject(res.Message)
                return
            }

            resolve(res.Data)
        }, function (res) {
            reject(xhr.responseText)
        })
    })
}

dsa.constructDataChartDailySalesInsights = function (data) {
    return new Promise(function (resolve, reject) {

        var flatData = data.Master.filter(function (d) {
            return d._id != 0
        }).map(function (d) {
            d.actualValue = 0
            d.forecastValue = 0
            d.group = d._id

            var dataFoundActual = data.DetailActual.find(function (e) {
                return e._id.group == d.group
            })
            if (typeof dataFoundActual !== 'undefined') {
                d.actualValue = dataFoundActual.actual
            }

            var dataFoundForecast = data.DetailForecast.find(function (e) {
                return e._id == d.group
            })
            if (typeof dataFoundForecast !== 'undefined') {
                d.forecastValue = dataFoundForecast.forecast
            }

            d.difference = d.actualValue - d.forecastValue

            return d
        })

        var flatDataSorted = _.orderBy(flatData, 'difference', 'desc')
        var max = Math.abs(_.maxBy(flatDataSorted, function (d) {
            return Math.abs(d.difference)
        }).difference)

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
                    left: 45
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
                        if (text.indexOf('-') > -1) {
                            return text
                        }

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

        console.log('data', data.max)

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
        return dsa.constructDataChartDailySalesInsights(data)
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
        $('.pre-render').hide().removeClass('pre-render')
    })
    .catch(function (errorMessage) {
        swal('Error!', errorMessage, 'error')
    })
})
