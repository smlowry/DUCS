$(function(){
    // load the image information from the database
    $.get('../api/images',(data)=>{
        let html = '';
        //build a card for each image
        for (var i=0; i<data.length; i++) {
            html += '<div class="card border-success mt-3">\n ' +
                '<img class="card-img-top" src="images/' + 
                data[i].filename + '"> \n' + 
                '<div class="card-body">\n' +
                    '<h5 class="card-title">' +
                    data[i].photo_name + '</h5>\n' +
                    '<p class="card-text">Album: ' +
                    data[i].album + '</h5>\n' +
                    '<p class="card-text">Description: '+
                    data[i].description + '</h5>\n' +
                    '<p class="card-text">f-stop: '+
                    data[i].f_stop + '</h5>\n' +
                     '<p class="card-text">s-speed: '+
                    data[i].s_speed + '</h5>\n' +
                     '<p class="card-text">iso: '+
                    data[i].iso + '</h5>\n' +
                     '<p class="card-text">focal length: '+
                    data[i].focal_length + '</h5>\n' +
                     '<p class="card-text">camera type: '+
                    data[i].camera_type + '</h5>\n' +
                
                '</p>\n' +
                '</div>\n</div>'; 
        }
        $('#imageArea').html(html);
        console.log(html);
    });
});