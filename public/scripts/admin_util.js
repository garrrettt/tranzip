// schoolsInSystem and school are variables stored in the ejs since they are passed in from the server

var busSwitchesAtASchool = false;

function busDoesSwitchAtASchool() {
  busSwitchesAtASchool = true;

  var selection = document.getElementById('selectWhatSchoolsBusSwitchesAt');

  selection.style.display = "inline";

  hideyesno()
}

function resetAddBusForm() {
  busSwitchesAtASchool = false;

  var selection = document.getElementById('selectWhatSchoolsBusSwitchesAt');
  selection.style.display = "none";

  var yesorno = document.getElementById('busSwitchesAtASchool');

  yesorno.style.display = "inline";
}

function identicalBusNumbers() {
  return bus_numbers.indexOf(parseInt(document.getElementById('busnumber').value)) > -1
}

function generateBus() {
  if (!identicalBusNumbers()) {
    var bus = {
      bus_number: null,
      am: {
        serves: [],
        changes_at_school: []
      },
      pm: {
        serves: [],
        changes_at_school: []
      }
    };

    bus.bus_number = parseInt(document.getElementById('busnumber').value);
    var servesCheckboxesAM = document.getElementsByClassName('servesAM');
    var servesCheckboxesPM = document.getElementsByClassName('servesPM');

    for (var i = 0; i < servesCheckboxesAM.length; i++) {
      if (servesCheckboxesAM[i].checked) {
        bus.pm.serves.push(schoolsInSystem[i]);
      }
    }

    for (var i = 0; i < servesCheckboxesPM.length; i++) {
      if (servesCheckboxesPM[i].checked) {
        bus.am.serves.push(schoolsInSystem[i]);
      }
    }

    if (busSwitchesAtASchool) {
      var studentsGoingTo = document.getElementById('studentsGoingTo').options[document.getElementById('studentsGoingTo').selectedIndex].text;
      var changeAt = document.getElementById('changeAt').options[document.getElementById('changeAt').selectedIndex].text;
      var timeOfDay = document.getElementById('timeOfDay').options[document.getElementById('timeOfDay').selectedIndex].text;

      if (timeOfDay == 'Morning') {
        bus.am.changes_at_school.push({
          students_going_to: studentsGoingTo,
          change_at: changeAt
        });
      } else if (timeOfDay == 'Afternoon') {
        bus.pm.changes_at_school.push({
          students_going_to: studentsGoingTo,
          change_at: changeAt
        })
      }
    }

    console.log(bus);
    var proceed = confirm("Are you ready to confirm your changes?");

    if (proceed) {
      // Send an AJAX request to our router
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          if (xhr.responseText == "err") {
            alert("Sorry, it looks like there's an error! That's all we know!");
            console.log(xhr.responseText)
          } else {
            window.location = window.location.href;
            console.log(xhr.responseText);
          }
        }
      };

      xhr.open('POST', window.location.pathname + '/newbus', true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8'); // parse as json on server-side
      // since express will parse the request by default, we have to stringify it
      xhr.send(JSON.stringify(bus));
    }
  } else {
    alert('That bus number already exists. Please edit the existing bus, or change this bus\'s number.');
  }
}

function hideyesno() {
  var yesorno = document.getElementById('busSwitchesAtASchool');

  yesorno.style.display = "none";
}

function addRow() {
  var div = document.createElement('div');
  div.setAttribute('class', 'someClass'); // just for demonstration (when we merge the front-end)
  div.innerHTML = document.getElementById('changesAtAnotherSchool').innerHTML;
  document.getElementById('changesAtAnotherSchoolWrapper').appendChild(div);

  var br = document.createElement('br');
  document.getElementById('changesAtAnotherSchoolWrapper').appendChild(br)
}

var requestDeleteFor;

function requestDelete(bus_number) {
  requestDeleteFor = bus_number;
}

function removeBus() {

  var busNumberTyped = document.getElementById('deletionConfirmation').value;

  // make sure what they typed in equals the bus they selected
  if (parseInt(busNumberTyped) == requestDeleteFor) {
    // Send an AJAX request to our router
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        if (xhr.responseText == "err") {
          alert("Sorry, it looks like there's an error! That's all we know!");
        } else {
          window.location = window.location.origin + "/admin/" + school;
        }
      }
    };

    xhr.open('POST', window.location.pathname + "/" + requestDeleteFor, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8'); // parse as json on server-side
    // since express will parse the request by default, we have to stringify it
    xhr.send();
  } else {
    alert("That bus number does not match.")
  }
}