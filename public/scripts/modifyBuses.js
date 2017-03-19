// to understand recursion, please see the bottom of this file

// Also, AMroute and PMroute are in the modifyBuses.ejs because they are passed in from the server

// google maps global variables
var map;
var geocoder;
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

var directionsService;
var AMdirectionsRenderers = [];
var AMdirectionsRenderersMarkers = [];
var PMdirectionsRenderers = [];
var PMdirectionsRenderersMarkers = [];
var infowindow;

// Finally, this variable stores all changes in this editing session
var changes = {
  add: [],
  edit: [],
  remove: []
};

function initMap() {
  map = new google.maps.Map(document.getElementById('googlemapsWithRoutes'), {
    center: {lat: 35.566529, lng: -84.096829}, // centered on Maryville
    zoom: 8,
    rotateControl: false,
    scrollwheel: true,
    navigationControl: false,
    disableDefaultUI: true,
    mapTypeControl: false,
    streetViewControl: false, // hide the yellow Street View pegman
    scaleControl: true, // allow users to zoom the Google Map
    draggable: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService;

  infowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  var tempStorageFor23Waypoints = []; // to be pushed into 23 times while looping through each waypoint

  // All the AM directions rendering (only done if AMroute exists)
  var amWaypoints = [];

  if (AMroute.length != 0) {
    // note that the waypoints are stored in sub-arrays of 23 waypoints each
    convertCoordsToWaypoints(AMroute, amWaypoints, true);

    for (var i = 0; i < AMroute.length; i++) {
      var marker = new google.maps.Marker({
        position: AMroute[i],
        address: AMaddresses[i],
        map: map,
        title: "AM Marker " + i,
        AMorPM: "AM",
        id: i - Math.floor(i/23),
        directionsRendererId: Math.floor(i/23)
      });

      // 1 directions renderer per 23 waypoints
      if (i % 23 == 0) {
        AMdirectionsRenderersMarkers.push([]);
        AMdirectionsRenderers.push(new google.maps.DirectionsRenderer());
      }

      AMdirectionsRenderersMarkers[Math.floor(i/23)].push(marker);

      marker.addListener('click', function () {
        populateInfoWindow(this, infowindow, AMdirectionsRenderers, amWaypoints, AMdirectionsRenderersMarkers);
      });
      bounds.extend(marker.position);
    }

    for (var i=0; i < AMdirectionsRenderers.length; i++) {
      requestDirections(
        amWaypoints[i][0].location,
        amWaypoints[i][amWaypoints[i].length - 1].location,
        amWaypoints[i], // this array contains multiple arrays with max of 23 waypoints in each
        AMdirectionsRenderers[i],
        'AM',
        true, // don't fit viewport to route
        4,
        1
      );
    }
  } else {
    amWaypoints.push([]); // for storage of any future markers

    AMdirectionsRenderersMarkers.push([]);
  }

  // All the PM directions rendering (only done if PMroute exists)
  var pmWaypoints = [];

  if (PMroute.length != 0) {
    // again note that the waypoints are stored in sub-arrays of 23 waypoints each
    convertCoordsToWaypoints(PMroute, pmWaypoints, true);

    for (var i = 0; i < PMroute.length; i++) {
      var marker = new google.maps.Marker({
        position: PMroute[i],
        address: PMaddresses[i],
        map: map,
        title: "PM Marker " + i,
        AMorPM: "PM",
        id: i,
        directionsRendererId: Math.floor(i/23)
      });

      // if i is beginning or end of route
      if (i % 23 == 0) {
        PMdirectionsRenderersMarkers.push([]);
        PMdirectionsRenderers.push(new google.maps.DirectionsRenderer());
      }

      PMdirectionsRenderersMarkers[Math.floor(i/23)].push(marker);

      marker.addListener('click', function () {
        populateInfoWindow(this, infowindow, PMdirectionsRenderers, pmWaypoints, PMdirectionsRenderersMarkers);
      });
      bounds.extend(marker.position);
    }

    for (var i=0; i < PMdirectionsRenderers.length; i++) {
      requestDirections(
        pmWaypoints[i][0].location,
        pmWaypoints[i][pmWaypoints[i].length - 1].location,
        pmWaypoints[i],
        PMdirectionsRenderers[i],
        'PM',
        true, // don't fit viewport to route
        2,
        10000
      );
    }
  } else {
    pmWaypoints.push([]); // for storage of any future waypoints this editing session

    PMdirectionsRenderersMarkers.push([]);
  }

  // Don't zoom in too far on only one marker
  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
    var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
    var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
    bounds.extend(extendPoint1);
    bounds.extend(extendPoint2);
  }

  // Address autocomplete
  var autoComplete = new google.maps.places.Autocomplete(
    document.getElementById('adminSearch')
  );

  // if they used the auto-completion (precise), then don't limit them to Blount county
  var hasUsedAutoComplete = false;

  google.maps.event.addListener(autoComplete, 'place_changed', function() {
    hasUsedAutoComplete = true;
  });

  document.getElementById('submit').addEventListener('click', function() {

    // get value of selector
    var addAMorPM = $("#AMorPMAdd").text().trim();
    console.log(addAMorPM);

    if (addAMorPM == "AM") validateInfoAndAddMarker(addAMorPM, AMdirectionsRenderers, amWaypoints, AMdirectionsRenderersMarkers, hasUsedAutoComplete);
    if (addAMorPM == "PM") validateInfoAndAddMarker(addAMorPM, PMdirectionsRenderers, pmWaypoints, PMdirectionsRenderersMarkers, hasUsedAutoComplete);

    // set search restriction to Blount County again until they search another time
    hasUsedAutoComplete = false;
  });

  // if any markers exist, zooms in to fit all the markers
  if (AMroute.length != 0 || PMroute.length != 0) {
    google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
      map.fitBounds(bounds);

      // fitBounds causes 1 or more markers to not show up until the map is slightly moved or zoomed in
      var cnt = map.getCenter();
      cnt.e += 0.000001;
      map.panTo(cnt);
      cnt.e -= 0.000001;
      map.panTo(cnt);
    });
  }
}

