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
       $("#loginBtn").click(function() {
          login($("#uid").val(), $("#password").val());  
            console.log(window.localStorage.getItem("token"))
              });
})