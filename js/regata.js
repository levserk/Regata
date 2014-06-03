var map, mapOptions = {
    center: new google.maps.LatLng(20.291, 153.027),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    navigationControl: false,
    mapTypeControl: false,
    scaleControl: false,
    draggable: false,
    styles: [
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
        ,
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
                { "visibility": "off" }
            ]
        }
    ]
};
var minDelta = 30000;
var regata;
var angle = 0, sin = Math.sin(angle*Math.PI/180), cos = Math.cos(angle*Math.PI/180)
    ,divh = (Math.abs(sin) * $("#map-canvas").height() + Math.abs(cos) * $("#map-canvas").width())*0.5,
     maph = 700;

$(document).ready(ready);

function ready() {
    $("#map-canvas").hide();
}

function loadTrack(tr) {
    $("#map-canvas").show();
    $(".button").hide();
    var race = races[tr];

    _.each(race.stracks, function (element, index, list) {
        $.ajax({url: element.url, async: false}).done(function (strack) {
            element.spoints = strack.split('\n').slice(6);
        });
    });

    regata = new Regata(race);
}


function Regata(_race) {
    var tracks;
    var minLat, maxLat, minLon, maxLon, ts, te, deltaTime, timePerSec = 40, time;
    var playInterval, speedInterval, fplaying=false, frewind=false, floaded=false, fzoom=false, fdrag=false;
    var oldCenter, oPos;
    init(_race);

    var overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(map);

    function init(race) {
        var track;
        tracks = [];

        _.each(race.stracks, function (element, index, list) {
            track = new Track(element);
            track.marker = {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 3,
                fillOpacity: 1,
                fillColor: track.color,
                strokeColor: track.color
            };
            tracks.push(track);
            if (maxLat == null || maxLat < track.maxLat) maxLat = track.maxLat;
            if (maxLon == null || maxLon < track.maxLon) maxLon = track.maxLon;
            if (minLat == null || minLat > track.minLat) minLat = track.minLat;
            if (minLon == null || minLon > track.minLon) minLon = track.minLon;
            if (ts == null || ts > track.ts) ts = track.ts;
            if (te == null || te < track.te) te = track.te;
        });

        mapOptions.center = new google.maps.LatLng(minLat + (maxLat - minLat) * 0.5, minLon + (maxLon - minLon) * 0.5);
        console.log(tracks);
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        _.each(race.markers, function (element, index, list) {
            var circle = new google.maps.Circle({
                'center': element,
                'clickable': false,
                'fillColor': "#FFF556",
                fillOpacity: 1,
                strokeWeight: 1,
                'map': map,
                'radius': 16,
                'strokeColor': '#FFF556'
            });
        });
        var startLine = new google.maps.Polyline({
            path: race.startLine,
            strokeColor: "#FFF556",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: map
        });
        _.each(tracks, function (track, index, list) {
            track.line = new google.maps.Polyline({
                path: track.coords,
                icons: [
                    {
                        icon: track.marker,
                        offset: '0%'
                    }
                ],
                strokeColor: track.color,
                strokeOpacity: 1.0,
                strokeWeight: 0.45,
                map: map
            });
        });

        bindEvents();

        $('#bt-pause').hide();
        $('#panel').show();
        $('#bar').attr('max', te);
        $('#bar').attr('min', ts);
        $('#s-total-time').html(formatGameTimeMS(te - ts));
        $('#s-speed').html('x' + timePerSec);
        $('#player-panel').show();

        showPlayers(_race);

        time=ts;

        //$('#google-map').hide();
    }

    function mapLoaded(){
        floaded = true;
        if (_race.hasOwnProperty('angle')) rotate(_race.angle);
        console.log(map.getProjection().fromPointToLatLng(new google.maps.Point(1000, 1000)));
        console.log(map.getProjection().fromLatLngToPoint(new google.maps.LatLng(20.291, 153.027)));
    }

    function play() {
        if ((!time || time == te) && !frewind) time = ts;
        deltaTime = new Date();
        playInterval = setInterval(frame, 20);
        fplaying = true;
        console.log(time, te, te - time, deltaTime);
        $('#bt-play').css('background-position', '-155px 7px');
    }

    function pause() {
        fplaying = false;
        clearInterval(playInterval);
        $('#bt-play').css('background-position', '-30px 7px');
    }

    function stop() {
        fplaying = false;
        clearInterval(playInterval);
        $('#bar').val(time);
        time = ts;
        _.each(tracks, function (track, index, list) {
            icon = track.line.get('icons');
            icon[0].offset = '100%';
            track.line.set('icons', icon);
        });
        $('#bt-play').css('background-position', '-30px 7px');
    }

    function frame() {
        var t = new Date(), icon;
        time += (t - deltaTime) * timePerSec;
        if (time>te) time = te;
        if (time < ts) time = ts;
        $('#bar').val(time);
        deltaTime = t;
        animate();
        if (time >= te) {
            stop();
            time = te;
            return false;
        }
    }

    function animate() {
        _.each(tracks, function (track, index, list) {
            icon = track.line.get('icons');
            icon[0].offset = track.caclDistance(time) / track.distance * 100 + '%';
            track.line.set('icons', icon);
        });
        $('#s-cur-time').html(formatGameTimeMS(time - ts));
    }

    function bindEvents() {
        var defSpeed, _fplaing;
        $('#bt-prev').mousedown(function () {
            if (!time || time==ts) return;
                defSpeed = timePerSec;
                timePerSec = -100;
                frewind = true;
                _fplaing = fplaying;
                if (!fplaying) play();
        }).mouseup(function () {
                timePerSec = defSpeed;
                if (!_fplaing) pause();
                frewind = false;
            });

        $('#bt-next').mousedown(function () {
                if (time>=te) return;
                defSpeed = timePerSec;
                timePerSec = 100;
                frewind = true;
                _fplaing = fplaying;
                if (!fplaying) play();
        }).mouseup(function () {
                timePerSec = defSpeed;
                frewind = false;
                if (!_fplaing) pause();
            });

        $('#bt-play, #bt-pause').click(function () {
            if (fplaying) {
                pause();
            } else {
                play();
            }
        });
        $('#bar').on('input', function () {
            //if (fplaying) pause();
            time = parseInt($(this).val());
            animate();

        });
        $('#bt-down').click(function () {
            //if (timePerSec > 0)timePerSec--;
            $('#s-speed').html('x' + timePerSec);
        });

        $('#bt-up').click(function () {
            //if (timePerSec < 300)timePerSec++;
            $('#s-speed').html('x' + timePerSec);
        });
        $('#bt-down').mousedown(function () {
            clearInterval(speedInterval);
            speedInterval = setInterval(function () {
                if (timePerSec > 1)timePerSec--;
                else clearInterval(speedInterval);
                $('#s-speed').html('x' + timePerSec);
            }, 50);
        });

        $('#bt-up').mousedown(function () {
            clearInterval(speedInterval);
            speedInterval = setInterval(function () {
                if (timePerSec < 300)timePerSec++;
                else clearInterval(speedInterval);
                $('#s-speed').html('x' + timePerSec);
            }, 50);
        });
        $('#bt-down, #bt-up').mouseup(function () {
            clearInterval(speedInterval);
        });

        google.maps.event.addListener( map, 'idle', function() {
           if (!floaded) mapLoaded();
           //if (fzoom) centerAfterZoom();
        });
    }

    function centerAfterZoom(){
        var nPos = getLatLng(e.clientX, e.clientY);
        var dk = oPos.k - nPos.k;
        var dA = oPos.A - nPos.A;
        map.setCenter(new google.maps.LatLng(oldCenter.k-dk, oldCenter.A-dA));
    }

    function showPlayers(race) {
        $('#s-title').html(race.title);
        var phtml = "";
        _.each(race.stracks, function (track, index, list) {
            phtml += "<div style='width: 100%; height: 20px;'>";
            phtml += '<div class="circle" style="border: 2px solid ' + track.color + '; background:' + track.color + '">&nbsp;</div>';
            phtml += '&nbsp;' + track.lab + " &nbsp;&nbsp;(" + track.position + " место)";
            phtml += "</div>";
        });
        $('#player-table').html(phtml);
    }

    function rotate(_angle){
        angle = _angle;
        var tr = 'rotate(-'+_angle+'deg)';
        $("#map-canvas").css({
            '-webkit-transform': tr,
            '-moz-transform': tr
        });
        sin = Math.sin(angle*Math.PI/180);
        cos = Math.cos(angle*Math.PI/180);
        divh = (Math.abs(sin) * $("#map-canvas").height() + Math.abs(cos) * $("#map-canvas").width())*0.5;
    }

    function getLatLng(mx,my){
        mx -= $("#map-canvas").offset().left;
        my -= $("#map-canvas").offset().top;
        //var x = (((mx-divh) * cos) - ((my-divh) * sin)) + maph;
        //var y = (((mx-divh) * sin) + ((my-divh) * cos)) + maph;
        return overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point((((mx-divh) * cos) - ((my-divh) * sin)) + maph, (((mx-divh) * sin) + ((my-divh) * cos)) + maph));
    }

    $("#map-canvas").on('mousemove',function(e){
        var nPos = getLatLng(e.clientX, e.clientY);
        var mx = e.clientX - $("#map-canvas").offset().left;
        var my = e.clientY - $("#map-canvas").offset().top;
        var x = (((mx-divh) * cos) - ((my-divh) * sin)) + maph;
        var y = (((mx-divh) * sin) + ((my-divh) * cos)) + maph;
        if(fdrag) {
            console.log(xx,yy,x,y);
            map.panBy(xx-x, yy-y);
            xx=x; yy=y;
        }
    });
    $("#map-canvas").on('mouseup',function(e){
        fdrag=false;
    });
    $("#map-canvas").on('mousedown',function(e){
        fdrag = true;
        var mx = e.clientX - $("#map-canvas").offset().left;
        var my = e.clientY - $("#map-canvas").offset().top;
        xx = (((mx-divh) * cos) - ((my-divh) * sin)) + maph;
        yy = (((mx-divh) * sin) + ((my-divh) * cos)) + maph;
    });
    $("#map-canvas").on('mousewheel DOMMouseScroll',function(e){
        e.clientX = e.clientX || e.originalEvent.clientX;
        e.clientY = e.clientY || e.originalEvent.clientY;
        var delta = e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0 ? 1 : -1;
        var zoom = map.getZoom();
        var oPot = getLatLng(e.clientX, e.clientY);
        if (delta>0){
            map.setZoom(++zoom);
        }
        else if (zoom>14){
            map.setCenter(getLatLng(e.clientX, e.clientY));
            map.setZoom(--zoom);
        }
        var nPot = overlay.getProjection().fromLatLngToContainerPixel(oPot);
        var mx = e.clientX - $("#map-canvas").offset().left;
        var my = e.clientY - $("#map-canvas").offset().top;
        var x = (((mx-divh) * cos) - ((my-divh) * sin)) + maph;
        var y = (((mx-divh) * sin) + ((my-divh) * cos)) + maph;
        map.panBy(nPot.x-x, nPot.y-y);
    });
}


