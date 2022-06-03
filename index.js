let map, source, attribution, layer, stations;
let url = 'https://liz-api.herokuapp.com';
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
            center: ol.proj.fromLonLat([77.231291, 28.612907]),
            maxZoom: 18,
            zoom: 10
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

    let gpx = ['BLUE-I', 'BLUE-II', 'BLUE-III', 'GRAY', 'GREEN', 'MAGENTA-I', 'MAGENTA-II', 'ORANGE', 'PINK', 'RED', 'VOILET', 'YELLOW'];

    for (let i = 0; i < gpx.length; i++) {
        var geojson = new ol.layer.Vector({
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: `./gpx/${gpx[i]}.json`
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke(({
                    width: 3,
                    color: gpx[i].split('-')[0].toLowerCase()
                }))
            })
        })

        map.addLayer(geojson)
    }

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
    document.querySelectorAll('.station')[0].classList.replace('station', 'stationPassed');
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
    let i = 1;
    let startTime = Date.now();
    let keys = Object.keys(stations);
    const timer = setInterval(function () {
        if (i < keys.length) {
            updateStatistics(startTime);
            animateMarker([stations[keys[i - 1]].longitude, stations[keys[i - 1]].latitude], [stations[keys[i]].longitude, stations[keys[i]].latitude]);
            show('station crossed',keys[i])
            map.getView().setCenter(ol.proj.fromLonLat(
                [
                    parseFloat(stations[keys[i - 1]].longitude),
                    parseFloat(stations[keys[i - 1]].latitude)
                ]
            ));
            i++;
        }
    }, 1000);
}

function animateMarker(start, end) {
    updatePosition = function (position, marker) {
        var coordinate;
        coordinate = marker.get('line').getCoordinateAt(position / (1000 / 2));
        marker.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(coordinate)));
        if (position < 1000 / 2) {
            setTimeout(updatePosition, 2, position + 1, marker);
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


function show(title,text){
   let toast1=toast.create({
       title: title,
       text: text
    });

    setTimeout(toast1.hide,5000);
    
};
  
  (function(root, factory) {
    try {
      // commonjs
      if (typeof exports === 'object') {
        module.exports = factory();
      // global
      } else {
        root.toast = factory();
      }
    } catch(error) {
      console.log('Isomorphic compatibility is not supported at this time for toast.')
    }
  })(this, function() {
  
    // We need DOM to be ready
    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('DOMContentLoaded', init);
    }
  
    // Create toast object
    toast = {
      // In case toast creation is attempted before dom has finished loading!
      create: function() {
        console.error([
          'DOM has not finished loading.',
          '\tInvoke create method when DOM\s readyState is complete'
        ].join('\n'))
      }
    };
    var autoincrement = 0;
  
    // Initialize library
    function init() {
      // Toast container
      var container = document.createElement('div');
      container.id = 'cooltoast-container';
      document.body.appendChild(container);
  
      // @Override
      // Replace create method when DOM has finished loading
      toast.create = function(options) {
        var toast = document.createElement('div');
        toast.id = ++autoincrement;
        toast.id = 'toast-' + toast.id;
        toast.className = 'cooltoast-toast';
  
        // title
        if (options.title) {
          var h4 = document.createElement('h4');
          h4.className = 'cooltoast-title';
          h4.innerHTML = options.title;
          toast.appendChild(h4);
        }
  
        // text
        if (options.text) {
          var p = document.createElement('p');
          p.className = 'cooltoast-text';
          p.innerHTML = options.text;
          toast.appendChild(p);
        }
  
        // icon
        if (options.icon) {
          var img = document.createElement('img');
          img.src = options.icon;
          img.className = 'cooltoast-icon';
          toast.appendChild(img);
        }
  
        // click callback
        if (typeof options.callback === 'function') {
          toast.addEventListener('click', options.callback);
        }
  
        // toast api
        toast.hide = function() {
          toast.className += ' cooltoast-fadeOut';
          toast.addEventListener('animationend', removeToast, false);
        };
  
        // autohide
        if (options.timeout) {
          setTimeout(toast.hide, options.timeout);
        } 
        // else setTimeout(toast.hide, 2000);
  
        if (options.type) {
          toast.className += ' cooltoast-' + options.type;
        }
  
        toast.addEventListener('click', toast.hide);
  
  
        function removeToast() {
          document.getElementById('cooltoast-container').removeChild(toast);
        }
  
        document.getElementById('cooltoast-container').appendChild(toast);
        return toast;
  
      }
    }
  
    return toast;
  
  });