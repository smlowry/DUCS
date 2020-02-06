// TO DO: change certain elements on this page such as changing app to router. Move certain elements over to the api/images.js file. Get help. 


const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
//removed path
const Image = require("./models/image");
const app = express();
const PORT = 3000;

const router=express.Router();


app.use(express.static('public'));
router.use(bodyParser.urlencoded({ extended: true }));
router.use("/api/images", require("./api/images"));
app.use(router);

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});