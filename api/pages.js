// 1. api/page?pageid=#### was added in Sprint 3

const Page = require('../models/page');
const User = require('../models/user')
const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto')
const jwt = require('jwt-simple')
const config = require('../configuration/config.json');


const DEBUG = false;

var secret = config.secret;


router.get('/', (req,res)=> {
    // 1. authenticate the user token
    if (DEBUG)
        console.log('entered api/page');
    
    if (!req.headers["x-auth"]) {
        if (DEBUG)
            console.log("Auth error from api/images: no x-Auth header");
        return res.status(401).json({error: "Missing X-Auth header"});
    }
    
    // X-Auth should contain the token
    let token = req.headers["x-auth"];
    if (DEBUG)
        console.log("token is: " + token);
    
    let decoded
    try {
        if (DEBUG)
            console.log("Trying to decode token");
        decoded = jwt.decode(token, secret);
    }
    catch (ex) {
        if (DEBUG)
            console.log("Invalid JWT: token did not decode");
        return res.status(401).json({error: "Invalid JWT"});
    }
    
    let usr = decoded.uid;

    
    User.findOne({uid: usr}, (err, user)=> {
        if (err) {
            if (DEBUG)
                console.log("Server could not fulfill request");
            return res.status(500).json({error: "Server error"});
        }
        
        if (DEBUG)
            console.log("Get page: " + req.query.pageid + " for " + user.uid);
        
            //not finding user

        if (user) {
            // assert user authentication
            // 2. if autheticated
            // 2.1 find pageID in database
            Page.findOne({pageID: req.query.pageId},(err, page)=> {
                if (err) {
                    if (DEBUG)
                        console.log("Page: " + req.query.pageid + " not found");
                    return res.status(500).json({error: "Server error"});
                }
                //assert page was found
                // 2.2 if pageID exists
                
                if (page) {
                    //assert page was found
                    // 2.2.1 return status 200 and 2.2.2 return with pageName
                    let path2Page = path.resolve("pages/" + page.pageName);
                    return res.status(200).sendFile(path2Page);
                }
                else {
                    // page was not found
                    //2.3 IF pageId does not exist return 404
                    return res.status(404).json({error: "Page not found"});
                }
            });
        }
        else {
            // 3. is not authenticated: return status 401
            res.status(401).json({error: "Not authenticated."});
        } 
    });
     
});

module.exports = router;