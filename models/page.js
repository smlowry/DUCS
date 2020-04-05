// models/page.js
var db = require("../db");


var Page = de.model("Page", {
    pageiId: String, // the id of the page
    pageName: String, // The name of the page
    date_created: { type: Date, default: Date.now },
})

module.exports = Page;