function edit() {
  document.getElementById('infowindowContainer').style.display = "none";
  document.getElementById('newAddress').style.display = "inline-block";
  document.getElementById('back').style.display = "inline-block";

}

function back() {
  document.getElementById('infowindowContainer').style.display = "inline";
  document.getElementById('newAddress').style.display = "none";
  document.getElementById('back').style.display = "none";
}

function populateInfoWindow(marker, infowindow, directionsRenderers, associatedWaypoints, associatedMarkers) {
  console.log(marker);
  var html = '\
  <div>This marker is ' + marker.address + '</div><br> \
    <div id="infowindowContainer"> \
      <div id="edit" class="squareButton btn btn-success" onclick="edit()">Edit</div> \
      <div id="delete" class="squareButton btn btn-danger">Delete</div> \
    </div> \
    <input type="text" id="newAddress" class="form-control" placeholder = "Enter an address..."/> \
    <div id="back" class="btn btn-info form-control" onclick="back()">Back</div> \
  ';

  // Check to make sure infowindow is not already opened on this marker
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent(html);
    infowindow.open(map, marker);
    // ensure marker property is cleared if infowindow is closed
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null; // allows you to close and reopen infowindows more than once
    });
  }

  var hasUsedAutoComplete = false;

  // Address autocomplete for 'edit'
  var autoComplete = new google.maps.places.Autocomplete(
    document.getElementById('newAddress')
  );

  google.maps.event.addListener(autoComplete, 'place_changed', function() {
    hasUsedAutoComplete = true;
  });

  document.getElementById('delete').addEventListener('click', function() {
    removeFromMap(infowindow, infowindow.anchor.AMorPM, directionsRenderers, associatedWaypoints, associatedMarkers);
  });

  // Handle the event of the user saving the "edit"
  document.getElementById('newAddress').addEventListener('keypress', function(e) {
    if (e.keyCode == 13) {
      moveMarker(infowindow, associatedWaypoints, directionsRenderers, hasUsedAutoComplete);
    }
  });
}

