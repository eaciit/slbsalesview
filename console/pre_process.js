
// 1. append profitcenters, materialgroup1s into rawmainheader
// 2. create valid date from rdd

db.getCollection('rawmainheader').find().limit(4).toArray().forEach(function (d) {
    d.profitcenters = []
    d.materialgroup1s = []

    var detail = db.getCollection('raworderitem').find({ salesorderno: d.salesorderno }).toArray()
    detail.forEach(function (g) {
        d.profitcenters.push(g.profitcenter)
        d.materialgroup1s.push(g.materialgroup1)
    })

    d.rddparsed = new Date(d.rdd)
    
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