var races = {
    '8': {
        title:'Гонка 8 (4 день, 1 гонка, 2 круга) <br> 8 мая (Хорватия)',
        angle:228,
        stracks: [
            {
                url: 'races/8/23.plt',
                lab: '23',
                timezone: '04:00',
                color: '#20A530',
                position: 1
            },
            {
                url: 'races/8/17.plt',
                lab: '17',
                timezone: '04:00',
                color: '#FF282C',
                position: 2,
                delta: -140
            },
            {
                url: 'races/8/19.plt',
                lab: '19',
                timezone: '02:00',
                color: '#241EDF',
                position: 4,
                delta: 8
            },
            {
                url: 'races/8/21.plt',
                lab: '21',
                timezone: '02:00',
                color: '#FFFFFF',
                position: 7
            }
        ],
        markers: [
            new google.maps.LatLng(43.499160, 16.199460),
            new google.maps.LatLng(43.501038, 16.197130),
            new google.maps.LatLng(43.484307, 16.177723),
            new google.maps.LatLng(43.485451, 16.177455)],
        startLine: [new google.maps.LatLng(43.499160, 16.199460), new google.maps.LatLng(43.501038, 16.197130)]
    },
    '9': {
        title:'Гонка 9 (4 день, 2 гонка, 1 круг) <br> 8 мая (Хорватия)',
        angle:228,
        stracks: [
            {
                url: 'races/9/23.plt',
                lab: '23',
                timezone: '0400',
                color: '#20A530',
                position: 2
            },
            {
                url: 'races/9/17.plt',
                lab: '17',
                timezone: '0400',
                color: '#FF282C' ,
                position: 4,
                delta: -145
            },
            {
                url: 'races/9/19.plt',
                lab: '19',
                timezone: '0200',
                color: '#241EDF',
                position: 6,
                delta: 8
            },
            {
                url: 'races/9/21.plt',
                lab: '21',
                timezone: '0200',
                color: '#FFFFFF',
                position: 0
            }
        ],
        markers: [
            new google.maps.LatLng(43.499160, 16.199460),
            new google.maps.LatLng(43.501038, 16.197130),
            new google.maps.LatLng(43.484307, 16.177723),
            new google.maps.LatLng(43.485451, 16.177455)],
        startLine: [new google.maps.LatLng(43.499160, 16.199460), new google.maps.LatLng(43.501038, 16.197130)]
    },
    '10': {
        title:'Гонка 10 (5 день, 1 гонка, 1 круг) <br> 9 мая (Хорватия)',
        angle:242,
        stracks: [
            {
                url: 'races/2014-05-09/1_0400.plt',
                lab: '23',
                timezone: '0400',
                color: '#20A530' ,
                position: 2
            },
            {
                url: 'races/2014-05-09/2_0200.plt',
                lab: '19',
                timezone: '0200',
                color: '#241EDF' ,
                position: 4,
                delta: 8
            },
            {
                url: 'races/2014-05-09/3_0200.plt',
                lab: '21',
                timezone: '0200',
                color: '#FFFFFF' ,
                position: 5,
                delta: 20
            }
        ],
        markers: [
            new google.maps.LatLng(43.496376, 16.363832),
            new google.maps.LatLng(43.497084, 16.363006),
            new google.maps.LatLng(43.503768, 16.382898),
            new google.maps.LatLng(43.507044, 16.382560)
        ],
        startLine: [new google.maps.LatLng(43.507044, 16.382560), new google.maps.LatLng(43.503768, 16.382898)]
    },
    '11': {
        title:'Тиурула 1<br> 13 июня 2014 года',
        angle:0,
        stracks: [
            {
                url: 'races/2014-06-13/GII1.plt',
                lab: 'ONE',
                timezone: '0400',
                color: '#20A530' ,
                position: 0,
                delta: 0
            },
            {
                url: 'races/2014-06-13/SVIRIDA1.plt',
                lab: 'TWO',
                timezone: '0400',
                color: '#241EDF' ,
                position: 0,
                delta: 0
            }
        ],
        markers: [
            new google.maps.LatLng(43.496376, 16.363832),
            new google.maps.LatLng(43.497084, 16.363006),
            new google.maps.LatLng(43.503768, 16.382898),
            new google.maps.LatLng(43.507044, 16.382560)
        ],
        startLine: [new google.maps.LatLng(43.507044, 16.382560), new google.maps.LatLng(43.503768, 16.382898)]
    },
    '12': {
        title:'Тиурула 2<br> 13 июня 2014 года',
        angle:0,
        stracks: [
            {
                url: 'races/2014-06-13/GII2.plt',
                lab: 'ONE',
                timezone: '0400',
                color: '#20A530' ,
                position: 0,
                delta: 0
            },
            {
                url: 'races/2014-06-13/SVIRIDA2.plt',
                lab: 'TWO',
                timezone: '0400',
                color: '#241EDF' ,
                position: 0,
                delta: 0
            }
        ],
        markers: [
            new google.maps.LatLng(43.496376, 16.363832),
            new google.maps.LatLng(43.497084, 16.363006),
            new google.maps.LatLng(43.503768, 16.382898),
            new google.maps.LatLng(43.507044, 16.382560)
        ],
        startLine: [new google.maps.LatLng(43.507044, 16.382560), new google.maps.LatLng(43.503768, 16.382898)]
    },
    '13': {
        title:'Тиурула 2 My Tracks <br> 13 июня 2014 года',
        angle:0,
        stracks: [
            {
                url: 'races/2014-06-13/GII_GPX2.plt',
                lab: 'ONE',
                timezone: '0400',
                color: '#20A530' ,
                position: 0,
                delta: 0
            },
            {
                url: 'races/2014-06-13/SVIRIDA_GPX2.plt',
                lab: 'TWO',
                timezone: '0400',
                color: '#241EDF' ,
                position: 0,
                delta: 0
            }
        ],
        markers: [
            new google.maps.LatLng(43.496376, 16.363832),
            new google.maps.LatLng(43.497084, 16.363006),
            new google.maps.LatLng(43.503768, 16.382898),
            new google.maps.LatLng(43.507044, 16.382560)
        ],
        startLine: [new google.maps.LatLng(43.507044, 16.382560), new google.maps.LatLng(43.503768, 16.382898)]
    },
    '14': {
        title:'Проверка NAVGPS <br> 20 июня 2014 года',
        angle:0,
        stracks: [
            {
                url: 'races/2014-06-20/navgps_.plt',
                lab: 'NAV',
                timezone: '0400',
                color: '#FF282C',
                position: 0,
                delta: 0
            }
        ],
        markers: [
            new google.maps.LatLng(43.496376, 16.363832),
            new google.maps.LatLng(43.497084, 16.363006),
            new google.maps.LatLng(43.503768, 16.382898),
            new google.maps.LatLng(43.507044, 16.382560)
        ],
        startLine: [new google.maps.LatLng(43.507044, 16.382560), new google.maps.LatLng(43.503768, 16.382898)]
    },
    '15': {
        title:'Проверка NAVGPS <br> 24 июня 2014 года',
        angle:0,
        stracks: [
            {
                url: 'races/2014-06-24/T_2014-06-24_22_46_28.dat',
                lab: 'NAV',
                timezone: '0400',
                color: '#FF282C',
                position: 0,
                delta: 0
            }
        ],
        markers: [
            new google.maps.LatLng(0.0, 0.0),
            new google.maps.LatLng(0.0, 0.0),
            new google.maps.LatLng(0.0, 0.0),
            new google.maps.LatLng(0.0, 0.0)
        ],
        startLine: [new google.maps.LatLng(59.933353, 30.36018), new google.maps.LatLng(60.035202, 30.331718)]
    }
};