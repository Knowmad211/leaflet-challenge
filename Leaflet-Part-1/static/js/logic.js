const URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
console.log(URL);

const RADIUS_MIN = 5;
const RADIUS_COEF = 5;
const COLOR_DEPTHS = [10, 30, 50, 70, 90];

// Creating the map object
let myMap = L.map("map", {
    center: [38, -98],
    zoom: 5
});
  

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);


function getRadius(feature){
    let magnitude = feature.properties.mag;
    // console.log(magnitude);
    let radiusCalc = magnitude* RADIUS_COEF;
    return Math.max(radiusCalc, RADIUS_MIN);
}

function getColor(depth){
    // let depth = feature.geometry.coordinates[2];
    // console.log(depth);
    if (depth < COLOR_DEPTHS[0]) {
        return "#00ff00";
    }
    else if (depth < COLOR_DEPTHS[1]) {
            return "#c3f948";
    } 
    else if (depth < COLOR_DEPTHS[2]) {
        return "#f9e448";
    }
    else if (depth < COLOR_DEPTHS[3]) {
        return "#f9aa48";
    }
    else if (depth < COLOR_DEPTHS[4]) {
        return "#eb6505";
    }
    else {
        return "#eb051f"
    }
    // return Math.max(radiusCalc, RADIUS_MIN);
}

// Create a point to layer function
function pointToLayerFunc(feature, coord) {
    let circleMarkerOptions = {
        radius: getRadius(feature),
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "black",
        opacity: 1,
        fillOpacity: .6,
        weight: 1
    };
    return L.circleMarker(coord, circleMarkerOptions)
}

// Creating and binding a popup for each feature
function onEachFeatureFunc(feature, layer) {
    console.log(feature);
    const dt= new Date(feature.properties.time)
    let popHTML= `
    <h2>${feature.properties.place}</h2>
<hr>
<p>Magnitude: ${feature.properties.mag}</p>
<p>Depth: ${feature.geometry.coordinates[2]}km</p>
<p>Time: ${dt}</p>
    `;
    layer.bindPopup(popHTML);
}


// Grab the data with d3
  d3.json(URL).then(function (response) {
    // console.log(response);
    let geoJSONOptions = {
        "pointToLayer": pointToLayerFunc,
        "onEachFeature": onEachFeatureFunc
    };
    L.geoJSON(response.features, geoJSONOptions).addTo(myMap);

      
  });


// Create a legend providing context for map data
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

// // Binding a popup to each feature
//     onEachFeature: function(feature, layer) {
//         layer.bindPopup("<strong>" + feature.properties.NAME + "</strong><br /><br />Estimated employed population with children age 6-17: " +
//         feature.properties.DP03_16E + "<br /><br />Estimated Total Income and Benefits for Families: $" + feature.properties.DP03_75E);
//       }
//     }).addTo(myMap);
