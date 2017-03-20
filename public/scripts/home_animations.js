var busFormIsShowing = false;
var deleteStateIsActive = false;

$('document').ready(function() {
  // Menu settings
  setUpMenu();

  // on home page, bind the two elements to toggle the model when submitted
  bindSearch('#search', '#search_button');

  // IF WE WANT TO AUTOCOMPLETE THE EDIT QUERIES
  $("#add-dropdown-menu li a").click(function(){

    $("#AMorPMAdd").html($(this).text() + ' <span class="caret"></span>');
    $("#AMorPMAdd").val($(this).text());
  });

  $("#select-dropdown-menu li a").click(function(){

    $("#AMorPMSelect").html($(this).text() + ' <span class="caret"></span>');
    $("#AMorPMSelect").val($(this).text());
  });

  $('#nav-icon1, .sidenav-background').click(function(){
    $('.main-navigation, #nav-icon1').toggleClass('open');
    $('.sidenav-background').toggle();
  });

  $('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
  });

  $('.antiMobileAlert').delay(4000).hide(1000);

  $('.div-square').click(function(e){
    e.preventDefault();
    $('.busMenuDiv').toggle();
    $('.hiddenForAdmin').show();
  });

  $('#busDropdown').click(function(e){
    e.preventDefault();
    $('.busMenuDiv').toggle();
  });

  $('#deleteBusButton').click(function() {
    if (deleteStateIsActive) {
      deleteStateIsActive = false;

      $('#addBusButton').toggle(function () {
        $("#busDeleteState").toggle();

        $('#deleteBusButton').html('<i class="fa fa-times-circle"></i> Delete');
      });
    } else if (!deleteStateIsActive) {
      deleteStateIsActive = true;

      $('#addBusButton').toggle(function () {
        $("#busDeleteState").toggle();

        $('#deleteBusButton').html('Back');
      });
    }
  });

  $('#addBusButton').click(function() {
    if (busFormIsShowing) {
      busFormIsShowing = false;

      $('#deleteBusButton').toggle(function () {
        $("#addBusForm").toggle();

        $('#addBusButton').html('<i class="fa fa-plus-circle"></i> Add');
      })
    } else if (!busFormIsShowing) {
      busFormIsShowing = true;

      $('#deleteBusButton').toggle(function () {
        $("#addBusForm").toggle();

        $('#addBusButton').html('Back');
      });
    }
  });

  $('.deleteBusOption').hover(function(){
    $( "i", this).toggleClass("fa-bus fa-times-circle");
  }).click(function(e){
    e.preventDefault();
    $('#deleteModal').modal('toggle');
  });

  $('.navbar-form').click(function(e) {
    e.preventDefault();
  });

  $('#modalConfirmation').click(function() {
    $('#infoModal').modal('toggle');
  });

});

function setUpMenu() {
  // Menu settings
  $("#menuToggle, .menu-close").on('click', function(){
    $('#menuToggle, .menu-close').toggleClass('open');
    if ($( window ).width() < 992) {
      $('#scrollDownPanel, #reSearchPanel, #resultsPanel, .resultsNav, #scrollDownPanel, .mobileOpenUpPanel,' +
        ' .mobileOpenDownPanel').toggleClass('lower');
    }
    $('body').toggleClass('body-push-toleft');
    $('#theMenu').toggleClass('menu-open');
    $('#search').toggleClass('hidden-sm');
  });
}

function setUpBackgroundImage() {
  $('wrapsEverything').backgroundImage="url('/img/background.png')";
  $('wrapsEverything').css('zIndex', '10000')
}

// Modal Settings
function bindSearch(inputBox, submitButton) {
  $(inputBox).bind('keypress', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();

      validateAndToggleModal(inputBox)
    }
  });
  $(submitButton).bind('click', function (e) {
    e.preventDefault();

    validateAndToggleModal(inputBox);
  });
}

function validateAndToggleModal(objectToValidate) {


  objectText = $(objectToValidate).val();

  // if it's not empty (trim leading and trailing whitespace)
  if ($.trim(objectText) != "") {
    if (hasNumber(objectText)) {
      if (countWords(objectText) > 1) {
        $('#myModal').modal('toggle');
      } else {
        alert("Please enter at least 2 words in your search")
      }
    } else {
      alert("Please type at least 1 number in the text box")
    }
  } else {
    alert("Enter something in the search box before searching!")
  }
}

function countWords(s){
  s = s.replace(/(^\s*)|(\s*$)/gi,"");
  s = s.replace(/[ ]{2,}/gi," ");
  s = s.replace(/\n /,"\n");

  return s.split(' ').length;
}

function hasNumber(myString) {
  return /\d/.test(myString);
}

function animateMobileResults() {
  $('#scrollDownImg').bind('click', function(e) {
    e.preventDefault();
    $("#mobileTogglePanel").toggleClass("mobileOpenDownPanel mobileOpenUpPanel");
    $("#mobileControls").fadeToggle();
    $("#toggles").fadeToggle();
    if ($('.resultsDesktopNav').is(":visible")) {
      $(".resultsDesktopNav").fadeToggle(function () {
        $(".mobileNav").fadeToggle("fast")
      });
    } else {
      $(".mobileNav").fadeToggle(function () {
        $(".resultsDesktopNav").fadeToggle("fast")
      });
    }
  });
}

var hasReachedResultsPage = false; // once true, we won't keep reloading the results page

// replaces everything in #wrapsEverything with the results UI
function showMapControlsAndUI(amBusNumber, pmBusNumber) {
  if (hasReachedResultsPage) {
    $('#am_bus_number').text(amBusNumber);
    $('#pm_bus_number').text(pmBusNumber);
    $('#mobile_am_bus_number').text(amBusNumber);
    $('#mobile_pm_bus_number').text(pmBusNumber);

    $('#myModal').modal('hide');
  } else {
    $('#myModal').modal('hide');

    $('#myModal').on('hidden.bs.modal', function() {
      hasReachedResultsPage = true;

      $('#wrapsEverything').load('/templates/home_results.html', function () {
        if (amBusNumber != null) {
          $('#am_bus_number').text(amBusNumber);
          $('#mobile_am_bus_number').text(amBusNumber);
        } else {
          $('#am_bus_number').text("Not found");
          $('#mobile_am_bus_number').text("Not found");

          alert("No morning bus was found that serves your school. Perhaps you should call your school (865-984-1212).");
        }

        if (pmBusNumber != null) {
          $('#pm_bus_number').text(pmBusNumber);
          $('#mobile_pm_bus_number').text(pmBusNumber);
        } else {
          $('#pm_bus_number').text("Not found");
          $('#mobile_pm_bus_number').text("Not found");

          alert("No afternoon bus was found that serves your school. Perhaps you should call your school (865-984-1212).");
        }

        // we deleted the other menu, so we're going to re-set it up here
        setUpMenu();

        // The mobile results page has a cool little slide up/down animation, so we'll set that up
        animateMobileResults();

        // change the id to change to new CSS
        $('#googlemaps').attr('id','googlemapsWithRoutes');

        // re-add the autocomplete
        var autoComplete = new google.maps.places.Autocomplete(
          document.getElementById('search')
        );
        var autoCompleteMobile = new google.maps.places.Autocomplete(
          document.getElementById('searchAgain')
        );

        // now on results page, rebind the inputs
        bindSearch('#searchAgain', '#search_button'); // desktop inputs
        bindSearch('#search', '#search_again2'); // mobile inputs
      });

    });
  }
}
