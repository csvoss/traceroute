
var map;

$(document).ready(function(){

    $(function() {
        $("#urlbox").keypress(function (e) {
            if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
                $('#submit').click();
                return false;
            } else {
                return true;
            }
        });
    });

    function addInfoWindow(marker, message, z, open) {
        var info = message;
        var toggled = false;
        var infoWindow = new google.maps.InfoWindow({
            content: message,
            zIndex: z
        });
        google.maps.event.addListener(marker, 'click', function () {
          if (!toggled) {
            infoWindow.open(map, marker);
            toggled=true;
          } else {
            infoWindow.close();
            toggled=false;
          }
        });
        google.maps.event.addListener(marker, 'mouseover', function () {
          if (!toggled) {
            infoWindow.open(map, marker);
          }
        });
        google.maps.event.addListener(marker, 'mouseout', function () {
          if (!toggled) {
            infoWindow.close();
          }
        });
        google.maps.event.addListener(infoWindow, 'closeclick', function () {
          toggled=false;
        });
        if (open) {
            infoWindow.open(map, marker);
            toggled=true;
        }
    }

    function showLoadGif() {
        $("#loading").css("display", "inline");
    }

    function hideLoadGif() {
        $("#loading").css("display", "none");
    }

    var markers = [];
    var polylines = [];

    function changeGoogleMap(data) {
        //Delete all old markers and lines
        for (var i=0; i<markers.length; i++) {
            markers[i].setMap(null);
        }
        for (var i=0; i<polylines.length; i++) {
            polylines[i].setMap(null);
        }

        markers = [];
        polylines = [];

        var oldlatlng = 0;
        for (var i=data.length-1; i>=0; i--) {

            var latlng = new google.maps.LatLng(data[i][0], data[i][1]);

            //console.log("Adding lat: "+data[i][0]);
            //console.log("Adding long: "+data[i][0]);
            var marker = new google.maps.Marker({
                position: latlng,
                map: map,
                title: data[i][3],
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    strokeColor: "cyan",
                    scale: 7,
                    strokeOpacity: 1.0
                },
            });

            addInfoWindow(marker, data[i][2], (data.length-i), (i==data.length-1));
            markers.push(marker);

            if (oldlatlng != 0) {
                var polyline = new google.maps.Polyline({
                    path: [oldlatlng, latlng],
                    strokeColor: "#009999",
                    strokeOpacity: 0.7,
                    strokeWeight: 7,
                    geodesic: true
                });
                polylines.push(polyline);
                polyline.setMap(map);
            }

            oldlatlng = latlng;

        }
    }


    function error_message(url_text) {
	$("#errorbox").text("URL \""+url_text+"\" didn't work. Try another.");
    }
    function reset_error() {
	$("#errorbox").text("");
    }

    //URL submit ajax request
    $("#submit").click(function() {
	reset_error();
        showLoadGif();
        $.ajax({
            type: "GET",
            url: "/traceroute/request/",
            data: {"val":($("#urlbox").val())},
            success: function(data) {
                dataObject = jQuery.parseJSON(data);
		if (dataObject == "") {
		    error_message($("#urlbox").val());
		}
                changeGoogleMap(dataObject);
                //$("#urlbox").val(data); //uncomment for debug mode
                hideLoadGif();
            },
	    error: function(data) {
		error_message($("#urlbox").val());
	    }
        });
    });

    //Main
    //$("#urlbox").val("google.com");
    hideLoadGif();
    
});





//Below this point: Only Google Maps stuff

function initialize() {
    var mapOptions = {
        backgroundColor: "#001117",
        center: new google.maps.LatLng(42.36690, -71.10610),
        zoom: 4,
        minZoom: 3,
        maxZoom: 7,
        streetViewControl: false,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
              {
                stylers: [
                  { hue: "#ffffff" },
                  { saturation: -100 }
                ]
              },{
                featureType: "road",
                elementType: "geometry",
                stylers: [
                  { hue: "#34EB55" }, 
                  { saturation: 50 },
                  { lightness: -80 },
                  { visibility: "simplified" }
                ]
              },{
                featureType: "road",
                elementType: "labels",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "transit",
                elementType: "all",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "administrative.land_parcel",
                elementType: "all",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "administrative.locality",
                elementType: "all",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "administrative.neighborhood",
                elementType: "all",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "poi",
                elementType: "all",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "administrative",
                elementType: "geometry.stroke",
                stylers: [
                  { hue: "#34EB55" }, 
                  { saturation: 100 },
                  { lightness: -40 }
                ]
              },{
                featureType: "administrative.country",
                elementType: "geometry.stroke",
                stylers: [
                  { hue: "#34EB55" }, 
                  { saturation: 100 },
                  { lightness: -30 }
                ]
              },{
                featureType: "administrative.province",
                elementType: "geometry.stroke",
                stylers: [
                  { hue: "#34EB55" }, 
                  { saturation: 100 },
                  { lightness: -50 }
                ]
              },{
                featureType: "administrative.neighborhood",
                elementType: "geometry.stroke",
                stylers: [
                  { hue: "#34EB55" }, 
                  { saturation: 100 },
                  { lightness: -50 }
                ]
              },{
                featureType: "administrative.locality",
                elementType: "geometry.stroke",
                stylers: [
                  { hue: "#34EB55" }, 
                  { saturation: 100 },
                  { lightness: -50 }
                ]
              },{
                featureType: "administrative.land_parcel",
                elementType: "geometry.stroke",
                stylers: [
                  { hue: "#34EB55" }, 
                  { saturation: 100 },
                  { lightness: -50 }
                ]
              },{
                featureType: "water",
                elementType: "geometry.fill",
                stylers: [
                  { hue: "#001117" }, 
                  { saturation: 100 },
                  { lightness: -94.5 }
                ]
              },{
                featureType: "water",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
              },{
                featureType: "landscape",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
              },{
                featureType: "landscape",
                elementType: "geometry.fill",
                stylers: [
                  { hue: "#FFFFFF" }, 
                  { saturation: 0 },
                  { lightness: -100 }
                ]
              },{
                featureType: "administrative",
                elementType: "geometry.fill",
                stylers: [
                  { hue: "#FFFFFF" }, 
                  { saturation: 0 },
                  { lightness: -100 }
                ]
              },{
                featureType: "administrative",
                elementType: "labels.text.stroke",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "administrative",
                elementType: "labels.text.fill",
                stylers: [
                  { visibility: "off" }
                ]
              },{
                featureType: "administrative.country",
                elementType: "labels.text.stroke",
                stylers: [
                  { hue: "#FFFFFF" }, 
                  { saturation: 0 },
                  { lightness: -100 },
                  { visibility: "on" }
                ]
              },{
                featureType: "administrative.country",
                elementType: "labels.text.fill",
                stylers: [
                  { hue: "#FFFFFF" }, 
                  { saturation: 0 },
                  { lightness: 80 },
                  { visibility: "on" }
                ]
              },{
                featureType: "administrative.province",
                elementType: "labels.text.stroke",
                stylers: [
                  { hue: "#FFFFFF" }, 
                  { saturation: 0 },
                  { lightness: -100 },
                  { visibility: "on" }
                ]
              },{
                featureType: "administrative.province",
                elementType: "labels.text.fill",
                stylers: [
                  { hue: "#FFFFFF" }, 
                  { saturation: 0 },
                  { lightness: 50 },
                  { visibility: "on" }
                ]
              }
        ]
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
                              mapOptions);

}


google.maps.event.addDomListener(window, 'load', initialize);
