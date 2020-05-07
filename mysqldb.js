var mysql = require("mysql");

var conn = mysql.createConnection ({
    host: "ec2-18-217-134-54.us-east-2.compute.amazonaws.com",
    user: "sean",
    password: "12LetmeIn!",
    database: "imageDB-sean"
});

module.exports = conn;

conn.connect(function(err){
    if (err){
        console.log("Error connecting to MySQL:", err);
    }
    else {
        console.log("Connection established.")
    }
})