var map, mapOptions = {
    center: new google.maps.LatLng(20.291, 153.027),
    zoom: 12,
    maxZoom: 18,
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
var minDelta = 10000;
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

    race.stracks.forEach(function (element, index, list) {
        $.ajax({url: element.url, async: false, cache: false}).done(function (strack) {
            element.spoints = strack.split('\n');
        });
    });

    regata = new Regata(race);
}

function loadTracks(data){
    $("#map-canvas").show();
    $(".button").hide();
    if (!data) data = users;
    var races = {}, race;
    races.stracks=[];
    for (var user in data){
        race = data[user];
        if (race.color=="") race.color = "000000";
        races.stracks.push({
            lab : user.toString(),
            spoints : race.track,
            color: "#"+race.color
        });
    }
    regata = new Regata(races);
    regata.setShowRealTime(true);
}


function loadHistory(timeStart, timeEnd){
    $.ajax({
        type: "POST",
        url: 'action.php',
        data:{type:'getRegataMembers',data:{timeStart:timeStart, timeEnd:timeEnd}},
        success: function(data) {
            var race = {  stracks : [] };
            data = JSON.parse(data);
            $("#map-canvas").show();
            $(".button").hide();
            regata = new Regata(race);
            regata.setShowRealTime(true);
            for (var imei in data){
                var element  = data[imei];
                element.loadMe = function(){
                    var self = this;
                    $.ajax({
                        type: "POST",
                        url: 'action.php',
                        data:{type:'getRegataTrack',data:{user_id:self.user_id, timeStart:timeStart, timeEnd: timeEnd, approximate:true}},
                        success: function(strack) {
                            var spoints = strack.split('\r\n');
                            regata.addTrack({
                                lab : self.lab,
                                imei:self.imei,
                                color: "#"+self.color,
                                user_id: self.user_id,
                                spoints : spoints
                            });
                            console.log('track ', element, 'points:',  spoints.length);
                        }
                    });
                };
                element.loadMe();
            }

        }
    })
}

function showOnline(){
    var timeEnd = Math.floor((new Date()).valueOf()/1000);
    var timeStart = timeEnd - 5*60;
    $.ajax({
        type: "POST",
        url: 'action.php',
        data:{type:'getRegataMembers',data:{timeStart:timeStart, timeEnd:timeEnd}},
        success: function(data) {
            var race = {title:"онлайн", stracks : [] };
            data = JSON.parse(data);
            regata = new Regata(race, "online");
            regata.setShowRealTime(true);
            $('#panel').hide();
            for (var imei in data){
                var element  = data[imei];
                element.loadMe = function(){
                    var self = this;
                    $.ajax({
                        type: "POST",
                        url: 'action.php',
                        data:{type:'getRegataTrack',data:{user_id:self.user_id, timeStart:timeStart, timeEnd: timeEnd, approximate:true}},
                        success: function(strack) {
                            var spoints = strack.split('\r\n');
                            regata.addTrack({
                                lab : self.lab,
                                imei:self.imei,
                                color: "#"+self.color,
                                user_id: self.user_id,
                                spoints : spoints
                            });
                            console.log('track ', element, 'points:',  spoints.length);
                        }
                    });
                };
                element.loadMe();
            }
        }
    })
}


