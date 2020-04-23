//server.js

//define constants
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const Image = require("./models/image");
const User = require("./models/user");
const app = express();
const router = express.Router();


app.use(express.static('public'));

router.use(bodyParser.urlencoded({ extended: false }));

router.use("/api/images", require("./api/images"));
router.use("/api", require('./api/users'));
router.use("/api", require('./api/auth'));
router.use("/api/page", require('./api/pages'));

app.use(router);

app.listen(3000)