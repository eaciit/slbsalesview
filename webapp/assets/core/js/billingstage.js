var bs = {}
viewModel.billingstage = bs

bs.masterCreatedBy = ko.observableArray([])
bs.masterGeoMarket = ko.observableArray([])
bs.masterMaterialGroup1 = ko.observableArray([])
bs.masterPerformingOrganization = ko.observableArray([])
bs.masterProfitCenter = ko.observableArray([])
bs.masterSalesOrg = ko.observableArray([])
bs.masterSubGeoMarket = ko.observableArray([])
bs.masterSubProductLine = ko.observableArray([])
bs.masterSalesOrderType = ko.observableArray([])
bs.masterRejectionStatus = ko.observableArray([])

bs.filterCreatedBySelected = ko.observableArray([])
bs.filterGeoMarketSelected = ko.observableArray([])
bs.filterMaterialGroup1Selected = ko.observableArray([])
bs.filterPerformingOrganizationSelected = ko.observableArray([])
bs.filterProfitCenterSelected = ko.observableArray([])
bs.filterSalesOrgSelected = ko.observableArray([])
bs.filterSubGeoMarketSelected = ko.observableArray([])
bs.filterSubProductLineSelected = ko.observableArray([])
bs.filterSalesOrderTypeSelected = ko.observableArray([])
bs.filterRejectionStatusSelected = ko.observableArray([])
bs.filterCustomerNameSelected = ko.observableArray([])
bs.filterRequiredDeliveryDateStart = ko.observable('')
bs.filterRequiredDeliveryDateFinish = ko.observable('')
bs.filterSalesOrderDateStart = ko.observable('')
bs.filterSalesOrderDateFinish = ko.observable('')

bs.getDataValue = function (dateData) {
    if (dateData == 'Invalid Date') {
        return ''
    }

    return ((dateData || '') == '') ? '' : moment(dateData).format('YYYYMMDD')
}

bs.getFilterValues = function () {
    return {
        CreatedBy: bs.filterCreatedBySelected(),
        GeoMarket: bs.filterGeoMarketSelected(),
        MaterialGroup1: bs.filterMaterialGroup1Selected(),
        PerformingOrganization: bs.filterPerformingOrganizationSelected(),
        ProfitCenter: bs.filterProfitCenterSelected(),
        SalesOrg: bs.filterSalesOrgSelected(),
        SubGeoMarket: bs.filterSubGeoMarketSelected(),
        SubProductLine: bs.filterSubProductLineSelected(),
        SalesOrderType: bs.filterSalesOrderTypeSelected(),
        RejectionStatus: bs.filterRejectionStatusSelected(),
        CustomerName: bs.filterCustomerNameSelected(),
        RequiredDeliveryDateStart: bs.getDataValue(bs.filterRequiredDeliveryDateStart()),
        RequiredDeliveryDateFinish: bs.getDataValue(bs.filterRequiredDeliveryDateFinish()),
        SalesOrderDateStart: bs.getDataValue(bs.filterSalesOrderDateStart()),
        SalesOrderDateFinish: bs.getDataValue(bs.filterSalesOrderDateFinish()),
        MonthMode: bs.monthMode(),
        GridMode: bs.contentMode() == 'tab1' ? 1 : 2
    }
}

bs.loadDataMaster = function () {
    return new Promise(function (resolve, reject) {
        var url = '/DailySalesAnalysis/GetDataMaster'
        var param = { }

        ajaxPost(url, param, function (res) {
            if (res.Status !== "OK") {
                reject(res.Message)
                return
            }

            bs.masterCreatedBy(res.Data.CreatedBy.map(function (d) { return d._id }))
            bs.masterGeoMarket(res.Data.GeoMarket.map(function (d) { return d._id }))
            bs.masterMaterialGroup1(res.Data.MaterialGroup1.map(function (d) { return d._id }))
            bs.masterPerformingOrganization(res.Data.PerformingOrganization.map(function (d) { return d._id }))
            bs.masterProfitCenter(res.Data.ProfitCenter.map(function (d) { return d._id }))
            bs.masterSalesOrg(res.Data.SalesOrg.map(function (d) { return d._id }))
            bs.masterSubGeoMarket(res.Data.SubGeoMarket.map(function (d) { return d._id }))
            bs.masterSubProductLine(res.Data.SubProductLine.map(function (d) { return d._id }))
            bs.masterSalesOrderType(res.Data.SalesOrderType.map(function (d) { return d._id }))
            bs.masterRejectionStatus(res.Data.RejectionStatus.map(function (d) { return d._id }))
            resolve()
        }, function (res) {
            reject(xhr.responseText)
        })
    })
}

