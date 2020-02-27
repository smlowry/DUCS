//store the token in local host and post it to the console. 

$(document).ready(function() {
   
    console.log("token: ")

    function login(uid, password) {
       var requestData = { uid: uid,
                          password: password };

       $.post("/api/auth", requestData, function(data) {
          if (data.token) {
             window.localStorage.setItem("token", 
                data.token);
          }
       });

    }
       $("#submitBtn").click(function() {
          login($("#uid").val(), $("#password").val());  
            console.log(window.localStorage.getItem("token"))
              });
    
//    function displayStatus() { 
//       var token = window.localStorage.getItem("token");
//
//       $.ajax({
//          //url: "/api/status", 
//          type: "GET",
//          headers: { "X-Auth": token }
//       }).done(function(data) {
//            window.location.href = 'http://127.0.0.1:59588/public/home.html';
//          });
//    }
})