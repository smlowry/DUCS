//load the image from the database
function loadImages() {


    //get the user's token
    console.log("loadImages function:");

    let token = window.localStorage.getItem('token');

    let url = 'api/images?u=' + token;
    console.log("Image search url: " + url);
    $.get(url, (data)=> {
        console.log("Data: " + data);
        //create the card for the recent images
        let html = '<div class="card border-success mt-3">\n' + '<h2 class="card-header">Recent Images</h2>\n' + '<div class="card-body">\n';
        
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
    .fail(function(jqXHR) {
        alert("Image Query Failed: \nStatus: " + jqXHR.statusCode + " : " + jqXHR.statusText);
    });
}



