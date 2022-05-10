let map, source, attribution, layer, stations;
let url='https://liz-api.herokuapp.com';
function init() {
    attribution = new ol.control.Attribution({
        collapsible: false
    });

    map = new ol.Map({
        controls: ol.control.defaults({ attribution: false }).extend([attribution]),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([77.231291,28.612907]),
            maxZoom: 18,
            zoom: 13
        })
    });

    var style = function (label) {
        return new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: 'teal'
                }),
                stroke: new ol.style.Stroke({
                    color: 'black',
                    width: 2
                }),
                radius: 10
            }),
            text: new ol.style.Text({
                text: label,
                fill: new ol.style.Fill({
                    color: 'black'
                }),
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 2
                }),
                font: 'bold 12px sans-serif',
                offsetY: -16
            })
        });
    };
    marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([77, 28]))
    })

    marker.setStyle(style("DEVICE 1"));

    source = new ol.source.Vector({
        features: [
            marker
        ]
    })

    layer = new ol.layer.Vector({
        source: source
    });

    map.addLayer(layer);

    fetch(`${url}/path/stations`)
        .then(response => response.json())
        .then(data => {
            data.forEach(element => {
                document.getElementById('from').innerHTML += `<option value='${element}'>${element}</option>`
                document.getElementById('to').innerHTML += `<option value='${element}'>${element}</option>`
            });
        });
}

function fetchStations() {
    let from = document.getElementById('from').value;
    let to = document.getElementById('to').value;
    fetch(`${url}/path/${from}/${to}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('stations').innerHTML = " ";
            for (let station in data) {
                document.getElementById('stations').innerHTML += `<li class="station">${station}</li>`;
            }
            startJourney(data);
        });
}

function updateStatistics(startTime) {
    document.getElementById('total-rewards').innerHTML++;
    document.getElementById('total-co2').innerHTML++;
    document.getElementById('reward').innerHTML++;
    document.getElementById('co2').innerHTML++;
    document.getElementById('distance').innerHTML++;
    document.querySelectorAll('.station')[0].classList.replace('station','stationPassed');
}

function resetStatistics() {
    document.getElementById('reward').innerHTML = 0;
    document.getElementById('co2').innerHTML = 0;
    document.getElementById('distance').innerHTML = 0;
}

function startJourney(stations) {

    resetStatistics()

    handleMarker(stations)
}

function handleMarker(stations) {
    let i = 0;
    let startTime=Date.now();
    let keys = Object.keys(stations);
    const timer = setInterval(function () {
        if(i < keys.length-1) {
            updateStatistics(startTime);
            animateMarker([stations[keys[i]].longitude, stations[keys[i]].latitude], [stations[keys[i + 1]].longitude, stations[keys[i + 1]].latitude]);
            map.getView().setCenter(ol.proj.fromLonLat(
                [
                    parseFloat(stations[keys[i]].longitude),
                    parseFloat(stations[keys[i]].latitude)
                ]
            ));
            i++;
        }
    }, 1000)
}

function animateMarker(start, end) {
    updatePosition = function (position, marker) {
        var coordinate;
        coordinate = marker.get('line').getCoordinateAt(position / (1000 / 2));
        marker.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(coordinate)));
        if (position < 1000 / 2) {
            setTimeout(updatePosition, 1, position + 1, marker);
        } else {
            marker.set('animating', false);
        }
    };
    let line = new ol.geom.LineString([start, end]);
    marker.set('line', line);
    if (!marker.get('animating')) {
        marker.set('animating', true);
        updatePosition(1, marker);
    }
}

init()