function Regata(_race, div) {
    div = div || "map-canvas";
    var tracks;
    var minLat, maxLat, minLng, maxLng,  center, ts, te, deltaTime, timePerSec = 40, time;
    var playInterval, speedInterval, rotateInterval, fplaying=false, frewind=false, floaded=false, fzoom=false, fdrag=false;
    var ffollow = false, fidle=false, fshowrealtime=false;
    var xx, yy;
    var refereePoint, startPoint, markers;
    var overlay = new google.maps.OverlayView();
    var self = this;
    var regataRace = _race;

    init(_race);

    function init(race) {
        regataRace = race;
        var track;
        tracks = [];

        race.stracks.forEach(function (element, index, list) {
            track = new Track(element);
            tracks.push(track);
            if (maxLat == null || maxLat < track.maxLat) maxLat = track.maxLat;
            if (maxLng == null || maxLng < track.maxLng) maxLng = track.maxLng;
            if (minLat == null || minLat > track.minLat) minLat = track.minLat;
            if (minLng == null || minLng > track.minLng) minLng = track.minLng;
            if (ts == null || ts > track.ts) ts = track.ts;
            if (te == null || te < track.te) te = track.te;
            if (track.refereePoint) refereePoint = track.refereePoint;
            if (track.startPoint) startPoint = track.startPoint;
            if (track.markers.length>0) markers = track.markers;
        });

        mapOptions.center = new google.maps.LatLng(minLat + (maxLat - minLat) * 0.5, minLng + (maxLng - minLng) * 0.5);
        map = new google.maps.Map(document.getElementById(div), mapOptions);
        if (race.markers) markers = race.markers;

        // draw markers
        if (markers)
        markers.forEach(function (element, index, list) {
            element.circle = new google.maps.Circle({
                'center': element,
                'clickable': false,
                'fillColor': "#FFF556",
                fillOpacity: 1,
                strokeWeight: 1,
                'map': map,
                scale: 500,
                'radius': 10,
                'strokeColor': '#FFF556'
            });
        });

        // draw start line
        if (race.startLine || (startPoint && refereePoint)){
            var startLine = new google.maps.Polyline({
                path: race.startLine||[startPoint,refereePoint],
                strokeColor: "#FFF556",
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: map
            });
            if (!startPoint && race.startLine) {
                startPoint = race.startLine[0];
                refereePoint = race.startLine[1];
            }
            //console.log(getDistance(race.startLine[0],race.startLine[1]));
        }
        // draw tracks
        tracks.forEach(function (track, index, list) {
            track.line = new google.maps.Polyline({
                path: track.coords,
                icons: [
                    {
                        icon: track.marker,
                        offset: '0%'
                    }
                ],
                strokeColor: track.color,
                strokeOpacity: 0,
                strokeWeight: 0.45,
                map: map
            });
            track.drawPolylines(map);
        });

        overlay.draw = function() {};
        overlay.setMap(map);

        bindEvents();

        $('#bt-pause').hide();
        $('#panel').show();
        $('#bar').attr('max', te);
        $('#bar').attr('min', ts);
        $('#s-total-time').html(formatGameTimeMS(te - ts));
        $('#s-speed').html('x' + timePerSec);
        $('#player-panel').show();

        showPlayers(regataRace);

        time = ts;
        //zoomMap(16);
    }

    this.addTrack = function(strack){
        regataRace.stracks.push(strack);
        var track = new Track(strack);
        tracks.push(track);
        track.line = new google.maps.Polyline({
            path: track.coords,
            icons: [
                {
                    icon: track.marker,
                    offset: '0%'
                }
            ],
            strokeColor: track.color,
            strokeOpacity: 0,
            strokeWeight: 0.45,
            map: map
        });
        track.drawPolylines(map);
        updateTimeLabels();
        showPlayers(regataRace);
    };

    function play() {
        if ((!time || time == te) && !frewind) time = ts;
        deltaTime = new Date();
        playInterval = setInterval(frame, 30);
        fplaying = true;
        $('#bt-play').css('background-color', '#FFF6AC');
    }

    function pause() {
        fplaying = false;
        clearInterval(playInterval);
        $('#bt-play').css('background-color', 'white');
    }

    function stop() {
        fplaying = false;
        clearInterval(playInterval);
        $('#bar').val(time);
        time = ts;
        tracks.forEach(function (track, index, list) {
            icon = track.line.get('icons');
            icon[0].offset = '100%';
            track.line.set('icons', icon);
        });
        $('#bt-play').css('background-color', 'white');
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
        return true;
    }

    function animate() {
        for (var i=0; i<tracks.length; i++){
            var track = tracks[i];
            var icon = track.line.get('icons');
            var distance =  track.caclDistance(time);
            icon[0].offset = distance / track.distance * 100 + '%';
            track.line.set('icons', icon);
        }
        if (fshowrealtime)  $('#s-cur-time').html(moment(time).format("HH:mm:ss"));
        else $('#s-cur-time').html(formatGameTimeMS(time - ts));
        if (ffollow)moveToPoints();
    }

    function goToStart(){
        var center, lat, lng;
        if (startPoint && refereePoint){
            center = getCenter([startPoint, refereePoint]).center;
        } else {
            var points = [];
            for (var i=0; i<tracks.length; i++){
                var point = tracks[i].getLatLng(ts,true);
                if (point) points.push(point);
            }
            if (points.length>0) center = getCenter(points).center
        }
        var p1 = overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(200,200));
        var p2 = overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(maph*2-200,maph*2-200));
        var hlat = Math.abs(p1.lat() - p2.lat()) / 3;
        var hlng = Math.abs(p1.lng() - p2.lng()) / 3;
        if (center.lat() > maxLat - hlat) center.lat(maxLat  - hlat);
        if (center.lat() < minLat + hlat) center.lat(minLat  + hlat);
        if (center.lng() > maxLng - hlng) center.lng(maxLng  - hlng);
        if (center.lng() < minLng + hlng) center.lng(minLng  + hlng);
        map.panTo(center);
        if (center) map.setCenter(center);
    }

    function moveToPoints(){
        var points = [], point;
        for (var i=0; i<tracks.length; i++){
            if (tracks[i].line.visible && tracks[i].following){
                point = tracks[i].getLatLng(time);
                if (point) points.push(point);
            }
        }
        if (points.length==0) return;
        var zoom = map.getZoom();
        var p1 = overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(200,200));
        var p2 = overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(maph*2-200,maph*2-200));

        if ((Math.abs(p1.lat() - p2.lat())*0.8 > maxLat - minLat) && (Math.abs(p1.lng() - p2.lng())*0.8 > maxLng - minLng)) zoomMap(++zoom);

        var hlat = Math.abs(p1.lat() - p2.lat()) / 4;
        var hlng = Math.abs(p1.lng() - p2.lng()) / 4;
        var c = getCenter(points);

        if ((Math.abs(p1.lat() - p2.lat() )*0.8 < (c.maxLat - c.minLat) || (Math.abs(p1.lng() - p2.lng())*0.8 < (c.maxLng - c.minLng)))) {
            zoomMap(--zoom);
        } else {
            var dis = distanceToMarkers(c.center);
            if (zoom<17 && dis && dis<400 &&
                (Math.abs(p1.lat() - p2.lat())*0.8 > (c.maxLat - c.minLat)*2 &&
                (Math.abs(p1.lng() - p2.lng())*0.8 > (c.maxLng - c.minLng)*2))){
                zoomMap(++zoom);
            }
            else if (zoom>16 && dis && dis>500) zoomMap(--zoom);
            else if (center){
                var dLat = (c.center.lat() - center.lat())*100;
                var dLng = (c.center.lng() - center.lng())*100;
                if ((Math.abs(p1.lat() - p2.lat())*0.8 > (c.maxLat - c.minLat) + dLat*2 &&
                    (Math.abs(p1.lng() - p2.lng())*0.8 > (c.maxLng - c.minLng) + dLng*2))){
                    c.center.lat(c.center.lat()+dLat);
                    c.center.lng(c.center.lng()+dLng);
                }
            }

        }

        center = c.center;

        hlat = Math.abs(p1.lat() - p2.lat()) / 3;
        hlng = Math.abs(p1.lng() - p2.lng()) / 3;
        if (center.lat() > maxLat - hlat) center.lat(maxLat  - hlat);
        if (center.lat() < minLat + hlat) center.lat(minLat  + hlat);
        if (center.lng() > maxLng - hlng) center.lng(maxLng  - hlng);
        if (center.lng() < minLng + hlng) center.lng(minLng  + hlng);
        map.panTo(center);
    }

    function distanceToMarkers(p){
        var result = null, d;
        if (!markers) return null;
        markers.forEach(function (element, index, list) {
            d = getDistance(element, p);
            if (result == null || result > d) result = d;
        });
        return result;
    }

    function zoomMap(z){
        map.setZoom(z);
        //if (z<=15) { setMarkersRadius(12); setBoardsRadius(3); }
        if (z<=16) { setMarkersRadius(9);  setBoardsRadius(3); }
        if (z==17) { setMarkersRadius(6);  setBoardsRadius(5); }
        if (z >17) { setMarkersRadius(5);  setBoardsRadius(9);}
    }

    function setBoardsRadius(r){
        for (var i=0; i<tracks.length; i++){
            var track = tracks[i];
            var icon = track.line.get('icons');
            icon[0].icon.scale = r;
            track.line.set('icons', icon);
        }
    }

    function setMarkersRadius(r){
        if (markers)
        markers.forEach(function (marker) {
            marker.circle.setRadius(r);
        });
    }

    this._setMarkersRadius = setMarkersRadius;
    this._setBoardsRadius = setBoardsRadius;

    function showPlayers(race) {
        $('#s-title').html(race.title);
        var phtml = "";
        race.stracks.forEach(function (track, index, list) {
            phtml += "<div style='width: 100%; height: 20px;'>";	
			phtml += '<input style="float:left;margin-right:5px" class="showPlayer" id="'+index+'" type="checkbox" checked>';
            phtml += '<div class="circle" style="border: 2px solid ' + track.color + '; background:' + track.color + '">&nbsp;</div>';			
            phtml += '&nbsp;' + track.lab + (!!track.position?" &nbsp;&nbsp;(" + track.position + " место)":"");
            phtml += "</div>";
        });
		//phtml +='<button style="width:100px;margin-top:10px" class="bt-speed" id="hide_all_Players">скрыть всех</button>';
        $('#player-table').html(phtml);

        $('.showPlayer').change(function(){
            var id=$(this).attr('id');
            if($(this).prop("checked")==false){
                regata.hideTrack(id);
            } else{
                regata.showTrack(id);
            }
        });

        $('#hide_all_Players').click(function(){
            console.log(race.stracks);
            $('.showPlayer').each(function(){
                var id=$(this).attr('id');
                $(this).removeAttr('checked');
                regata.hideTrack(id);
            });
        });
    }
	
    function rotate(_angle){
        angle = _angle;
        if (angle>360)angle=0;
        if (angle<0)angle=360;
        var tr = 'rotate(-'+_angle+'deg)';
        $("#map-canvas").css({
            '-webkit-transform': tr,
            '-moz-transform': tr
        });
        sin = Math.sin(angle*Math.PI/180);
        cos = Math.cos(angle*Math.PI/180);
        divh = (Math.abs(sin) * $("#map-canvas").height() + Math.abs(cos) * $("#map-canvas").width())*0.5;
        //$('#s-angle').html(angle+'°');
    }

    function getLatLng(mx,my){
        mx -= $("#map-canvas").offset().left;
        my -= $("#map-canvas").offset().top;
        return overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point((((mx-divh) * cos) - ((my-divh) * sin)) + maph, (((mx-divh) * sin) + ((my-divh) * cos)) + maph));
    }


    //  ---------  Events  -----------

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
                frewind = false;
                if (!_fplaing) pause();
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

        $('#bt-left').mousedown(function () {
            clearInterval(rotateInterval);
            rotateInterval = setInterval(function () {
                rotate(--angle);
            }, 50);
        });
        $('#bt-right').mousedown(function () {
            clearInterval(rotateInterval);
            rotateInterval = setInterval(function () {
                rotate(++angle);
            }, 50);
        });

        $(document).on('mouseup',function(){
            clearInterval(rotateInterval);
            clearInterval(speedInterval);
        });

        google.maps.event.addListener( map, 'idle', function() {
           fidle=true;
           if (!floaded) onMapLoaded();
           //if (fzoom) centerAfterZoom();
        });

        $('#bt-follow').click(function(){
            ffollow = !ffollow;
            if (ffollow) $(this).css('background-color', '#FFF6AC');
            else $(this).css('background-color', 'white');
        });
        $("#map-canvas").on('mousemove',onMouseMove);
        $(window).on('mouseup',onMouseUp).on('mouseout', onMouseOut);
        $("#map-canvas").on('mousedown',onMouseDown);
        $("#map-canvas").on('mousewheel DOMMouseScroll', onScroll);
    }

    function onMapLoaded(){
        //if (!floaded) goToStart();
        floaded = true;
        if (_race.hasOwnProperty('angle')) rotate(_race.angle);
    }

    function onMouseMove(e){
        var nPos = getLatLng(e.clientX, e.clientY);
        var mx = e.clientX - $("#map-canvas").offset().left;
        var my = e.clientY - $("#map-canvas").offset().top;
        var x = (((mx-divh) * cos) - ((my-divh) * sin)) + maph;
        var y = (((mx-divh) * sin) + ((my-divh) * cos)) + maph;
        if(fdrag) {
            map.panBy(xx-x, yy-y);
            xx=x; yy=y;
        }
    }

    function onMouseUp(){ fdrag = false; }

    function onMouseOut(){ fdrag = false; }

    function onMouseDown(e){
        fdrag = true;
        var mx = e.clientX - $("#map-canvas").offset().left;
        var my = e.clientY - $("#map-canvas").offset().top;
        xx = (((mx-divh) * cos) - ((my-divh) * sin)) + maph;
        yy = (((mx-divh) * sin) + ((my-divh) * cos)) + maph;
    }

    function onScroll(e){
        var delta = e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0 ? 1 : -1;
        var zoom = map.getZoom();
        if (delta>0){
            zoomMap(++zoom);
        }
        else {
            if (zoom>8){
                zoomMap(--zoom);
            }
        }
        if (ffollow) moveToPoints();
    }

    this.getTracks = function(){
        return tracks;
    };

    this.showTrack = function(id){
        if (id != 0 && !id) {
            for (var i=0; i< tracks.length; i++) { tracks[i].setVisible(true); }
            return;
        }
        var track = tracks[id];
        if (!track) return;
        track.setVisible(true);
        updateTimeLabels();
    };

    this.hideTrack = function(id){
        var track = tracks[id];
        if (!track) return;
        track.setVisible(false);
        updateTimeLabels();
    };


    this.followTrack = function(id){
        if (id != 0 && !id) {
            for (var i=0; i< tracks.length; i++) { tracks[i].following = true; }
            return;
        }
        var track = tracks[id];
        if (!track) return;
        track.following = true;
    };

    this.unfollowTrack = function(id){
        var track = tracks[id];
        if (!track) return;
        track.following = false;
    };

    this.setShowRealTime = function(v){
        fshowrealtime = v;
        updateTimeLabels();
    };

    function updateTimeLabels(){
        ts = null; te = null; maxLat = null; maxLng = null; minLat = null; minLng = null;
        tracks.forEach(function(element){
            if (element.line.visible){
                if (maxLat == null || maxLat < element.maxLat) maxLat = element.maxLat;
                if (maxLng == null || maxLng < element.maxLng) maxLng = element.maxLng;
                if (minLat == null || minLat > element.minLat) minLat = element.minLat;
                if (minLng == null || minLng > element.minLng) minLng = element.minLng;
                if (ts == null || ts > element.ts) ts = element.ts;
                if (te == null || te < element.te) te = element.te;
           }
        });
        map.setCenter(new google.maps.LatLng(minLat + (maxLat - minLat) * 0.5, minLng + (maxLng - minLng) * 0.5));
        if (time < ts) time = ts;
        if (time > te) time = te;
        $('#bar').attr('max', te);
        $('#bar').attr('min', ts);
        $('#bar').val(time);
        if (fshowrealtime) {
            $('#s-nul-time').html(moment(ts).format("HH:mm:ss"));
            $('#s-total-time').html(moment(te).format("HH:mm:ss"));
            $('#s-cur-time').html(moment(time).format("HH:mm:ss"));
        } else {
            $('#s-nul-time').html("-01:00");
            $('#s-total-time').html(formatGameTimeMS(te-ts));
            $('#s-cur-time').html(formatGameTimeMS(time - ts));
        }
    }



}


