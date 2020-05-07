const Image = require('../models/image');
const User = require('../models/user');
const router = require("express").Router();
const multer = require("multer");
const thumb = require('node-thumbnail').thumb;
const path = require("path")
const fs = require('fs');
const crypto = require("crypto")
const jwt = require("jwt-simple")
const config =require("../configuration/config.json")
 
const DEBUG = true;
var secret = config.secret;
// SET STORAGE
var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'upload')
      },
      filename: (req, file, cb) => {
        cb(null,  file.fieldname + '-' + Date.now() + path.extname(file.originalname))
      } 
    });

// set upload object to store pictures to correct location
var upload = multer({ storage: storage })

// Get list of all images in the database
router.get("/", (req, res)=> {
   
   // 1. get the user's token'
   let token = req.query.u;
    
   // 2. decode the token and validate the User
   let decoded
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

   //change username to uid
   let usr = decoded.uid; 

   User.findOne({uid: usr}, (err,user)=>{
       if (err) {
            if (DEBUG)
                console.log("Server error trying to find user.");
            return res.status(500).json({error: "Server error"});
	   }
       if (DEBUG)
            console.log("get all images for user: " + user.uid);

       if (user) {
           // 3. Find the user's images
           Image.find({owner: user.uid},(err, img)=> {
               if (err) {
                    res.status(500).json({error: "Server error"});  
               }
               
               else {
                    console.log(img);
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
router.post('/', upload.single('photo'), (req, res)=> {
    console.log("image upload called");
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
    let token = req.headers["x-auth"];
    if (DEBUG)
        console.log("token is: " + token);
        
    let decoded;
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
        console.log("Image upload User is: " + decoded.uid);

    let usr = decoded.uid;
    console.log(usr);
    User.findOne({uid: usr}, (err, user)=>{
        if (err){
            return res.status(400).json ({error: "Invalid JWT"});
        }
        console.log(user);
        let userSubdir = crypto.createHash("sha256").update(user.uid).digest("hex");
        console.log("userSubDir = "+ userSubdir);

        let from = "upload/" + req.file.filename;
        let to = "public/images/" + userSubdir + "/" + req.file.filename;

        fs.copyFile(from, to, (err)=>{
            if (err){
                return res.status(507).json({error: "Image upload failed"})
            }
        });


       let thumbFrom = "public/images/" + userSubdir + "/" + req.file.filename;
       let thumbTo   = "public/images/" + userSubdir + "/thumbs/";
       thumb({
            source: thumbFrom,
            destination: thumbTo,
       }).then(function(){
           console.log("Thumbnail successfully created!");
       }
       ).catch(function(e){
           console.log("Error creating thumbnail:", e.toString());
       });

    

        //Deletes image from upload
        fs.unlink(from, (err)=>{
            if (err){
                console.log("Image was not deleted from upload folder.");
            }
            else{
                console.log("Image succesfully deleted from upload folder.");
            }
        });

        console.log("")

        console.log("Posting a new image!");
        var image = new Image({
            filename: req.file.filename,
            photo_name: req.body.photoName,
            owner: user.uid,
            path: userSubdir,
            album: req.body.album,
            upload_date: new Date(),
            description: req.body.description,
            f_stop: req.body.f_stop,
            s_speed: req.body.s_speed,
            iso: req.body.iso,
            focal_length: req.body.focal_length,
            camera_type: req.body.camera_type

        });

        //save the image to the database
    
        image.save((err, img)=> {
            if (err) {
                res.status(400).send(err);
            }
        });
    });
});

module.exports = router;