bs.monthMode = ko.observable('')
bs.monthMode.subscribe(function (newValue) {
    bs.filterCreatedBySelected([])
    bs.filterGeoMarketSelected([])
    bs.filterMaterialGroup1Selected([])
    bs.filterPerformingOrganizationSelected([])
    bs.filterProfitCenterSelected([])
    bs.filterSalesOrgSelected([])
    bs.filterSubGeoMarketSelected([])
    bs.filterSubProductLineSelected([])
    bs.filterSalesOrderTypeSelected([])
    bs.filterRejectionStatusSelected([])
    bs.filterCustomerNameSelected([])
    bs.filterRequiredDeliveryDateStart('')
    bs.filterRequiredDeliveryDateFinish('')
    bs.filterSalesOrderDateStart('')
    bs.filterSalesOrderDateFinish('')

    switch (newValue) {
        case 'october': 
            if (bs.contentMode() == 'tab1') {
                bs.filterCustomerNameSelected(['Forecast'])
                bs.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT'])
                bs.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected'])
                bs.filterRequiredDeliveryDateStart(moment('2017-10-01').toDate())
                bs.filterRequiredDeliveryDateFinish(moment('2017-10-31').toDate())
            } else {
                bs.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT', 'Forecast'])
                bs.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected', 'Forecast'])
                bs.filterRequiredDeliveryDateStart(moment('2017-07-26').toDate())
                bs.filterRequiredDeliveryDateFinish(moment('2017-09-20').toDate())
            }
        break
        case 'september': 
            if (bs.contentMode() == 'tab1') {
                bs.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT'])
                bs.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected'])
                bs.filterRequiredDeliveryDateStart(moment('2017-09-01').toDate())
                bs.filterRequiredDeliveryDateFinish(moment('2017-09-30').toDate())
            } else {
                bs.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT', 'Forecast'])
                bs.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected', 'Forecast'])
                bs.filterRequiredDeliveryDateStart(moment('2017-07-26').toDate())
                bs.filterRequiredDeliveryDateFinish(moment('2017-09-20').toDate())
                bs.filterSalesOrderDateStart(moment('2017-07-30').toDate())
                bs.filterSalesOrderDateFinish(moment('2017-10-01').toDate())
            }
        break
        case 'august': 
            if (bs.contentMode() == 'tab1') {
                bs.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT'])
                bs.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected'])
                bs.filterRequiredDeliveryDateStart(moment('2017-07-26').toDate())
                bs.filterRequiredDeliveryDateFinish(moment('2017-08-31').toDate())
                bs.filterSalesOrderDateStart(moment('2017-07-30').toDate())
                bs.filterSalesOrderDateFinish(moment('2017-08-31').toDate())
            } else {
                bs.filterSalesOrderTypeSelected(['ZFBL', 'ZFDP', 'ZSOR', 'ZSPT', 'Forecast'])
                bs.filterRejectionStatusSelected(['Nothing Rejected', 'Partially Rejected', 'Forecast'])
                bs.filterRequiredDeliveryDateStart(moment('2017-07-26').toDate())
                bs.filterRequiredDeliveryDateFinish(moment('2017-08-31').toDate())
                bs.filterSalesOrderDateStart(moment('2017-07-30').toDate())
                bs.filterSalesOrderDateFinish(moment('2017-10-01').toDate())
            }
        break
    }

    bs.refreshGrid()
})

bs.contentMode = ko.observable('tab1')
bs.contentMode.subscribe(function () {
    bs.monthMode.valueHasMutated()
})


