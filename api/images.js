const Image = require('../models/image');
const User = require('../models/user');
const Conn = require("../mysqldb");
const router = require("express").Router();
const multer = require("multer");
const thumb = require('node-thumbnail').thumb;
const path = require("path");
const fs = require('fs');
const crypto = require("crypto");
const jwt = require("jwt-simple");
const config = require("../configuration/config.json");
 
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
// Change to mySQL
router.get("/", (req, res)=> {

   // 1. get the user's token'
   let token = req.query.u;

   console.log("token = " + token)
   console.log()
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
   console.log("usr = " + usr);


   //HERE

    let qry = "SELECT uid, password, full_name FROM User WHERE uid = ?";

    Conn.query(qry, usr, (err, rows) => {

       if (err) {
            if (DEBUG)
                console.log("Server error trying to find user.");
            return res.status(500).json({error: "Server error"});
	   }
       if (DEBUG)
            console.log("get all images for user: " + rows[0].uid);

       if (rows = 1) {
           // 3. Find the user's images

           let qry = "SELECT * FROM Image Where owner = ?";

           Conn.query(qry, usr, (err, img) => {
       


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
        console.log(req.body);
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
        console.log("decoded = " + decoded);
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

    console.log("usr = " + usr);

    let qry = "SELECT uid, password, full_name FROM User WHERE uid = ?";

    Conn.query(qry, usr, (err, rows) => {

        if (err){
            return res.status(400).json ({error: "Invalid JWT"});
        }
        let userSubdir = crypto.createHash("sha256").update(rows[0].uid).digest("hex");
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

        console.log("Posting a new image!");

        var newImage = {
            filename: req.file.filename,
            photo_name: req.body.photoName,
            path: userSubdir,
            album: req.body.album,
            description: req.body.description,
            f_stop: req.body.f_stop,
            s_speed: req.body.s_speed,
            iso: req.body.iso,
            focal_len: req.body.focal_length,
            camera: req.body.camera_type,
            upload_date: new Date(),
            owner: rows[0].uid
        };

        //save the image to the database
    
        // image.save((err, img)=> {
        //     if (err) {
        //         res.status(400).send(err);
        //     }
        // });

        Conn.query("INSERT INTO Image SET ?", newImage, (err, result)=> {
            if (err){
                console.log("Trouble inserting image");
                console.log(err);
                res.status(400).send(err);
                
              }  
        });
    });
});

module.exports = router;