// ------------------ Classes ---------------------

var Point = function (_t, _lat, _lng) {
    this.time = _t;
    this.lat = _lat;
    this.lng = _lng;
    this.LatLng = new google.maps.LatLng(_lat, _lng);
    this.distance = 0;
    this.totalDistance = 0;
    this.calcDistance = function (point) {
        if (!point) return;
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(point.lat - that.lat);
        var dLngg = rad(point.lng- that.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(that.lat)) * Math.cos(rad(point.lat)) *
                Math.sin(dLngg / 2) * Math.sin(dLngg / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        that.distance = R * c;
        that.totalDistance = point.totalDistance + that.distance;
    };
    var that = this;
};

var Track = function (strack) {
    this.points = [];
    this.coords = [];
    this.minLat = null;
    this.maxLat = null;
    this.minLng = null;
    this.maxLng = null;
    this.distance = 0;
    this.ts = 0;
    this.te = 0;
    this.timezone = strack.timezone;
    this.color = strack.color;
    this.label = strack.lab;
    this.delta = 0;
    this.startPoint = null;
    this.startTime = 0;
    this.refereePoint = null;
    this.markers = [];
    this.following = true;

    var that = this;


    if (strack.hasOwnProperty('delta'))that.delta = strack.delta;
    initPoints(strack.spoints);
    initGoogleMapGraph();

    function initPoints(spoints){
        var spoint, point, prev, time, oldTime = 0, lat, lng;
        spoints.forEach(function (element, index, list) {
            spoint = element.split(',');
            if (spoint.length < 3) return;
            var type = spoint[0].substring(0,1); spoint[0] = spoint[0].substring(1);
            lat = parseFloat(spoint[0]);
            lng = parseFloat(spoint[1]);
            if (!isNaN(parseInt(spoint[2])) && spoint[2].indexOf('.') == -1) time = parseInt(spoint[2]);
            else time = moment(spoint[2] + ' ' + spoint[3].replace(/\n|\r/g, ""), "DD.MM.YYYY HH:mm:ss").valueOf();
            time += that.delta*1000;
            switch (type) {
                case '!': that.startTime = time; break;
                case '&': that.refereePoint = new google.maps.LatLng(lat, lng); that.markers.push(that.refereePoint); break;
                case '$': that.startPoint = new google.maps.LatLng(lat, lng); that.markers.push(that.startPoint); break;
                case '@': that.markers.push(new google.maps.LatLng(lat, lng)); break;
                case '#':
                    if (!time > 0 || (oldTime && time-oldTime<500)) return;
                    if (that.ts == 0)that.ts = time;
                    oldTime = time;

                    if (that.maxLat == null || that.maxLat < lat) that.maxLat = lat;
                    if (that.maxLng == null || that.maxLng < lng) that.maxLng = lng;
                    if (that.minLat == null || that.minLat > lat) that.minLat = lat;
                    if (that.minLng == null || that.minLng > lng) that.minLng = lng;
                    point = new Point(time, lat, lng);
                    point.calcDistance(prev);
                    that.points.push(point);
                    that.coords.push(point.LatLng);
                    prev = point;
                    that.distance = point.totalDistance;
                    that.te = time;
                    break;
            }
        });
    }

    function initGoogleMapGraph(){
        that.marker = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            radius: 5,
            fillOpacity: 1,
            fillColor: that.color,
            strokeColor: that.color
        };
    }

    this.caclDistance = function (time) {
        if (time >= that.te) return that.distance;
        if (time <= that.ts) return 0;
        var point;
        for (var i=0; i<that.points.length; i++){
            point = that.points[i];
            if (i == that.points.length - 1) {
                return point.totalDistance;
            } else
            if (time >= point.time && that.points[i + 1].time > time) {
                if (that.points[i + 1].time - point.time > 60000) return point.totalDistance;
                else return point.totalDistance + (time - point.time) / (that.points[i + 1].time - point.time) * that.points[i + 1].distance;
            }
        }
        return 0;
    };

    this.getLatLng = function(time, first){
        if (first) return that.points[0].LatLng;
        if (time >= that.te) return that.points[that.points.length-1].LatLng;
        if (time <= that.ts) return 0;
        var point;
        for (var i=0; i<that.points.length; i++){
            point = that.points[i];
            if (i == that.points.length - 1) {
                return point.LatLng;
            } else
            if (time >= point.time && that.points[i + 1].time > time) {
                var nextPoint = that.points[i + 1];
                var per = (time - point.time) / (nextPoint.time - point.time);
                var lat = point.lat + (nextPoint.lat - point.lat) * per;
                var lng = point.lng + (nextPoint.lng - point.lng) * per;
                return new google.maps.LatLng(lat, lng);
            }
        }
        return null;
    };

    this.drawPolylines = function(map){
        var point=null, poly,  prev=null, i = 0; that.polylines = [];
        while (i<that.points.length){
            point = that.points[i];
            if (prev == null || (point.time - prev.time > 60000)){
                poly = new google.maps.Polyline({
                    strokeColor: that.color,
                    strokeOpacity: 1.0,
                    strokeWeight: 0.45,
                    map: map
                });
                that.polylines.push(poly);
            }
            poly.getPath().push(point.LatLng);
            prev = point;
            i++;
        }
    };

    this.setVisible = function(f){
        this.line.setVisible(f);
        for (var i = 0; i < this.polylines.length; i++){
            this.polylines[i].setVisible(f);
        }
    };


};