bs.loadDataGrid = function (param) {
    return new Promise(function (resolve, reject) {
        var url = "/BillingStage/GetDataGrid"
        param = param || bs.getFilterValues()

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

bs.renderGrid = function (data) {
    var total = function (what) {
        return function (d) { 
            return '<div class="align-right">$' + kendo.toString(d[what].sum, 'N0') + "</div>"
        }
    }
    var template = function (what) {
        return function (d) {
            return '$' + kendo.toString(d[what] || 0, 'N0')
        }
    }

    var columns = [{
        field: '_id',
        title: 'Row Labels',
        footerTemplate: 'Grand Total'
    }, {
        field: 'totalIncomplete',
        title: 'a. Incomplete',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalIncomplete'),
        footerTemplate: total('totalIncomplete')
    }, {
        field: 'totalRequiresOpsApproval',
        headerTemplate: 'b. Requires Ops Approval',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalRequiresOpsApproval'),
        footerTemplate: total('totalRequiresOpsApproval')
    }, {
        field: 'totalZSPTNoDelivery',
        headerTemplate: 'c. ZSPT No Delivery',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalZSPTNoDelivery'),
        footerTemplate: total('totalZSPTNoDelivery')
    }, {
        field: 'totalZSPTDelNotShipped',
        headerTemplate: 'd. ZSPT Del Not Shipped',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalZSPTDelNotShipped'),
        footerTemplate: total('totalZSPTDelNotShipped')
    }, {
        field: 'totalPendingRevenueRecognition',
        headerTemplate: 'e. Pending Revenue Recognition',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalPendingRevenueRecognition'),
        footerTemplate: total('totalPendingRevenueRecognition')
    }, {
        field: 'totalEstimateDrecognized',
        headerTemplate: 'f. Estimated Recognized',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalEstimateDrecognized'),
        footerTemplate: total('totalEstimateDrecognized')
    }, {
        field: 'totalNetValueUSD',
        headerTemplate: 'Sum of Net Value (USD)',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalNetValueUSD'),
        footerTemplate: total('totalNetValueUSD')
    }, {
        field: 'totalProratedForecast',
        headerTemplate: 'Sum of Prorated Forecast',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalProratedForecast'),
        footerTemplate: total('totalProratedForecast')
    }, {
        field: 'totalCreditBlock',
        title: 'g. Credit Block',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalCreditBlock'),
        footerTemplate: total('totalCreditBlock')
    }, {
        field: 'totalInvoiced',
        title: 'Sum of Invoiced',
        attributes: { class: 'align-right' },
        aggregates: ["sum"], 
        template: template('totalInvoiced'),
        footerTemplate: total('totalInvoiced')
    }]

    if (bs.contentMode() == 'tab2') {
        columns.push({
            field: 'totalPendingInvoice',
            title: 'Sum of Pending Invoice - Waiting on Supporting Documents',
            attributes: { class: 'align-right' },
            aggregates: ["sum"], 
            template: template('totalPendingInvoice'),
            footerTemplate: total('totalPendingInvoice')
        })
    }

    var dataSorted = _.orderBy(data, function (d) {
        return parseInt(d._id.replace('GEO', ''), 10)
    })

    var config = {
        dataSource: {
            data: dataSorted,
            pageSize: 20,
            aggregate: [ 
                { field: 'totalIncomplete', aggregate: 'sum' },
                { field: 'totalRequiresOpsApproval', aggregate: 'sum' },
                { field: 'totalZSPTNoDelivery', aggregate: 'sum' },
                { field: 'totalZSPTDelNotShipped', aggregate: 'sum' },
                { field: 'totalPendingRevenueRecognition', aggregate: 'sum' },
                { field: 'totalEstimateDrecognized', aggregate: 'sum' },
                { field: 'totalNetValueUSD', aggregate: 'sum' },
                { field: 'totalProratedForecast', aggregate: 'sum' },
                { field: 'totalCreditBlock', aggregate: 'sum' },
                { field: 'totalInvoiced', aggregate: 'sum' },
                { field: 'totalPendingInvoice', aggregate: 'sum' },
            ]
        },
        columns: columns,
        pageable: true,
        sortable: true
    }

    $('.grid').replaceWith('<div class="grid"></div>')
    $('.grid').kendoGrid(config)
}

bs.renderChart = function (data) {
    var series = [
        { name: 'a. Incomplete', field: 'totalIncomplete' },
        { name: 'b. Requires Ops Approval', field: 'totalRequiresOpsApproval' },
        { name: 'c. ZSPT No Delivery', field: 'totalZSPTNoDelivery' },
        { name: 'd. ZSPT Del Not Shipped', field: 'totalZSPTDelNotShipped' },
        { name: 'e. Pending Revenue Recognition', field: 'totalPendingRevenueRecognition' },
        { name: 'f. Estimated Recognized', field: 'totalEstimateDrecognized' },
        { name: 'Sum of Net Value (USD)', field: 'totalNetValueUSD' },
        { name: 'Sum of Prorated Forecast', field: 'totalProratedForecast' },
        { name: 'g. Credit Block', field: 'totalCreditBlock' },
        { name: 'Sum of Invoiced', field: 'totalInvoiced' },
    ]

    if (bs.contentMode() == 'tab2') {
        series.push({ 
            name: 'Sum of Pending Invoice - Waiting on Supporting Documents', 
            field: 'totalPendingInvoice'
        })
    }

    var dataSorted = _.orderBy(data, function (d) {
        return parseInt(d._id.replace('GEO', ''), 10)
    })

    var config = {
        chartArea: {
            background: 'transparent',
            margin: {
                left: 35
            }
        },
        dataSource: {
            data: dataSorted
        },
        seriesDefaults: {
            type: "column",
            style: "smooth"
        },
        series: series,
        categoryAxis: {
            axisCrossingValues: [0],
            field: '_id',
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
                return d.category + ' : $' + kendo.toString(d.value, 'N0')
            }
        }
    }

    $('.chart').replaceWith('<div class="chart" style="height: 300px;"></div>')
    $('.chart').kendoChart(config)
}

bs.refreshGrid = function () {
    newPromise()

    .then(function () {
        return bs.loadDataGrid()
    })
    .then(function (data) {
        bs.renderGrid(data) 
        bs.renderChart(data)
    })

    .catch(function (errorMessage) {
        swal('Error!', errorMessage, 'error')
    })
}

bs.toggleFilter = function (obj) {
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
        return bs.loadDataMaster()
    })
    .then(function () {
        bs.monthMode('october')
        $('.pre-render').hide().removeClass('pre-render')
    })
    .catch(function (errorMessage) {
        swal('Error!', errorMessage, 'error')
    })
})