// authCtrl.js
// This page controls elements of the index.html page
// Such as: handling buttons, adding images, and showing and hiding cards

$(document).ready(function() {
    

    //handle login
    $('#loginForm').on('submit',(e)=> {
        e.preventDefault();
        
        $('#authError').hide();
        
        let loginData = {
            username: $('#email').val(),
            password: $('#logPassword').val()
        };
        console.log(loginData.password);
        $.ajax({
            type: "POST",
            url: "api/auth",
            data: JSON.stringify(loginData),
            contentType: "application/json",
            statusCode: {
                401: (resObj, textStatus, jqXHR)=> {
                $('#authError').show();
                $('#authError').addClass('show');
                }
            }
        })
        .fail((jqXHR ) => {
            if (jqXHR.status != 401) {
                alert('Error Reported: ' + jqXHR.status + '\n' + jqXHR.statusText);
            
            }
        })
        .done((data) => {
            $('#loginPanel').hide();
            $('#userMenu').show();
            $('#welcomeMsg span').html("Welcome, " + data.full_name + '&nbsp;&nbsp;<button id="logout" type="button" class="btn btn-link">Logout</button>')
            $('#welcomeMsg').show();
            $('#logout').on('click', (e)=>{
                $('#welcomeMsg').hide();
                $('#userMenu').hide();
                $('#loginPanel').show();
                window.localStorage.removeItem('token');
            });
            $('#sem-login').modal('toggle');
            window.localStorage.setItem("token", data.token);
            console.log(data.token);   
        });
        return false;
    });
     
    $('#sem-login').on('hidden.bs.modal', (e) =>{
        $('#email').val('');
        $('#logPassword').val('');
    });
    
    
    $('#sem-reg').on('hidden.bs.modal', (e)=> {
        $('#username').val(''); 
        $('#name').val(''); 
        $('#password').val(''); 
        $('#confirmPass').val(''); 
    });
    
    //handle submission
    $('#regForm').on("submit", (e)=> {
        console.log("Submitting correctly");
        e.preventDefault();
        
        // test the password and confirmed password are equal
        $('#passError').hide();
        if ($('#password').val() == $('#confirmPass').val()) {
            console.log("passwords are equal");
            //passwords are equal and rest of data validated
            //save the user
            let reqData = { username: $('#username').val(),
                            password: $('#password').val(),
                            full_name: $('#name').val()
                          };
            
            console.log(reqData);
                
                
                          
            $.ajax({
                type: "POST",
                url: "api/users",
                data: JSON.stringify(reqData),
                contentType: "application/json",
                statusCode: {
                    201: (resObj, textStatus, jqXHR)=> {
                        $('#sem-reg').modal('toggle');
                        $('#sem-login').modal('toggle');
                    },
                    409: (resObj, textStatus, jqXHR)=> {
                        $('#username').focus().select();
                        $('#duperror').show();
                        $('#dupError').addClasss('show');
                    }
                }
            })
            .fail((jqXHR)=> {
                if (jqXHR.status != 409) {
                    alert('Error Reported: ' + jqXHR.status + '\n' + jqXHR.statusText);
                    }
            });
        }
        else {
            // passwords do not match display error message
                $('#password').val('');
                $('#confirmPass').val('');
                $('#passError').show();
                $('#passError').addClass('show');
            }
        
            return false;
        });
    
    
    // //get Photos page
    // $('#menuPhotos').on('click', (e)=> {
    //     let pageNo = '8202';
    //     let token = window.localStorage.getItem("token");
    //     console.log(token);
    //     $.ajax({
    //         type: "GET",
    //         headers: {"X-Auth": token},
    //         url: "api/page?pageid=" + pageNo,
    //         dataType: "html",
    //         statusCode: {
    //             401: (resObj, textStatus, jqXHR)=> {
    //                 alert("Not authorized to access page.");
    //             },
    //             404: (resObj, textStatus, jqXHR)=> {
    //                 alert("page not found");
    //             },
    //         }
    //     })
    //     .fail((jqXHR) =>{
    //         if ((jqXHR.status != 401) || jqXHR.status != 404) {
    //             console.log(jqXHR.textStatus);
    //             alert('Server Error');
                
    //         }
    //     })
    //     .done((data)=> {
    //         data = data.trim();
    //         $('#main').html(data); //replace with data 
    //         console.log($('#main').html());
    //         console.log("Page loaded.");
    //         //run script to load data
    //         loadImages();
    //         return false;
    //     });
    //  });

    $('#menuPhotos').on('click', (e)=> {
            $('#myImages').show();
            $('#homeCard').hide();
            loadImages();
            console.log("loadImages called")
    });

    $('#uploadBtn').on('click', (e)=> {
        $('#uploadCard').show();
        $('#homeCard').hide();
    });

    $("#uploadForm").submit(function(event){
        event.preventDefault();
        var form = $(this);
        var formData = new FormData($("#uploadForm")[0]);
    
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: form.attr('action'),
            data: formData,
            headers: {
                "X-Auth": window.localStorage.getItem("token")
            },
            contentType: false, 
            processData: false
        });
        $('#uploadCard').hide();
   });
});
