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
