//load the image from the database
function loadImages() {
    //get the user's token
    var token = window.localStorage.getItem('token');
    var url = 'api/images?u=' + token;
    console.log("Image search url: " + url);
    $.get(url, function(data) {
        //create the card for the recent images
        var html = '<div class="card border-success mt-3">\n' + '<h2 class="card-header">Recent Images</h2>\n' + '<div class="card-body">\n';
        
        // put the image thumbnails in a single card
        for (var i=0; i<data.length; i++) {
            html += '<img class="thumbImg" src="images/' +data[i].path + '/thumbs/' + data[i].filename + '">\n';
            console.log("adding image: " + data[i].filename);
            console.log("HTML is: " + html);
        }
        //close card
        html +='</div\n</div>\n';
        console.log("Full html: " + html);
        //put in the image area
        $('#imageArea').html(html);
        console.log("Token: " + token);
    })
    .fail( function(jqXHR) {
        alert("Image Query Failed: \nStatus: " + jqXHR.statusCode + " : " + jqXHR.statusText);
    });
}






//old method 

//$(function(){
//    // load the image information from the database
//    $.get('../api/images',(data)=>{
//        var html = '';
//        //build a card for each image
//        for (var i=0; i<data.length; i++) {
//            html += '<div class="card border-success mt-3">\n ' +
//                '<img class="card-img-top" src="images/' + 
//                data[i].filename + '"> \n' + 
//                '<div class="card-body">\n' +
//                    '<h5 class="card-title">' +
//                    data[i].photo_name + '</h5>\n' +
//                    '<p class="card-text">Album: ' +
//                    data[i].album + '</h5>\n' +
//                    '<p class="card-text">Description: '+
//                    data[i].description + '</h5>\n' +
//                    '<p class="card-text">f-stop: '+
//                    data[i].f_stop + '</h5>\n' +
//                     '<p class="card-text">s-speed: '+
//                    data[i].s_speed + '</h5>\n' +
//                     '<p class="card-text">iso: '+
//                    data[i].iso + '</h5>\n' +
//                     '<p class="card-text">focal length: '+
//                    data[i].focal_length + '</h5>\n' +
//                     '<p class="card-text">camera type: '+
//                    data[i].camera_type + '</h5>\n' +
//                
//                '</p>\n' +
//                '</div>\n</div>'; 
//        }
//        $('#imageArea').html(html);
//        console.log(html);
//    });
//});