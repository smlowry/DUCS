// models/image.js
var db = require("../db");

var Image = db.model("Image", {
    filename:  String,
    photo_name: String,
    album: String,
    description: String,
    upload_date: { type: Date, default: Date.now },
    f_stop: String,
    s_speed: String,
    iso: String,
    focal_length: String,
    camera_type: String
});

module.exports = Image;