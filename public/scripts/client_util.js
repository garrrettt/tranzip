function requestDirections(start, end, waypoints, directionsRenderer, AMorPM, preserveViewport, strokeWeight, zIndex) {
  directionsService.route({
    origin: start,
    destination: end,
    waypoints: waypoints,
    travelMode: google.maps.DirectionsTravelMode.DRIVING,
    optimizeWaypoints: true
  }, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) { // Google is saying that both are 'OK'
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: AMorPM == "AM" ? "blue" : "red",
          strokeOpacity: 2,
          strokeWeight: strokeWeight,
          zIndex: zIndex
        },
        suppressInfoWindows: true,
        suppressMarkers: true,
        preserveViewport: preserveViewport
      });
      // place the renderer on the map, and then render the directions on the map
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(result);
    } else {
      console.log(status);

      alert("Oops! Looks like there was an error requesting your map, please try again.");
    }
  });
}

function convertCoordsToWaypoints(busRoute, waypointArray, stopover) {
  // for every waypoint in the given busRoute, turn it into a google.maps.LatLng
  var tempArrayFor23Waypoints = [];

  for (var i=0; i < busRoute.length; i++) {
    if (i % 23 == 0 && i != 0 ) {
      waypointArray.push(tempArrayFor23Waypoints);

      tempArrayFor23Waypoints = [];

      // go ahead and place the first one of new directions renderer as the last one of old renderer
      // (so directions are seen as 1 connected object on screen)
      tempArrayFor23Waypoints.push(waypointArray[Math.floor(i/23)-1][waypointArray[Math.floor(i/23)-1].length - 1]);
    } else {

      tempArrayFor23Waypoints.push({
        location: new google.maps.LatLng(busRoute[i].lat, busRoute[i].lng),
        stopover: stopover
      });
    }
  }

  if (tempArrayFor23Waypoints != []) {
    waypointArray.push(tempArrayFor23Waypoints);
  }
}
