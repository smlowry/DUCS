// photo.js
// This page contains the loadImages() function
// which is responsible for retrieving images for individual users
// and sorting them into their respective albums

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
    
        const unique = (value, index, self) => {
            return self.indexOf(value) === index
          }
        
        // create an array of all albums from each image (including duplicates)
        albumArray = []; 

        for (i=0; i<data.length; i++) {
            albumArray.push(data[i].album)
        }

        // create a new array of all albums for each image - this time remove all duplicate albums
        const uniqueAlbums = albumArray.filter(unique);

        for (i=0; i<uniqueAlbums.length; i++) {

            // create a card for each unique album
            html += '<div class="card border-success mt-3">\n' + '<h2 class="card-header">Album - ' +uniqueAlbums[i]+ '</h2>\n' + '<div class="card-body">\n';
            
             //add the user's images to their respective albums
            for (var j=0; j<data.length; j++) {

                if (data[j].album == uniqueAlbums[i]) {
                html += '<img class="thumbImg" src="images/' +data[j].path + '/thumbs/' + data[j].filename + '">\n';
                }
            }

            html +='</div\n</div>\n';
        }

        console.log("Full html: " + html);
        //put in the image area
        $('#imageArea').html(html);
        console.log("Token: " + token);
    })
    .fail(function(jqXHR) {
        alert("Image Query Failed: \nStatus: " + jqXHR.statusCode + " : " + jqXHR.statusText);
    });
}



