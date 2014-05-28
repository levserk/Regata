var map,  mapOptions = {
    center: new google.maps.LatLng(20.291, 153.027),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP ,
    scrollwheel: false,
    navigationControl: false,
    mapTypeControl: false,
    scaleControl: false,
    draggable: false,
    styles:[
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
        ,{
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

$(document).ready(ready);

function ready(){
  $("#map-canvas").hide();
}

function loadTrack(tr){
    $("#map-canvas").show();
    $(".button").hide();
    var race = races[tr];

    _.each(race.stracks,function(element, index, list){
        $.ajax({url:element.url, async:false}).done(function(strack){
            element.spoints = strack.split('\n').slice(6);
        });
    });

    regata = new Regata(race);
}



function Regata(_race){
    var tracks;
    var minLat, maxLat, minLon, maxLon, ts, te, deltaTime, timePerSec=20, time;
    var playInterval,speedInterval, fplaying;
    init(_race);

    function init(race){
        var track;
        tracks = [];

        _.each(race.stracks,function(element, index, list){
            track = new Track(element);
            track.marker  = {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 3,
                fillOpacity: 1,
                fillColor: track.color,
                strokeColor: track.color
            };
            tracks.push(track);
            if (maxLat==null||maxLat<track.maxLat) maxLat = track.maxLat;
            if (maxLon==null||maxLon<track.maxLon) maxLon = track.maxLon;
            if (minLat==null||minLat>track.minLat) minLat = track.minLat;
            if (minLon==null||minLon>track.minLon) minLon = track.minLon;
            if (ts==null|| ts>track.ts) ts=track.ts;
            if (te==null|| te<track.te) te=track.te;
        });

        mapOptions.center = new google.maps.LatLng(minLat + (maxLat-minLat)*0.5, minLon + (maxLon-minLon)*0.5);
        console.log(tracks);
        var map = new google.maps.Map(document.getElementById('map-canvas'),  mapOptions);
        _.each(race.markers,function(element, index, list){
            var circle = new google.maps.Circle({
                'center':element,
                'clickable':false,
                'fillColor':"#FFF556",
                fillOpacity: 1,
                strokeWeight: 1,
                'map':map,
                'radius':16,
                'strokeColor':'#0'
            });
        });
        var startLine = new google.maps.Polyline({
            path: race.startLine,
            strokeColor: "#FFF556",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map:map
        });
        _.each(tracks,function(track, index, list){
            track.line = new google.maps.Polyline({
                path: track.coords,
                icons: [{
                    icon: track.marker,
                    offset: '0%'
                }],
                strokeColor: track.color,
                strokeOpacity: 1.0,
                strokeWeight: 0.7,
                map: map
            });
        });

        bindEvents();

        $('#bt-pause').hide();
        $('#panel').show();
        $('#bar').attr('max',te);
        $('#bar').attr('min',ts);
        $('#s-total-time').html(formatGameTimeMS(te-ts));
        $('#s-speed').html('x' + timePerSec);
        $('#player-panel').show();

        showPlayers(_race);
    }

    function play(){
        if (!time) time = ts;
        deltaTime = new Date();
        playInterval = setInterval(frame,20);
        fplaying = true;
        console.log(time,te,te-time, deltaTime);
        $('#bt-play').hide(); $('#bt-pause').show();
    }

    function pause(){
        fplaying = false;
        clearInterval(playInterval);
        $('#bt-play').show(); $('#bt-pause').hide();
    }

    function stop(){
        fplaying = false;
        clearInterval(playInterval);
        $('#bar').val(time);
        time=null;
        _.each(tracks,function(track, index, list){
            icon = track.line.get('icons');
            icon[0].offset = '100%';
            track.line.set('icons',icon);
        });
        $('#bt-play').show(); $('#bt-pause').hide();
    }

    function frame(){
        var t = new Date(), icon;
        time+= (t - deltaTime) * timePerSec;
        if (time>=te){
            stop();
            return;
        }
        if (time<ts) time=ts;
        $('#bar').val(time);
        deltaTime = t;
        animate();
    }

    function animate(){
        _.each(tracks,function(track, index, list){
            icon = track.line.get('icons');
            icon[0].offset = track.caclDistance(time)/track.distance * 100 + '%';
            track.line.set('icons',icon);
        });
        $('#s-cur-time').html(formatGameTimeMS(time-ts));
    }

    function bindEvents(){
        var defSpeed;
        $('#bt-prev').mousedown(function(){
            defSpeed = timePerSec;
            timePerSec = -50;
            $('#s-speed').html('x' + timePerSec);
        }).mouseup(function(){
            timePerSec = defSpeed;
            $('#s-speed').html('x' + timePerSec);
        });
        $('#bt-next').mousedown(function(){
            defSpeed = timePerSec;
            timePerSec = 50;
            if (!fplaying) play();
            $('#s-speed').html('x' + timePerSec);
        }).mouseup(function(){
            timePerSec = defSpeed;
            $('#s-speed').html('x' + timePerSec);
        });
        $('#bt-play, #bt-pause').click(function(){
            if (fplaying){
                pause();
            } else {
                play();
            }
        });
        $('#bar').on('input', function(){
            if (fplaying) pause();
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
        $('#bt-down').mousedown(function(){
            clearInterval(speedInterval);
            speedInterval = setInterval(function(){
                if (timePerSec>1)timePerSec--;
                else clearInterval(speedInterval);
                $('#s-speed').html('x'+timePerSec);
            } ,50);
        });

        $('#bt-up').mousedown(function(){
            clearInterval(speedInterval);
            speedInterval = setInterval(function(){
                if (timePerSec<300)timePerSec++;
                else clearInterval(speedInterval);
                $('#s-speed').html('x'+timePerSec);
            } ,50);
        });
        $('#bt-down, #bt-up').mouseup(function(){
            clearInterval(speedInterval);
        })
    }

    function showPlayers(race){
        $('#s-title').html(race.title);
        var phtml = "";
        _.each(race.stracks,function(track, index, list){
            phtml+="<div style='width: 100%; height: 20px;'>";
            phtml+='<div class="circle" style="border: 2px solid ' + track.color + '; background:' + track.color +'">&nbsp;</div>';
            phtml+='&nbsp;'+track.lab+" &nbsp;&nbsp;(" + track.position + " место)";
            phtml+="</div>";
        });
        $('#player-table').html(phtml);
    }

}


// ------------------ Classes ---------------------

var Point = function(_t, _lat, _lon){
    this.time = _t;
    this.lat = _lat;
    this.lon = _lon;
    this.LatLng = new google.maps.LatLng(_lat, _lon);
    this.distance = 0;
    this.totalDistance = 0;
    this.calcDistance = function(point){
       if (!point) return;
       that.distance = Math.sqrt(Math.pow(that.lat-point.lat,2)+Math.pow(that.lon-point.lon,2));
       that.totalDistance = point.totalDistance + that.distance;
    };
    var that=this;
};

var Track = function(strack){
    this.points = [];
    this.coords = [];
    this.minLat=null;
    this.maxLat=null;
    this.minLon=null;
    this.maxLon=null;
    this.distance=0;
    this.ts=0;
    this.te=0;
    this.timezone = strack.timezone;
    this.color = strack.color;
    this.label=strack.lab;
    var that = this;

    var spoint, point,prev, time, oldTime=0, lat, lon;
    _.each(strack.spoints,function(element, index, list){
        spoint = element.split(',');
        if (spoint.length<6) return;
        time = moment(spoint[5]+' '+spoint[6].replace(/\n|\r/g, "")+' +'+strack.timezone,"DD.MM.YYYY HH:mm:ss Z").valueOf();

        if (!time>0 || time-oldTime<minDelta) return;
        if (that.ts==0)that.ts=time;
        oldTime = time;

        lat = parseFloat(spoint[0]);
        lon = parseFloat(spoint[1]);

        if (that.maxLat==null||that.maxLat<lat) that.maxLat = lat;
        if (that.maxLon==null||that.maxLon<lon) that.maxLon = lon;
        if (that.minLat==null||that.minLat>lat) that.minLat = lat;
        if (that.minLon==null||that.minLon>lon) that.minLon = lon;
        point = new Point(time, lat, lon);
        point.calcDistance(prev);
        that.points.push(point);
        that.coords.push(point.LatLng);
        prev = point;
        that.distance = point.totalDistance;
        that.te = time;
    });

    that.caclDistance = function(time){
        if (!(time>=that.ts&&time<=that.te)) {
            if(time>that.te) return that.distance;
        }
        var result = 0;
        _.each(that.points,function(point, index, list){
            if (time>=point.time && list[index+1].time>time){
                result = point.totalDistance + (time - point.time)/(list[index+1].time - point.time) * list[index+1].distance;
                return false;
            }
        });
        return result;
    }
};