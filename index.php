<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta charset="utf-8">
    <title>Регата</title>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>

    <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
    <script src="/js/lib/moment-with-langs.min.js"></script>
    <script src="/js/lib/underscore-min.js"></script>
    <script src="/js/shared/lg-shared.js"></script>
    <script src="js/races.js"></script>
    <script src="js/regata.js"></script>



    <link rel="stylesheet" type="text/css" href="css/style.css" />

</head>
<body>
<div class="button" onclick="loadTrack(8)">гонка 8</div>
<div class="button" onclick="loadTrack(9)">гонка 9</div>
<div class="button" onclick="loadTrack(10)">гонка 10</div>
<div id="map-canvas"></div>
 <div style="width: 1200px; margin: 0 auto">
    <div id ="player-panel">
        <span id="s-title">
            Title
        </span>
        <div id="player-table">
            players
        </div>
    </div>
 </div>
 <div id="panel">
    <div style="width:1200px; margin: 0 auto">
        <div id="speed">
            <button id="bt-down">-</button>
            <span id="s-speed">x50</span>
            <button id="bt-up">+</button>
        </div>
        <div id="middle-top-pan">
            <span id="s-cur-time">&nbsp;</span>
            <input id="bar" type="range" min="0" max="100000" value="0" />
            <span id="s-total-time">&nbsp;</span>
        </div>
        <div id="middle-pan">
            <button id="bt-prev"></button>
            <button id="bt-play"></button>
            <button id="bt-pause"></button>
            <button id="bt-next"></button>
        </div>
        <div id="info"></div>
    <div>
</div>
</body>
</html>