// ------------------ Classes ---------------------

var Point = function (_t, _lat, _lon) {
    this.time = _t;
    this.lat = _lat;
    this.lon = _lon;
    this.LatLng = new google.maps.LatLng(_lat, _lon);
    this.distance = 0;
    this.totalDistance = 0;
    this.calcDistance = function (point) {
        if (!point) return;
        that.distance = Math.sqrt(Math.pow(that.lat - point.lat, 2) + Math.pow(that.lon - point.lon, 2));
        that.totalDistance = point.totalDistance + that.distance;
    };
    var that = this;
};

var Track = function (strack) {
    this.points = [];
    this.coords = [];
    this.minLat = null;
    this.maxLat = null;
    this.minLon = null;
    this.maxLon = null;
    this.distance = 0;
    this.ts = 0;
    this.te = 0;
    this.timezone = strack.timezone;
    this.color = strack.color;
    this.label = strack.lab;
    this.delta = 0;
    var that = this;

    var spoint, point, prev, time, oldTime = 0, lat, lon;
    if (strack.hasOwnProperty('delta'))that.delta = strack.delta;
    _.each(strack.spoints, function (element, index, list) {
        spoint = element.split(',');
        if (spoint.length < 6) return;
        time = moment(spoint[5] + ' ' + spoint[6].replace(/\n|\r/g, "") + ' +' + strack.timezone, "DD.MM.YYYY HH:mm:ss Z").valueOf();
        time += that.delta*1000;
        if (!time > 0 /*|| time-oldTime<minDelta*/) return;
        if (that.ts == 0)that.ts = time;
        oldTime = time;

        lat = parseFloat(spoint[0]);
        lon = parseFloat(spoint[1]);

        if (that.maxLat == null || that.maxLat < lat) that.maxLat = lat;
        if (that.maxLon == null || that.maxLon < lon) that.maxLon = lon;
        if (that.minLat == null || that.minLat > lat) that.minLat = lat;
        if (that.minLon == null || that.minLon > lon) that.minLon = lon;
        point = new Point(time, lat, lon);
        point.calcDistance(prev);
        that.points.push(point);
        that.coords.push(point.LatLng);
        prev = point;
        that.distance = point.totalDistance;
        that.te = time;
    });

    that.caclDistance = function (time) {
        if (time >= that.te) return that.distance;
        if (time <= that.ts) return 0;
        var result = 0;
        _.each(that.points, function (point, index, list) {
            if (result) return;
            if (index == list.length - 1) {
                result = point.totalDistance;
            } else
            if (time >= point.time && list[index + 1].time > time) {
                result = point.totalDistance + (time - point.time) / (list[index + 1].time - point.time) * list[index + 1].distance;
            }
        });
        return result;
    }
};


