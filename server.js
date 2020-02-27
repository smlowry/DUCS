//server.js

//define constants
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var Image = require("./models/image");
var User = require("./models/user");
var app = express();
var router = express.Router();


app.use(express.static('public'));

router.use(bodyParser.urlencoded({ extended: false }));

router.use("/api/images", require("./api/images"));
router.use("/api", require('./api/users'));
router.use("/api", require('./api/auth'));

app.use(router);

app.listen(3000)