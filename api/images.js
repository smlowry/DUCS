var multer = require("multer");
var path = require("path")

var Image = require("../models/image");
var router = require("express").Router();

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null,  file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

// set upload object to store pictures to correct location
var upload = multer({ storage: storage })

// Get list of all images in the database
router.get("/", function(req, res) {
    console.log("Getting images");
    Image.find(function(err, images) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.json(images);
        }
    });
});


// Add a new image to the database
router.post('/', upload.single('photo'), function(req, res) {
    
    if (req.file) {
        console.log("file: " + req.body.photoName +" saved on.");
    
    }
    else throw 'error';
    
    var img = new Image({
        filename: req.file.filename,
        photo_name: req.body.photoName,
        album: req.body.album,
        upload_date: new Date(),
        description: req.body.description,
        f_stop: req.body.f_stop,
        s_speed: req.body.s_speed,
        iso: req.body.iso,
        focal_length: req.body.focal_length,
        camera_type: req.body.camera_type
    });
    
    //var image = new Image(req.body);
    
    img.save(function(err, img) {
        if (err) {
            res.status(400).send(err);
        } else {
            //refactor???
            res.redirect('/home.html');
        }
    });
});

module.exports = router;