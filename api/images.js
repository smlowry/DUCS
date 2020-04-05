var Image = require('../models/image');
var User = require('../models/user');
var router = require("express").Router();
var multer = require("multer");
//var mthumb = require('../media-thumbnail');
var path = require("path")
var fs = require('fs');
var crypto = require("crypto")
var jwt = require("jwt-simple")
var config =require("../configuration/config.json")

var DEBUG = true;
var secret = config.secret;

// SET STORAGE
var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'upload')
      },
      filename: function (req, file, cb) {
        cb(null,  file.fieldname + '-' + Date.now() + path.extname(file.originalname))
      } 
    });

// set upload object to store pictures to correct location
var upload = multer({ storage: storage })

// Get list of all images in the database
router.get("/", function(req, res) {
   
   // 1. get the user's token'
   var token = req.query.u;
    
   // 2. decode the token and validate the User
   var decoded
   try {
       if (DEBUG)
       console.log("Trying to decode token")
       decoded = jwt.decode(token, secret);
   }
   catch(ex) {
       if (DEBUG) 
            console.log("Invalid JWT: token did not decode")
        return res.status(401).json({error: "Invalid JWT"});
   }

   var usr = decoded.username; 

   User.findOne({uid: usr}, function(err,user){
       if (err) {
            if (DEBUG)
                console.log("Server error trying to find user.");
            return res.status(500).json({error: "Server error"});
	   }
       if (DEBUG)
            console.log("get all images for user: " + user.uid);

       if (user) {
           // 3. Find the user's images
           Image.find({owner: user.uid}, function(err, img) {
               if (err) {
                    res.status(500).json({error: "Server error"});  
		       }
               else {
                    res.status(201).json(img)  
		       }
            });
        }
        else {
            res.status(404).json({error: "User not found."})
	    }
    });
});







// Add a new image to the database
router.post('/', upload.single('photo'), function(req, res) {
    //log the file and upload to console
    if (req.file) {
        console.log("file: " + req.body.photoName +" saved on.");
    }
    else {
        if (DEBUG)
            console.log({error: "Could not store Image."});
	    return res.status(507).json({error: "Could not store image."});
    }

    // 1. Get auth token from X-Auth header
    // See if the X-Auth header is set
    if (!req.headers["x-auth"]) {
        if (DEBUG)
            console.log("Auth error from api/images; no x-Auth header");
        return res.status(401).json({error: "Missing X-Auth header"});
	}
    
    //X_Auth should contain the token
    var token = req.headers["x-auth"];
    if (DEBUG)
        console.log("token is: " + token);
        
    var decoded;
    try {
        if (DEBUG)
            console.log("trying to decode token");
        decoded = jwt.decode(token, secret);
	}
    catch (ex) {
        if (DEBUG)
            console.log("Invalid JWT: token did not decode");
        return res.status(401).json({ error: "Invalid JWT" });
	}
    
    // 2. decode token to get user name (usr)

    if (DEBUG)
        console.log("Image upload User is: " + decoded.username);

    var usr = decoded.username;
    User.findOne({uid: usr}, function(err, user) {
     if (err) {
        if (DEBUG)
            console.log("Invalid JWT: user not found");
        return res.status(400).json({error: "Invalid JWT"})
	 }
     if (DEBUG)
        console.log("Generating the image subdir for: " + user.uid)

    // 3. generate the path as imgPath = sha256 of usr.uid
    var userSubdir = crypto.createHash('sha256').update(user.uid).digest("hex");
    if (DEBUG)
        console.log("User Image Path: " + userSubdir);

    // 4. copt the file from uploads to images/imgPath/filename

    var from = "upload/" + req.file.filename;
    var to = "public/images/" + userSubdir + "/" + req.file.filename;
    fs.copyFile(from, to, function(err) {
        if (err) {
            if (DEBUG)
                console.log("Image copy from upload to " + to + " failed")
            return res.status(507).json({error: "Image upload failed", errMsg: err}); 
		}
	});

    if (DEBUG)
        console.log("making the thumbnail image");

    // make a thumbnail of the image
    var thumb = "public/images/" + userSubdir + "/thumbs" + req.file.filename;

    if (DEBUG)
        console.log("thumbnail image: " + thumb);

        mthumb.forImage(
            to,
            thumb,
            {
                width: 125
			})
            
            function then() {console.log("Thumbnail made"),
                   function (err) {console.error(err)};
                        }

        if (DEBUG)
            console.log("Uploaded File copied to images subdirectory");

        //check to see if file was copied
        //he commented this part out

        //5. devare the file from uploads
        fs.unlink(from, function(err) {
            if (err) {
                console.log("File " + from + " was not devared.");
			}  
            console.log("File " + from + " was not devared.");
		});
         
        // 6. make new image doc and save the image information in db
        // make new Image object from the input data
         var img = new Image({
            filename: req.file.filename,
            photo_name: req.body.photoName,
            path: userSubdir,
            album: req.body.album,
            upload_date: new Date(),
            description: req.body.description,
            f_stop: req.body.f_stop,
            s_speed: req.body.s_speed,
            iso: req.body.iso,
            focal_length: req.body.focal_length,
            camera_type: req.body.camera_type,
            owner: user.uid
        });

        //save the image to the database
	
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
});

module.exports = router;