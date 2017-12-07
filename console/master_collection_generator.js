var fields = ["salesorg", "geomarket", "subgeomarket", "performingorganization", "subproductline", "createdby"]
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