function addMarker(AMorPM, directionsRenderers, waypoints, markerArray, hasUsedAutoComplete) {
  var addAddress = document.getElementById('adminSearch').value;

  // add to sidebar
  addToChangesSideBar(AMorPM, "add", addAddress);

  // get coords from address
  geocoder.geocode( geocodeOptions(hasUsedAutoComplete, addAddress), function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var doNotAdd = false;

      for (var i=0; i < changes.remove.length; i++) {

        // if marker was deleted and now being added, don't add; remove from changes.remove
        if (changes.remove[i].coords.lat == parseFloat(results[0].geometry.location.lat().toFixed(6)) &&
            changes.remove[i].coords.lng == parseFloat(results[0].geometry.location.lng().toFixed(6))) {
          changes.remove.splice(i, 1);
          doNotAdd = true;

          break;
        }
      }

      if (!doNotAdd) {
        // Add to list of all added waypoints in this editing session
        changes.add.push({
          AMorPM: AMorPM,
          coords: {
            lat: parseFloat(results[0].geometry.location.lat().toFixed(6)),
            lng: parseFloat(results[0].geometry.location.lng().toFixed(6))
          },
          address: addAddress,
          newMarker: true,
          uniqueId: uniqueSideBarId
        });
      }

      // if there are already 23 waypoints in the sub-array, create new array
      if (waypoints.length != 0 && waypoints[waypoints.length - 1].length == 23) {
        waypoints.push([{
          location: new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()),
          stopover: false
        }]);
      } else {
        waypoints[waypoints.length - 1].push({
          location: new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()),
          stopover: false
        });
      }

      var marker = new google.maps.Marker({
        address: addAddress,
        position: {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()},
        map: map,
        title: AMorPM + " Marker " + markerArray.length,
        AMorPM: AMorPM,
        id: markerArray[markerArray.length - 1].length,
        directionsRendererId: directionsRenderers.length - 1 // .length is going to give me 1 more than the index
      });

      // if we had to create a new-sub array to account for more than 23 waypoints, increment the directionsRendererId
      if (markerArray[markerArray.length - 1].length == 23) {
        directionsRenderers.push(new google.maps.DirectionsRenderer);

        marker["directionsRendererId"] = directionsRenderers.length - 1;
        marker["id"] = 1;

        markerArray.push([marker]);
      } else if (markerArray[markerArray.length - 1].length == 0) {
        directionsRenderers.push(new google.maps.DirectionsRenderer);

        marker["directionsRendererId"] = directionsRenderers.length - 1; // this should make index 0

        markerArray[markerArray.length - 1].push(marker);
      } else {
        markerArray[markerArray.length - 1].push(marker);
      }

      // create infowindow on marker when the marker is clicked
      marker.addListener('click', function() {
        populateInfoWindow(this, infowindow, directionsRenderers, waypoints, markerArray);
      });

      // We don't want to waste resources by submitting a directions search with only 1 point
      // We also only want to render the directionsRenderer with new marker (very last one)
      if (waypoints[0].length > 1) {
        requestDirections(
          waypoints[marker.directionsRendererId][0].location,
          waypoints[marker.directionsRendererId][waypoints[marker.directionsRendererId].length - 1].location,
          waypoints[marker.directionsRendererId],
          directionsRenderers[marker.directionsRendererId], // directionsRenderers should match up with the waypoints
          AMorPM,
          false,
          AMorPM == "AM" ? 4 : 2,
          AMorPM == "AM" ? 1 : 10000
        );
      }

    } else {
      console.log('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function removeFromMap(infowindow, AMorPM, directionsRenderers, waypoints, markers) {

  // remove it from the map
  infowindow.marker.setMap(null);

  // if a marker is added and then deleted, we do not want it to show up in the deleted array (just remove from changes.add)
  var markerShouldBeAddedToChanges = true;

  // if the marker is a newly added one, just remove from changes.add
  for (var i=0; i < changes.add.length; i++) {

    if (parseFloat(changes.add[i].coords.lat).toFixed(6) == infowindow.anchor.position.lat().toFixed(6) &&
      parseFloat(changes.add[i].coords.lng).toFixed(6) == infowindow.anchor.position.lng().toFixed(6)) {
      if (changes.add[i].newMarker === true) {
        markerShouldBeAddedToChanges = false;

        removeFromSideBar(changes.add[i].uniqueId);

        changes.add.splice(i, 1);
      }
    }
  }

  // if the marker has been edited and then deleted, only remove it from the changes.edit and don't add to changes.remove
  for (var i=0; i < changes.edit.length; i++) {
    console.log(changes.edit[i].coords.lat);
    if (parseFloat(changes.edit[i].coords.lat).toFixed(6) == infowindow.anchor.position.lat().toFixed(6) &&
      parseFloat(changes.edit[i].coords.lng).toFixed(6) == infowindow.anchor.position.lng().toFixed(6)) {
      changes.edit.splice(i, 1);
      markerShouldBeAddedToChanges = false;
    }
  }

  // If the marker is a previously existing marker, add to changes.remove
  if (markerShouldBeAddedToChanges) {
    if (AMorPM == 'AM') {
      for (var i=0; i < AMroute.length; i++) {

        // same as below with .toFixed because of a floating point arithmetic error
        if (AMroute[i].lat == infowindow.anchor.position.lat().toFixed(6) && AMroute[i].lng == infowindow.anchor.position.lng().toFixed(6)) {

          // add to sidebar
          addToChangesSideBar(AMorPM, "remove", AMaddresses[i]);

          changes.remove.push({
            AMorPM: 'AM',
            coords: {lat: AMroute[i].lat, lng: AMroute[i].lng},
            address: AMaddresses[i],
            newMarker: false
          });
        }
      }
    } else if (AMorPM == 'PM') {
      for (var i=0; i < PMroute.length; i++) {
        if (PMroute[i].lat == infowindow.anchor.position.lat().toFixed(6) && PMroute[i].lng == infowindow.anchor.position.lng().toFixed(6)) {

          // add to sidebar
          addToChangesSideBar(AMorPM, "remove", PMaddresses[i]);

          changes.remove.push({
            AMorPM: 'PM',
            coords: {lat: PMroute[i].lat, lng: PMroute[i].lng},
            address: PMaddresses[i]
          });
        }
      }
    }
  }

  // fill any gaps in the array by reassigning id's in numerical order
  for (var i=0; i < markers.length; i++) {
    for (var j=0; j < markers[i].length; j++) {
      markers[i][j].id = j;
    }
  }

  waypoints[infowindow.anchor.directionsRendererId].splice(infowindow.anchor.id, 1);
  markers[infowindow.anchor.directionsRendererId].splice(infowindow.anchor.id, 1);

  if (infowindow.anchor.id == 0 && infowindow.anchor.directionsRendererId != 0 && waypoints[0].length >= 1) {

    waypoints[infowindow.anchor.directionsRendererId - 1].splice(22, 1);
    markers[infowindow.anchor.directionsRendererId - 1].splice(22, 1);

    for (var i=0; i < 2; i++) {
      requestDirections(
        waypoints[infowindow.anchor.directionsRendererId - i][0].location,
        waypoints[infowindow.anchor.directionsRendererId - i][waypoints[infowindow.anchor.directionsRendererId - i].length - 1].location,
        waypoints[infowindow.anchor.directionsRendererId - i],
        directionsRenderers[infowindow.anchor.directionsRendererId - i],
        infowindow.anchor.AMorPM,
        false,
        infowindow.anchor.AMorPM == "AM" ? 4 : 2,
        infowindow.anchor.AMorPM == "AM" ? 1 : 10000
      );
    }

  } else if (infowindow.anchor.id == 22) {

    waypoints[infowindow.anchor.directionsRendererId + 1].splice(22, 1);
    markers[infowindow.anchor.directionsRendererId + 1].splice(22, 1);

    for (var i=0; i < 2; i++) {
      requestDirections(
        waypoints[infowindow.anchor.directionsRendererId + i][0].location,
        waypoints[infowindow.anchor.directionsRendererId + i][waypoints[infowindow.anchor.directionsRendererId + i].length - 1].location,
        waypoints[infowindow.anchor.directionsRendererId + i],
        directionsRenderers[infowindow.anchor.directionsRendererId + i], // directionsRenderers should match up with the waypoints
        AMorPM,
        false,
        AMorPM == "AM" ? 4 : 2,
        AMorPM == "AM" ? 1 : 10000
      );
    }

  } else {
    requestDirections(
      waypoints[infowindow.anchor.directionsRendererId][0].location,
      waypoints[infowindow.anchor.directionsRendererId][waypoints[infowindow.anchor.directionsRendererId].length - 1].location,
      waypoints[infowindow.anchor.directionsRendererId],
      directionsRenderers[infowindow.anchor.directionsRendererId], // directionsRenderers should match up with the waypoints
      AMorPM,
      false,
      AMorPM == "AM" ? 4 : 2,
      AMorPM == "AM" ? 1 : 10000
    );
  }

  if (waypoints[0].length == 1) {
    alert("It looks like you only have one waypoint. Add some more!");
  } else if (waypoints[0].length == 0) {
    alert("We've detected that you've deleted your entire route. If you want to delete the whole bus, go to the admin page.");
  }
}

function moveMarker(infowindow, waypoints, directionsRenderers, hasUsedAutoComplete) {
  var editedAddress = document.getElementById('newAddress').value;

  // get coords from address
  geocoder.geocode( geocodeOptions(hasUsedAutoComplete, editedAddress), function(results, status) {
    if ( status == google.maps.GeocoderStatus.OK ) {

      var markerShouldBeAddedToChanges = true;

      // loop through all the added markers
      for (var i=0; i < changes.add.coords; i++) {
        // if the marker is a new marker
        if (changes.add[i].coords.lat == infowindow.anchor.position.lat().toFixed(6) &&
          changes.add[i].coords.lng == infowindow.anchor.position.lng().toFixed(6)) {
          if (changes.add[i].newMarker === true) {
            markerShouldBeAddedToChanges = false;

            // instead of adding the edit to changes.edit, just change the entry in changes.add
            changes.add[i].address = editedAddress;
            changes.add[i].coords.lat = results[0].geometry.location.lat();
            changes.add[i].coords.lng = results[0].geometry.location.lng();
          }
        }
      }

      // if marker already exists in changes.edit (don't add another entry to the changes.edit)
      for (var i=0; i < changes.edit.length; i++) {

        if (changes.edit[i].coords.lat.toFixed(6) == infowindow.anchor.position.lat().toFixed(6) &&
          changes.edit[i].coords.lng.toFixed(6) == infowindow.anchor.position.lng().toFixed(6)) {

          markerShouldBeAddedToChanges = false;

          // if the new edited location is the same as the old location, remove from changes.edit
          if (infowindow.anchor.position.lat().toFixed(6) == changes.edit[i].oldCoords.lat) {
            changes.edit.splice(i, 1);
          } else {
            changes.edit[i].newAddress = editedAddress;
            changes.edit[i].coords = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
          }
        }
      }

      // add to list of all moved waypoints for this editing session
      if (markerShouldBeAddedToChanges) {
        changes.edit.push({
          AMorPM: infowindow.marker.AMorPM,
          coords: {lat: results[0].geometry.location.lat().toFixed(6), lng: results[0].geometry.location.lng().toFixed(6)},
          oldCoords: {lat: infowindow.anchor.position.lat().toFixed(6), lng: infowindow.anchor.position.lng().toFixed(6)},
          newAddress: editedAddress,
          oldAddress: infowindow.anchor.address,
          newMarker: false
        });
      }

      if (infowindow.anchor.id != 0 && infowindow.anchor.id != 22) {
        waypoints[infowindow.anchor.directionsRendererId][infowindow.anchor.id] = {
          location: new google.maps.LatLng({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}),
          stopover: false
        };

        requestDirections(
          waypoints[infowindow.anchor.directionsRendererId][0].location,
          waypoints[infowindow.anchor.directionsRendererId][waypoints[infowindow.anchor.directionsRendererId].length-1].location,
          waypoints[infowindow.anchor.directionsRendererId],
          directionsRenderers[infowindow.anchor.directionsRendererId],
          infowindow.anchor.AMorPM,
          false,
          infowindow.anchor.AMorPM == "AM" ? 4 : 2,
          infowindow.anchor.AMorPM == "AM" ? 1 : 10000
        );
      } else if (infowindow.anchor.id == 0) {

        // reroute directions for the current directions renderer and the one before
        for (var i=0; i < 2; i++) {
          waypoints[infowindow.anchor.directionsRendererId - i][infowindow.anchor.id + i * 21] = { // will get ids of 1 and 22
            location: new google.maps.LatLng({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}),
            stopover: false
          };

          requestDirections(
            waypoints[infowindow.anchor.directionsRendererId - i][0].location,
            waypoints[infowindow.anchor.directionsRendererId - i][waypoints[infowindow.anchor.directionsRendererId - i].length-1].location,
            waypoints[infowindow.anchor.directionsRendererId - i],
            directionsRenderers[infowindow.anchor.directionsRendererId - i],
            infowindow.anchor.AMorPM,
            false,
            infowindow.anchor.AMorPM == "AM" ? 4 : 2,
            infowindow.anchor.AMorPM == "AM" ? 1 : 10000
          );
        }
      } else if (infowindow.anchor.id == 22) {

        for (var i=0; i < 2; i++) {
          waypoints[infowindow.anchor.directionsRendererId][infowindow.anchor.id] = {
            location: new google.maps.LatLng({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}),
            stopover: false
          };

          requestDirections(
            waypoints[infowindow.anchor.directionsRendererId + i][0].location,
            waypoints[infowindow.anchor.directionsRendererId + i][waypoints[infowindow.anchor.directionsRendererId + i].length-1].location,
            waypoints[infowindow.anchor.directionsRendererId + i],
            directionsRenderers[infowindow.anchor.directionsRendererId + i],
            infowindow.anchor.AMorPM,
            false,
            infowindow.anchor.AMorPM == "AM" ? 4 : 2,
            infowindow.anchor.AMorPM == "AM" ? 1 : 10000
          );
        }
      }

      infowindow.marker.setPosition(waypoints[infowindow.anchor.directionsRendererId][infowindow.anchor.id].location);

    } else {
      console.log('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// ---------------------------- FRONT END STUFF ------------------------------
function validateInfoAndAddMarker(AMorPM, directionsRenderer, associatedWaypoints, markerArray, hasUsedAutoComplete) {
  if (document.getElementById( 'adminSearch' ).value == "") {
    alert("Please fill in each box (address and AM/PM)");
  } else {
    addMarker(AMorPM, directionsRenderer, associatedWaypoints, markerArray, hasUsedAutoComplete);
  }
}

// Editing suggestions
// document.getElementById('submit').addEventListener('click', function() {
//
//   // get value of selector
//   var addAMorPM = document.getElementById('dropdown').options[document.getElementById('dropdown').selectedIndex].text;
//
//   // get address
//   var address = document.getElementById('adminSearch').value;
//
//   if (addAMorPM == "AM") {
//     var threeMostSimilarAddresses = findMostSimilarStringInArray(address, AMaddresses);
//
//     console.log(threeMostSimilarAddresses);
//
//     for (var i=0; i < AMdirectionsRenderersMarkers.length; i++) {
//       for (var j=0; j < AMdirectionsRenderersMarkers[i].length; j++) {
//         if (AMdirectionsRenderersMarkers[i][j].address == threeMostSimilarAddresses[0]) {
//           google.maps.event.trigger(AMdirectionsRenderersMarkers[i][j], 'click');
//
//           break;
//         }
//       }
//     }
//   } else if (addAMorPM == "PM") {
//     var threeMostSimilarAddresses = findMostSimilarStringInArray(address, AMaddresses);
//   }
//
// });

function findMostSimilarStringInArray(string, array) {

  var threeClosestMatches = [];
  var distancesFromSource = [];

  for (var i=0; i < array.length; i++) {
    distancesFromSource.push(levDist(array[i], string));
  }

  // make a copy of distancesFromSource that we can cut out of
  var distancesFromSourceWithoutNextClosest = distancesFromSource.slice(0);

  // find the 3 closest editing distances
  for (var i=0; i < 3; i++) {

    // we do not want to search through the old values, so we use the array without the closest ones
    var closestDistance = Math.min.apply(null, distancesFromSourceWithoutNextClosest);

    // now that we've found the next closest number, find where it is within distancesFromSource
    var indexInOrig = distancesFromSource.indexOf(closestDistance);
    threeClosestMatches.push(array[indexInOrig]);

    // cut out the closestString from the copy
    var indexInCopy = distancesFromSourceWithoutNextClosest.indexOf(closestDistance);
    distancesFromSourceWithoutNextClosest.splice(indexInCopy, 1);
  }

  return threeClosestMatches;
}

/* Thanks James Westgate: http://stackoverflow.com/a/11958496/6684679
 s = source string, t = target string

 This algorithm finds the shortest number of changes in a string to reach the target string
 - whitespace are counted in this algorithm
 */
var levDist = function(s, t) {
  var d = []; //2d matrix

  // Step 1
  var n = s.length;
  var m = t.length;

  if (n == 0) return m;
  if (m == 0) return n;

  //Create an array of arrays in javascript (a descending loop is quicker)
  for (var i = n; i >= 0; i--) d[i] = [];

  // Step 2
  for (var i = n; i >= 0; i--) d[i][0] = i;
  for (var j = m; j >= 0; j--) d[0][j] = j;

  // Step 3
  for (var i = 1; i <= n; i++) {
    var s_i = s.charAt(i - 1);

    // Step 4
    for (var j = 1; j <= m; j++) {

      //Check the jagged ld total so far
      if (i == j && d[i][j] > 4) return n;

      var t_j = t.charAt(j - 1);
      var cost = (s_i == t_j) ? 0 : 1; // Step 5

      //Calculate the minimum
      var mi = d[i - 1][j] + 1;
      var b = d[i][j - 1] + 1;
      var c = d[i - 1][j - 1] + cost;

      if (b < mi) mi = b;
      if (c < mi) mi = c;

      d[i][j] = mi; // Step 6

      //Damerau transposition
      if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  // Step 7
  return d[n][m];
};

var uniqueSideBarId = 0;

function removeFromSideBar(id) {
  var toDelete = document.getElementById("change_" + id);

  toDelete.parentNode.removeChild(toDelete);
}

function selectAddressOnMap(address, AMorPM) {
  if (AMorPM == "AM") {
    for (var i = 0; i < AMdirectionsRenderersMarkers.length; i++) {
      for (var j = 0; j < AMdirectionsRenderersMarkers[i].length; j++) {
        if (AMdirectionsRenderersMarkers[i][j].address == address) {
          google.maps.event.trigger(AMdirectionsRenderersMarkers[i][j], 'click');

          break;
        }
      }
    }
  } else if (AMorPM == "PM") {
    console.log(PMdirectionsRenderersMarkers.length) // 1
    console.log(PMdirectionsRenderersMarkers[i].length) // 4
    for (var i = 0; i < PMdirectionsRenderersMarkers.length; i++) {
      for (var j = 0; j < PMdirectionsRenderersMarkers[i].length; j++) {
        if (PMdirectionsRenderersMarkers[i][j].address == address) {
          google.maps.event.trigger(PMdirectionsRenderersMarkers[i][j], 'click');

          break;
        }
      }
    }
  }
}

// function addToChangesSideBar(AMorPM, typeofChange, address) {
//
//   uniqueSideBarId += 1;
//
//   // the first time they make a change, we'll pop up the nifty little AM/PM headers
//   if (AMorPM == "AM") {
//     document.getElementById('amHeading').style.display = "inline";
//   } else if (AMorPM == "PM") {
//     document.getElementById('pmHeading').style.display = "inline";
//   }
//
//   var sideBar;
//   if (AMorPM == "AM") {
//     sideBar = document.getElementById('amChanges');
//   } else {
//     sideBar = document.getElementById('pmChanges');
//   }
//
//   if (typeofChange == "remove") {
//     var html = ' \
//       <div id="change_'+ uniqueSideBarId.toString() + '" class="changedAddress"> \
//         <p class="input-group"> \
//           <span class="input-group-btn"> \
//             <button class="btnDel">Deleted:</button> \
//           </span> \
//           <input  type="text" tabindex="-1" class="addressNames" value="' + address + '" readonly> \
//           <span class="input-group-btn"> \
//             <button class="btn btn-default removeChange"><i class="fa fa-times"></i></button> \
//           </span> \
//         </p> \
//       </div>';
//
//     var div = document.createElement('div');
//     div.innerHTML = html;
//
//     sideBar.appendChild(div);
//   } else if (typeofChange == "add") {
//     var html = ' \
//       <div id="change_'+ uniqueSideBarId.toString() + '" class="changedAddress"> \
//         <p class="input-group"> \
//           <span class="input-group-btn"> \
//             <button class="btnAdd">Added:</button> \
//           </span> \
//           <input  type="text" tabindex="-1" class="addressNames" value="' + address + '" readonly> \
//           <span class="input-group-btn"> \
//             <button class="btn btn-default removeChange"><i class="fa fa-times"></i></button> \
//           </span> \
//         </p> \
//       </div>';
//
//     var div = document.createElement('div');
//     div.innerHTML = html;
//
//     sideBar.appendChild(div);
//   }
// }

// For the to lower right buttons
var toggleAM;
var togglePM ;

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

document.getElementById('finalConfirmation').addEventListener('click', function() {
  var proceed = confirm("Are you ready to confirm your changes?");

  if (proceed) {
    // Send an AJAX request to our router
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (xhr.responseText == "err") {
          alert("Sorry! It looks like there's an error with saving your data.");
        } else {
          window.location = window.location.origin + "/admin";
          console.log("success")
        }
      }
    };

    xhr.open('POST', window.location.pathname + '/confirm', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8'); // parse as json on server-side
    // since express will parse the request by default, we have to stringify it
    xhr.send(JSON.stringify(changes));
  }
});

// to understand recursion, please see the top of this file