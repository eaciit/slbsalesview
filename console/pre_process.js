
// 1. append profitcenters, materialgroup1s into rawmainheader
// 2. create valid date from rdd



var detailMap = {}
var detail = db.getCollection('raworderitem').find().toArray().forEach(function (d) {
    var key = String(parseInt(d.salesorderno, 10))
    if (detailMap.hasOwnProperty(key)) {
        detailMap[key].push(d)
    } else {
        detailMap[key] = []
    }
})

var counter = 0
db.getCollection('rawmainheader').find().forEach(function (d) {
    d.profitcenters = []
    d.materialgroup1s = []

    var key = String(parseInt(d.salesorderno, 10))
    var detail = detailMap[key]
    if (typeof detail !== 'undefined') {
        detail.forEach(function (g) {
            d.profitcenters.push(g.profitcenter)
            d.materialgroup1s.push(g.materialgroup1)
        })
    }

    d.rddparsed = new Date(d.rdd)
    
    print("saving", counter++)
    db.getCollection('rawmainheader').save(d)
})


// generate master collections

var fields = ["salesorg", "geomarket", "subgeomarket", "performingorganization", "subproductline", "createdby", 'rejectionstatus', 'salesordertype']
fields.forEach(function (field) {
    db.getCollection('rawmainheader').aggregate([
        {"$group": {"_id":"$" + field}},
        {"$match": { "_id": { $ne: 0 } }},
        {"$sort": { "_id": 1 }},
        {"$out":"master" + field}
    ])
})

var fields = ['profitcenter', 'materialgroup1']
fields.forEach(function (field) {
    db.getCollection('raworderitem').aggregate([
        {"$group": {"_id":"$" + field}},
        {"$match": { "_id": { $ne: 0 } }},
        {"$sort": { "_id": 1 }},
        {"$out":"master" + field}
    ])
})