const common =
    {
        serviceKey: 'wi0HturBsF0NNnifZD1S50ta2vXAgK7AXz8a/Ssf0FJWyw/r6tsJkotxBQ7XMg0t7EwhpyOB8UkNiBoUshvpMg==',
        wetherUrl: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst',
        riseUrl: 'https://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo',
        nx: '60',
        ny: '127',
        hour: 0,
        date: '',
        sunrise: 0,
        sunset: 0,
        springDate: '0305', // 경칩
        summerDate: '0621', // 하지
        fallDate: '0922', // 추분
        winterDate: '1122', // 소설
        interval: null,
        init: function () {
            this.events();
        },
        events: function () {
            this.getRise();
            this.bindSeason();

            this.reset();

            this.interval = setInterval(function () {
                let hour = common.getCurrentHour();
                if (date != common.date) {
                    common.date = date;
                    common.getRise();
                    common.bindSeason();
                } else {
                    common.setNight();
                }

                if (hour != common.hour) {
                    common.reset();
                }
            }, 360000);
        },
        reset: function () {
            this.bindCurrentHour();
            this.getCurrentDate();
            $('.container').append('<div>' + this.getCurrentDate() + ' ' + this.getCurrentHour() + '기준 </div>');
            this.getWether();
        },
        getMonth : function (date) {
            let month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            return month;
        },
        getCurrentDate: function () {
            let date = new Date();
            let month = this.getMonth(date);

            return date.getFullYear() + '' + month + '' + date.getDate();
        },
        bindCurrentHour: function () {
            let date = new Date();
            this.hour = date.getMinutes() < 40 ? date.getHours() - 1 : date.getHours();
        },
        getCurrentHour: function () {
            let hour = this.hour < 10 ? '0' + this.hour : this.hour;
            return hour + '00';
        },
        getRise: function () {
            $.ajax({
                type: 'get',
                url: this.riseUrl,
                async: true,
                data: {
                    serviceKey: this.serviceKey,
                    locdate: this.getCurrentDate(),
                    location: '서울',
                },
                success: function (result) {
                    let obj = $.xml2json(result);
                    let items = obj.body.items.item;
                    common.sunrise = items.sunrise;
                    common.sunset = items.sunset;
                    common.setNight();

                    $('.container').append('<div>일출 : ' + common.sunrise + '</div>');
                    $('.container').append('<div>일몰 : ' + common.sunset + '</div>');
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },
        getWether: function () {
            $.ajax({
                type: 'get',
                url: this.wetherUrl,
                async: true,
                data: {
                    serviceKey: this.serviceKey,
                    pageNo: 1,
                    dataType: 'JSON',
                    base_date: this.getCurrentDate(),
                    base_time: this.getCurrentHour(),
                    nx: this.nx,
                    ny: this.ny,
                },
                success: function (result) {
                    let items = result.response.body.items.item;
                    common.bindWetherResults(items);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },
        bindWetherResults: function (items) {
            $(items).each(function (index) {
                let item = items[index];
                switch (item.category) {
                    // 강수형태
                    // case 'PTY' :
                    //     common.setRain(item.obsrValue > 0);
                    //     break;
                    // 1시간 강수량
                    case 'RN1' :
                        common.setRain(item.obsrValue > 0);
                        if (item.obsrValue > 0) {
                            $('.container').append('<div>비옴</div>');
                        }
                        break;
                }
            });
        },
        bindSeason: function () {
            let date = new Date();
            let currentDate = this.getMonth(date) + '' + date.getDate();

            let season = 'winter';
            if (common.springDate <= currentDate && common.summerDate >= currentDate) {
                season = 'spring';
            } else if (common.summerDate <= currentDate && common.fallDate >= currentDate) {
                season = 'summer';
            } else if (common.summerDate <= currentDate && common.fallDate >= currentDate) {
                season = 'fall';
            }

            this.setSeason(season);
            $('.container').append('<div>'+season+'</div>');
        },
        setSeason: function (season) {
            $('.container').removeClass('spring summer fall winter');
            $('.container').addClass(season);
        },
        setRain: function (bool) {
            console.log(bool);
            if (bool) {

                $('.container').addClass('rain');
                $('.container .rain').show();
                this.makeItRain();
            } else {
                $('.container').removeClass('rain');
                $('.container .rain').hide();
                $('.rain-container').empty();
            }
        },
        makeItRain : function () {
            $('.rain-container').empty();
            let width = $(document).innerWidth();
            let height = $(document).innerHeight();

            $('.rain-container').css({width : height});
            $('.rain-container').css({height : width});

            var increment = 0;
            var drops = "";
            var backDrops = "";

            while (increment < 100) {
                //couple random numbers to use for various randomizations
                //random number between 98 and 1
                var randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
                //random number between 5 and 2
                var randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));
                //increment
                increment += randoFiver;
                //add in a new raindrop with various randomizations to certain CSS properties
                drops += '<div class="drop" style="left: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
                backDrops += '<div class="drop" style="right: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
            }

            $('.rain-container.front-row').append(drops);
            $('.rain-container.back-row').append(backDrops);
        },
        setNight: function () {
            let date = new Date();
            let hour = date.getHours();
            let minute = date.getMinutes();
            let time = hour + '' + minute;

            let bool = this.sunrise > time || this.sunset < time
            if (bool) {
                $('.container').addClass('night');
            } else {
                $('.container').removeClass('night');
            }
        }
    }
