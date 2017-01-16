// Haversine function finds distance between two coords
function haversineDistance(coords1, coords2, isMiles) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var lat1 = coords1[0];
  var lon1 = coords1[1];

  var lat2 = coords2[0];
  var lon2 = coords2[1];

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  if(isMiles) d /= 1.60934;

  return d;
}

module.exports = function closestDistance(userCoord, route) {
  var distances = [];

  // Push into `distances` the distance from user's address to every waypoint
  for (var i=0; i < route.length; i++) {
    distances.push(haversineDistance(userCoord, [route[i].lat, route[i].lng], true));
  }

  var shortestDist = Math.min.apply(null, distances);

  // Find where `shortestDist` is within distances
  var index = distances.indexOf(shortestDist);

  // the indexes of `distances` should match up with `route`
  // since we know where `shortestDist` is within `distances` we also know where it is within `route`
  return route[index];
};
