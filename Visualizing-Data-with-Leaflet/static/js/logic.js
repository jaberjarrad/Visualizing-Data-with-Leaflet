// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

//create variable for overlay layer
var earthquakes = new L.LayerGroup();

// Create the map object with options
var map = L.map("map", {
  center: [40.10, -97.75],
  zoom: 5,
  layers: [lightmap, earthquakes]
});

lightmap.addTo(map);


// Create a baseMaps object to hold the lightmap layer
var baseMaps = {
  "Light Map": lightmap
};

// Create overlay object to hold our overlay layer
var overlayMaps = {
  Earthquakes: earthquakes
};

//link to geo json data
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(link, function(data) {

  console.log(data.features);

  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }
 
  // color of the markers
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }
 
  // define the radius of earthquake based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
 
    return magnitude * 3;
  }
 
  // add Geo JSON layer to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(earthquakes);

  earthquakes.addTo(map);

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [0, 1, 2, 3, 4, 5];
    
 
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  
  legend.addTo(map);

});