function formatGameTimeMS(timeMS, onlyMinutes) {
    var onlyMinutes = typeof (onlyMinutes) == "undefined" ? false : onlyMinutes;

    timeMS = iDiv(timeMS, 1000);

    if (timeMS > 3600 * 24)
        timeMS = 3600 * 24;

    if (timeMS < 0)
        timeMS = -timeMS;

    if (timeMS == -1)
        timeMS = 0;

    var sec = timeMS % 60;
    var min = iDiv(timeMS, 60) % 60;
    var hrs = iDiv(timeMS, 3600);

    if (!onlyMinutes) {
        if (hrs == 0) {
            return min + ":" + ext("" + sec, 2, "0"); // ext("" + min, 2, "0")
        } else {
            return hrs + ":" + ext("" + min, 2, "0") + ":" + ext("" + sec, 2, "0"); // ext("" + hrs, 2, "0")
        }
    } else {
        if (min == 0 && hrs == 0)
            return sec + "&nbsp;" + I18n.contextGet("time", "secondsShortSuffix");
        else {
            if (sec > 30)
                min++;
            if (min == 60) {
                hrs++;
                min = 0;
            }
            if (hrs == 0) {
                return min + "&nbsp;" + I18n.contextGet("time", "minutesShortSuffix");
            } else {
                return hrs + "&nbsp;" + I18n.contextGet("time", "hoursSuperShortSuffix")
                    + "&nbsp;" + min + "&nbsp;" + I18n.contextGet("time", "minutesSuperShortSuffix");
            }
        }
    }

    function iDiv(numerator, denominator) {
        // In JavaScript, dividing integer values yields a floating point result
        // (unlike in Java, C++, C)
        // To find the integer quotient, reduce the numerator by the remainder
        // first, then divide.
        var remainder = numerator % denominator;
        var quotient = (numerator - remainder) / denominator;

        // Another possible solution: Convert quotient to an integer by truncating
        // toward 0.
        // Thanks to Frans Janssens for pointing out that the floor function is not
        // correct for negative quotients.
        if (quotient >= 0)
            quotient = Math.floor(quotient);
        else
        // negative
            quotient = Math.ceil(quotient);

        return quotient;
    }

    function ext(str, len, char) {
        char = typeof (char) == "undefined" ? "&nbsp;" : char;
        str = "" + str;
        while (str.length < len) {
            str = char + str;
        }
        return str;
    }
}