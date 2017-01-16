// lots of global variables so that we don't have to make one huge function
var map;
var geocoder;

// we'll use this to make sure the user doesn't get a result that is outside of the county unless specified
var geocodeOptions = function(hasUsedAutoComplete, address) {

  if (!hasUsedAutoComplete) return {
    'address': address,
    'componentRestrictions': {
      'administrativeArea': 'Blount County'
    }
  };

  if (hasUsedAutoComplete) return {
    'address': address
  }
};
var hasUsedAutoComplete = false;
var directionsService;
var AMdirectionsRenderers;
var PMdirectionsRenderers;
var geocoderResults;
var bounds;
var school;
var googleMapsIsLoaded = false;

var blueStylingForGoogleMaps = [
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [
      {
        "hue": "#FFAD00"
      },
      {
        "saturation": 50.2
      },
      {
        "lightness": -34.8
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      {
        "hue": "#FFC300"
      },
      {
        "saturation": 54.2
      },
      {
        "lightness": -14.4
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
      {
        "hue": "#ffad00"
      },
      {
        "saturation": -19.8
      },
      {
        "lightness": -1.8
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "all",
    "stylers": [
      {
        "hue": "#FFAD00"
      },
      {
        "saturation": 72.4
      },
      {
        "lightness": -32.6
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "all",
    "stylers": [
      {
        "hue": "#FFAD00"
      },
      {
        "saturation": 74.4
      },
      {
        "lightness": -18
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
      {
        "hue": "#00FFA6"
      },
      {
        "saturation": -63.2
      },
      {
        "lightness": 38
      },
      {
        "gamma": 1
      }
    ]
  }
];

function initMap() {
  googleMapsIsLoaded = true;

  map = new google.maps.Map(document.getElementById('googlemaps'), {
    center: {lat: 35.566529, lng: -84.096829}, // centered on Maryville
    zoom: 8,
    rotateControl: false,
    scrollwheel: false,
    navigationControl: false,
    disableDefaultUI: true,
    mapTypeControl: false,
    streetViewControl: false, // hide the yellow Street View pegman
    scaleControl: false, // allow users to zoom the Google Map
    draggable: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: blueStylingForGoogleMaps,
    disableDoubleClickZoom: false
  });
  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService;

  bounds = new google.maps.LatLngBounds();

  // Each route needs its own direction renderer
  AMdirectionsRenderers = [];
  PMdirectionsRenderers = [];

  // Address autocomplete
  var autoComplete = new google.maps.places.Autocomplete(
    document.getElementById('search')
  );

  google.maps.event.addListener(autoComplete, 'place_changed', function() {
    hasUsedAutoComplete = true;
  });
}

function requestRoute(selectedSchool) {
  school = selectedSchool;

  if (!googleMapsIsLoaded) {
    alert('Please Wait. Your results are loading...');

    var loader = setInterval(function () {
      if (googleMapsIsLoaded) {
        getCoordsFromAddress();

        map.setOptions({
          zoom: 8,
          center: {lat: 35.566529, lng: -84.096829}, // centered on Maryville
          disableDefaultUI: true,
          zoomControl: false,
          disableDoubleClickZoom: false,
          rotateControl: false,
          scrollwheel: true,
          navigationControl: false,
          mapTypeControl: false,
          streetViewControl: false, // hide the yellow Street View pegman
          scaleControl: false, // allow users to zoom the Google Map
          draggable: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: []
        });
        clearInterval(loader);
      } else {
        console.log('Will check again in 1 second');
      }
    }, 1000);
  } else {
    map.setOptions({
      zoom: 8,
      center: {lat: 35.566529, lng: -84.096829}, // centered on Maryville
      zoomControl: false,
      disableDoubleClickZoom: false,
      rotateControl: false,
      scrollwheel: true,
      navigationControl: false,
      mapTypeControl: false,
      streetViewControl: false, // hide the yellow Street View pegman
      scaleControl: false, // allow users to zoom the Google Map
      draggable: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: []
    });

    getCoordsFromAddress()
  }
}

function getCoordsFromAddress() {


  var address = document.getElementById( 'search' ).value;

  // geocoder returns a bunch of information about the address including coords
  geocoder.geocode( geocodeOptions(hasUsedAutoComplete, address), function( results, status ) {
    // reset whether the user has used auto-completion or not
    hasUsedAutoComplete = false;

    if( status == google.maps.GeocoderStatus.OK ) {
      // make a marker of the user's house
      new google.maps.Marker({
        position: {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()},
        map: map,
        title: "This is you!",
        icon: '/img/this_is_you.png',
        animation: google.maps.Animation.DROP
      });

      // Store geocoder results (user's coordinate) and send data to the server for processing
      geocoderResults = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};

      // Once the function is done running, send data to server
      sendAndGetData();

    } else {
      alert( 'Geocode was not successful for the following reason: ' + status );
    }
  });
}

function sendAndGetData() {
  // Send an AJAX request to our router
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      // parse the response from the server
      var json = JSON.parse(xhr.responseText);

      sendBackToUser(json);

    }
  };

  xhr.open('POST', '/submit', true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8'); // parse as json on server-side
  // since express will parse the request by default, we have to stringify it
  xhr.send(JSON.stringify({
    coords: geocoderResults,
    school: school
  }));
}

function sendBackToUser(json) {

  // the directionsService will not let you use a literal {lat: 43.4, lng: 23.2} and makes you use the LatLng data type
  var AMwaypoints = [];
  var PMwaypoints = [];

  // Convert every coordinate in the bus_route to a new google.maps.LatLng()
  if (json.am_bus_found) {
    convertCoordsToWaypoints(json.bus_route.am, AMwaypoints, false);

    // subtract the amount of direction renderers already in existence
    for (var i = 0; i < AMwaypoints.length - AMdirectionsRenderers.length; i++) {
      AMdirectionsRenderers.push(new google.maps.DirectionsRenderer());
    }

    for (var i = 0; i < AMwaypoints.length; i++) {
      for (var j = 0; j < AMwaypoints[i].length; j++) {
        bounds.extend(AMwaypoints[i][j].location);
      }
    }

    // create a visual bus route with the information from the bus_route (hopefully will allow more than 23 waypoints)
    for (var i=0; i < AMdirectionsRenderers.length; i++) {
      requestDirections(
        AMwaypoints[i][0].location,
        AMwaypoints[i][AMwaypoints[i].length - 1].location,
        AMwaypoints[i],
        AMdirectionsRenderers[i],
        'AM',
        false, // do not fit viewport to route (fitbounds will handle this instead)
        4,
        1
      );
    }
  }

  if (json.pm_bus_found) {
    convertCoordsToWaypoints(json.bus_route.pm, PMwaypoints, false);

    for (var i=0; i < PMwaypoints.length - PMdirectionsRenderers.length; i++) {
      PMdirectionsRenderers.push(new google.maps.DirectionsRenderer());
    }

    for (var i = 0; i < PMwaypoints.length; i++) {
      for (var j = 0; j < PMwaypoints[i].length; j++) {
        bounds.extend(PMwaypoints[i][j].location);
      }
    }

    for (var i=0; i < PMdirectionsRenderers.length; i++) {
      requestDirections(
        PMwaypoints[i][0].location,
        PMwaypoints[i][PMwaypoints[i].length - 1].location,
        PMwaypoints[i],
        PMdirectionsRenderers[i],
        'PM',
        false, // do not fit viewport to route (fitbounds will handle this instead)
        2,
        10000
      );
    }
  }

  // we don't want to randomly zoom to a spot if there isn't a bus route found
  console.log(json.pm_bus_found || json.am_bus_found)
  if (json.pm_bus_found || json.am_bus_found) {
    var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
    var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
    bounds.extend(extendPoint1);
    bounds.extend(extendPoint2);

    // After the rendering has been done, fit the bounds
    google.maps.event.addListenerOnce(map, 'idle', function () {
      map.fitBounds(bounds);

      showMapControlsAndUI(json.am_bus_number, json.pm_bus_number);
    });

    if (json.am_changes_at_school != "none") alert("Also, keep in mind that your morning bus changes at " + json.am_changes_at_school);
    if (json.pm_changes_at_school != "none") alert("Oh, and your afternoon bus changes at " + json.pm_changes_at_school);
  }
}

// ------------------------------------ FRONT END STUFF ------------------------

// For the checkboxes
function toggleRoute(AMorPM) {
  var toggleAM = document.getElementById("toggleAM");
  var togglePM = document.getElementById("togglePM");

  if (AMorPM == 'AM') {
    for (var i = 0; i < AMdirectionsRenderers.length; i++) {
      if (!toggleAM.checked) {
        AMdirectionsRenderers[i].setMap(map);
      } else {
        AMdirectionsRenderers[i].setMap(null);
      }
    }
  }

  if (AMorPM == 'PM') {
    for (var i = 0; i < PMdirectionsRenderers.length; i++) {
      if (!togglePM.checked) {
        PMdirectionsRenderers[i].setMap(map);
      } else {
        PMdirectionsRenderers[i].setMap(null);
      }
    }
  }
}