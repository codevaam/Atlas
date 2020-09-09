function initialize() {
    var score = parseInt(localStorage.getItem('score'));
    document.getElementById('number').innerText = score;
    const c = { lat: 0, lng: 0 };
    const map = new google.maps.Map(document.getElementById("map"), {
        center: c,
        zoom: 1,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
    });

    // add marker on click
    google.maps.event.addListener(map, 'click', function (event) {
        updateMarker(event.latLng, map);
        loc = event.latLng.toString().slice(1, -1).split(',')
        localStorage.setItem('gLat', loc[0]);
        localStorage.setItem('gLng', loc[1]);
    });
    var marker;
    function updateMarker(location, map) {
        if (marker) {
            marker.setPosition(location);
        } else {
            marker = new google.maps.Marker({
                position: location,
                map: map
            });
        }
    }



    function distance(lat1, lon1, lat2, lon2) {
        console.log(lat1, lon1, lat2, lon2)
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            dist = dist * 1.609344
            return dist;
        }
    }

    const nextBtn = document.getElementById('next')
    nextBtn.addEventListener('click', function () {
        var questionNo = parseInt(localStorage.getItem('questionNo'))
        console.log(questionNo);
        if (questionNo == 4) {
            window.location.href = "/gameOver.html"
            console.log('ran')
        }
        else {
            location.reload();
        }
    })

    const guessBtn = document.getElementById('guess')
    guessBtn.addEventListener('click', function () {
        var gLat = localStorage.getItem('gLat')
        var gLng = localStorage.getItem('gLng')
        var d = distance(gLat, gLng, locations[questionNo].lat, locations[questionNo].lng);

        marker = new google.maps.Marker({
            position: { lat: locations[questionNo].lat, lng: locations[questionNo].lng },
            map: map
        });

        console.log(typeof (gLat))

        var lineCoordinates = [
            { lat: parseFloat(gLat), lng: parseFloat(gLng) },
            { lat: locations[questionNo].lat, lng: locations[questionNo].lng }
        ]
        var linePath = new google.maps.Polyline({
            path: lineCoordinates,
            geodesic: true,
            strokeColor: '#FF0000'
        });

        linePath.setMap(map);
        console.log(d);
        document.getElementById('map').style.width = "98%";
        document.getElementById('map').style.height = "95%";
        var score = parseInt(localStorage.getItem('score'));
        var points = parseInt((20000 - d) / 250);

        console.log(points)
        score += points
        document.getElementById('number').innerText = score

        localStorage.setItem('score', score)
        localStorage.setItem('questionNo', ++questionNo);

    })

    var locations = JSON.parse(localStorage.getItem('cities'))
    var questionNo = localStorage.getItem('questionNo')


    const StreetViewService = new google.maps.StreetViewService()
    var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), {
        pov: {
            heading: 165,
            pitch: 0
        },
        disableDefaultUI: true,
        linksControl: true,
        panControl: false,
        showRoadLabels: false,
        streetViewControl: true,
        motionTracking: false,
        motionTrackingControl: false,
    });
    const request = {
        location: { lat: locations[questionNo].lat, lng: locations[questionNo].lng },
        preference: google.maps.StreetViewPreference.BEST,
        source: google.maps.StreetViewSource.DEFAULT
    }
    const callback = (data, status) => {
        if (status === google.maps.StreetViewStatus.OK) {
            panorama.setPano(data.location.pano)
            panorama.setVisible(true)
        }
        else {
            console.log('no street view found')
            localStorage.setItem('questionNo', ++questionNo);
            const request = {
                location: { lat: locations[questionNo].lat, lng: locations[questionNo].lng },
                preference: google.maps.StreetViewPreference.BEST,
                source: google.maps.StreetViewSource.DEFAULT
            }
            StreetViewService.getPanorama(request, callback);
        }
    }
    StreetViewService.getPanorama(request, callback);
}