function getCenter(points){
    var minLat = null, maxLat = null, minLng = null, maxLng = null;
    points.forEach(function (point, index, list) {
        if (maxLat == null || maxLat < point.lat()) maxLat = point.lat();
        if (maxLng == null || maxLng < point.lng()) maxLng = point.lng();
        if (minLat == null || minLat > point.lat()) minLat = point.lat();
        if (minLng == null || minLng > point.lng()) minLng = point.lng();
    });
    return {
        center: new google.maps.LatLng(minLat + (maxLat - minLat)*0.5, minLng + (maxLng - minLng)*0.5),
        minLat : minLat, maxLat : maxLat, minLng : minLng, maxLng : maxLng
    };
}

var getDistance = function(p1, p2) { // in meters from points
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLngg = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLngg / 2) * Math.sin(dLngg / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};

var rad = function(x) {
    return x * Math.PI / 180;
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


var users = {};
users[89001] = {
    color: "FF00FF",
    track: [
        "#43.3519333333333,16.2370866666667,07.05.2014,14:14:01",
        "#43.3669366666667,16.2242933333333,07.05.2014,14:22:59",
        "#43.3787683333333,16.2117883333333,07.05.2014,14:30:52",
        "#43.3818316666667,16.204175,07.05.2014,14:45:16"
    ]
};

users[89002] = {
    color: "CC0ACC",
    track: [
        "#43.33066155,16.21618618,07.05.2014,14:16:26",
        "#43.34439806,16.22380885,07.05.2014,14:25:54",
        "#43.3699966,16.22065416,07.05.2014,14:42:33"
    ]
};