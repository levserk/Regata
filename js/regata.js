var map,  mapOptions = {
    center: new google.maps.LatLng(20.291, 153.027),
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.TERRAIN
};
var minDelta = 30000;
var regata;


$(document).ready(ready);

function ready(){
    var tracks = [];
    $.ajax({url:'races/2014-05-09/1.csv', async:false}).done(onTrackLoaded);

    regata = new Regata(tracks);

    function onTrackLoaded(sTrack){
        tracks.push(sTrack.split('\n').slice(2));
    }
}



function Regata(_trs){
    var tracks;
    var minLat, maxLat, minLon, maxLon;
    init(_trs);

    function init(_trs){
        var track;
        tracks = [];

        _.each(_trs,function(element, index, list){
            track = new Track(element);
            track.marker  = {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4,
                strokeColor: '#193'
            };
            tracks.push(track);
            if (maxLat==null||maxLat<track.maxLat) maxLat = track.maxLat;
            if (maxLon==null||maxLon<track.maxLon) maxLon = track.maxLon;
            if (minLat==null||minLat>track.minLat) minLat = track.minLat;
            if (minLon==null||minLon>track.minLon) minLon = track.minLon;
        });

        mapOptions.center = new google.maps.LatLng(minLat + (maxLat-minLat)*0.5, minLon + (maxLon-minLon)*0.5);
        console.log(tracks);
        var map = new google.maps.Map(document.getElementById('map-canvas'),  mapOptions);
        _.each(tracks,function(track, index, list){
            track.line = new google.maps.Polyline({
                path: track.coords,
                icons: [{
                    icon: track.marker,
                    offset: '0%'
                }],
                map: map
            });
        });


    }
}


// ------------------ Classes ---------------------

var Point = function(_t, _lat, _lon){
    this.time = _t;
    this.lat = _lat;
    this.lon = _lon;
    this.LatLng = google.maps.LatLng(_lat, _lon)
}

var Track = function(spoints){
    this.points = [];
    this.coords = [];
    this.minLat=null;
    this.maxLat=null;
    this.minLon=null;
    this.maxLon=null;
    var that = this;

    var spoint, point, time, oldTime=0, lat, lon;
    _.each(spoints,function(element, index, list){
        spoint = element.split(',');
        time = moment(spoint[0]).valueOf();

        if (time-oldTime<minDelta) return;

        oldTime = time;

        lat = parseFloat(spoint[1]);
        lon = parseFloat(spoint[2]);

        if (that.maxLat==null||that.maxLat<lat) that.maxLat = lat;
        if (that.maxLon==null||that.maxLon<lon) that.maxLon = lon;
        if (that.minLat==null||that.minLat>lat) that.minLat = lat;
        if (that.minLon==null||that.minLon>lon) that.minLon = lon;
        point = new Point(time, lat, lon);
        that.points.push(point);
        that.coords.push(point.LatLng);
    });
}