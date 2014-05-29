var races = {
    '8': {
        title:'Гонка 8, 4 день №1 - 2 круга <br> 8 мая (Хорватия)',
        stracks: [
            {
                url: 'races/8/23.plt',
                lab: '23',
                timezone: '04:00',
                color: '#20A530',
                position: 1
            },
            {
                url: 'races/8/19.plt',
                lab: '19',
                timezone: '02:00',
                color: '#241EDF',
                position: 4
            },
            {
                url: 'races/8/17.plt',
                lab: '17',
                timezone: '04:00',
                color: '#FF282C',
                position: 2
            }
        ],
        markers: [
            new google.maps.LatLng(43.499160, 16.199460),
            new google.maps.LatLng(43.500222, 16.195898),
            new google.maps.LatLng(43.484307, 16.177723),
            new google.maps.LatLng(43.485451, 16.177455)],
        startLine: [new google.maps.LatLng(43.499160, 16.199460), new google.maps.LatLng(43.500222, 16.195898)]
    },
    '9': {
        title:'Гонка 9, 4 день №2 - 1 круг <br> 8 мая (Хорватия)',
        stracks: [
            {
                url: 'races/9/23.plt',
                lab: '23',
                timezone: '04:00',
                color: '#20A530',
                position: 2
            },
            {
                url: 'races/9/19.plt',
                lab: '19',
                timezone: '02:00',
                color: '#241EDF',
                position: 6
            },
            {
                url: 'races/9/17.plt',
                lab: '17',
                timezone: '04:00',
                color: '#FF282C' ,
                position: 4
            }
        ],
        markers: [
            new google.maps.LatLng(43.499160, 16.199460),
            new google.maps.LatLng(43.500222, 16.195898),
            new google.maps.LatLng(43.484307, 16.177723),
            new google.maps.LatLng(43.485451, 16.177455)],
        startLine: [new google.maps.LatLng(43.499160, 16.199460), new google.maps.LatLng(43.500222, 16.195898)]
    },
    '10': {
        title:'Гонка 10, 5 день №1 - 1 круг <br> 9 мая (Хорватия)',
        stracks: [
            {
                url: 'races/2014-05-09/1_0400.plt',
                lab: '23',
                timezone: '04:00',
                color: '#20A530' ,
                position: 2
            },
            {
                url: 'races/2014-05-09/2_0200.plt',
                lab: '19',
                timezone: '02:00',
                color: '#241EDF' ,
                position: 4
            }
        ],
        markers: [
            new google.maps.LatLng(43.496376, 16.363832),
            new google.maps.LatLng(43.497084, 16.363006),
            new google.maps.LatLng(43.503732, 16.382887),
            new google.maps.LatLng(43.505771, 16.381331)
        ],
        startLine: [new google.maps.LatLng(43.505771, 16.381331), new google.maps.LatLng(43.503732, 16.382887)]
    }
};