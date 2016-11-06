/* global google */

var map;
var school = ""; // user has not selected school yet

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.566529, lng: -84.096829},
    zoom: 8
  });
  geocoder = new google.maps.Geocoder();
}

function getCoordsFromAddress() {
  var address = document.getElementById( 'address' ).value + " tn";


  // geocoder returns a bunch of information about the address including coords
  geocoder.geocode( { 'address' : address }, function( results, status ) {
    if( status == google.maps.GeocoderStatus.OK ) {

      // make a marker of the user's house
      new google.maps.Marker({
        position: {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()},
        map: map,
        title: "This is you!",
        icon: 'http://www.free-icons-download.net/images/map-marker-icons-49653.png',
        animation: google.maps.Animation.DROP
      });

      // Send an AJAX request to our router
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          // parse the response from the server
          var json = JSON.parse(xhr.responseText);

          // for each route, make a marker on the map
          for (var i = 0; i < json.amRoutes.length; i++) {
            new google.maps.Marker({
              position: {lat: json.amRoutes[i][0], lng: json.amRoutes[i][1]},
              map: map,
              title: i.toString(),
              animation: google.maps.Animation.DROP
            });
          }

          alert("Your closest bus is " + json.bus_number + "\n\n Markers have been added to show your route");
        }
      };
      xhr.open('POST', '/submit', true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.send(JSON.stringify({
        coords: results[0].geometry.location,
        school: school
      }));

    } else {
      alert( 'Geocode was not successful for the following reason: ' + status );
    }
  });
}

function validateInfo() {
  if (document.getElementById( 'address' ).value == "" || school == "") {
    alert("Please fill in each box (address and school)");
  } else {
    getCoordsFromAddress();
  }
}

// For the dropdown button
document.getElementById('dropdown').addEventListener('click', function(e) {
  document.getElementsByClassName('btn')[0].innerHTML = e.target.innerText + '&nbsp <span class="caret"></span>';
  school = e.target.innerText;
});