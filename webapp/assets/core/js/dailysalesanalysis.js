var dsa = {}
viewModel.dailySalesAnalysis = dsa

dsa.loadDataChartDailySalesAnalysis = function () {
    return new Promise(function (resolve, reject) {
        var url = "/DailySalesAnalysis/GetDataForLineChartForecastVsActual"
        var param = {}

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
                forecastOctober: data.ProratedForecast,
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
                forecastOctober: 0,
                actualAugust: 0,
                actualSeptember: 0,
                actualOctober: 0,
            }

            if (index > 0) {
                prevData = flatDataSorted[index - 1]
            }

            each.forecastOctober = each.forecastOctober + prevData.forecastOctober
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

        var chartObject = $('.chart-analysis').data('kendoChart')
        if (typeof chartObject !== 'undefined') {
            chartObject.setDataSource(new kendo.data.DataSource({
                data: data
            }))
            resolve()
            return
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
            series: [{
                name: 'Oct Forecast',
                field: 'forecastOctober',
            }, {
                name: 'Aug Actual',
                field: 'actualAugust',
            }, {
                name: 'Sept Actual',
                field: 'actualSeptember',
            }, {
                name: 'Oct Actual',
                field: 'actualOctober',
            }],
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

        $('.chart-analysis').kendoChart(config)
        resolve()
    })
}

dsa.loadDataChartDailySalesInsights = function () {
    return new Promise(function (resolve, reject) {
        var url = "/DailySalesAnalysis/GetDataForTornadoChartAugVsOct"
        var param = {
            Group: "subgeomarket"
        }

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
            d.augustValue = 0
            d.septemberValue = 0
            d.group = d._id

            var dataFoundAugust = data.Detail.find(function (e) {
                return e._id.group == d.group && e._id.month == "08"
            })
            if (typeof dataFoundAugust !== 'undefined') {
                d.augustValue = dataFoundAugust.actual
            }

            var dataFoundSeptember = data.Detail.find(function (e) {
                return e._id.group == d.group && e._id.month == "09"
            })
            if (typeof dataFoundSeptember !== 'undefined') {
                d.septemberValue = dataFoundSeptember.actual
            }

            d.leftValue = d.augustValue * -1
            d.rightValue = d.septemberValue

            return d
        })

        var flatDataSorted = _.orderBy(flatData, function (d) {
            return d.augustValue + d.septemberValue
        }, 'desc')

        var max = _.maxBy([
            _.maxBy(flatDataSorted, 'leftValue').leftValue, 
            _.maxBy(flatDataSorted, 'rightValue').rightValue
        ])

        resolve({
            rows: flatDataSorted,
            max: max * 1.5
        })
    })
}

dsa.renderChartDailySalesInsights = function (data) {
    return new Promise(function (resolve, reject) {

        var chartObject = $('.chart-insights').data('kendoChart')
        if (typeof chartObject !== 'undefined') {
            chartObject.setDataSource(new kendo.data.DataSource({
                data: data.rows
            }))
            resolve()
            return
        }

        var config = {
            chartArea: {
                background: 'transparent'
            },
            dataSource: {
                data: data.rows
            },
            seriesDefaults: {
                type: "bar",
                style: "smooth"
            },
            series: [{
                name: 'August',
                field: 'leftValue',
                stack: 'same'
            }, {
                name: 'September',
                field: 'rightValue',
                stack: 'same'
            }],
            categoryAxis: {
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
                    visible: false
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
                categories: ['August', 'September'],
                visible: true,
                position: 'top',
                margin: {
                    bottom: 10,
                    top: 0
                }
            },
            tooltip: {
                visible: true,
                template: function (d) {
                    return d.category + ' : ' + '$' + kendo.toString(Math.abs(d.value / 1000000), 'N2') + ' M'
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

        $('.chart-insights').kendoChart(config)
        resolve()
    })
}

$(function () {
    newPromise()

    .then(function () {
        return dsa.loadDataChartDailySalesAnalysis()
    })
    .then(function (data) {
        return dsa.constructDataChartDailySalesAnalysis(data)
    })
    .then(function (data) {
        return dsa.renderChartDailySalesAnalysis(data)
    })

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
})
