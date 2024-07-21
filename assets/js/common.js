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

            $(document).on('dblclick', function () {
                $('#setting').show();
            });

            $('#setting .close').on('click', function () {
                $('#setting').hide();
            });

            $('#setting .setting-day').on('click', function () {
                let bool = $(this).hasClass('on');
                common.setBtnOn($(this), bool);
                common.setNight(bool);
            });

            $('#setting .setting-rain').on('click', function () {
                let bool = $(this).hasClass('on');

                common.setBtnOn($('#setting .setting-snow'), true);
                common.setSnow(false);

                common.setBtnOn($(this), bool);
                common.setRain(!bool);
            });

            $('#setting .setting-snow').on('click', function () {
                let bool = $(this).hasClass('on');

                common.setBtnOn($('#setting .setting-rain'), true);
                common.setRain(false);

                common.setBtnOn($(this), bool);
                common.setSnow(!bool);
            });
        },
        setBtnOn : function (element, bool) {
            if (!bool) {
                element.addClass('on');
            } else {
                element.removeClass('on');
            }
        },
        events: function () {
            this.reset();
        },
        reset : function () {
            this.getRise();
            this.bindSeason();

            this.updateItems();

            this.interval = setInterval(function () {
                let hour = common.getCurrentHour();
                if (date != common.date) {
                    common.date = date;
                    common.getRise();
                    common.bindSeason();
                } else {
                    common.bindNight();
                }

                if (hour != common.hour) {
                    common.updateItems();
                }
            }, 360000);
        },
        updateItems: function () {
            this.bindCurrentHour();
            this.getCurrentDate();
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
            if (this.getCurrentHour(date) < 0) {
                date.setDate(date.getDate() - 1);
            }

            let year = date.getFullYear();
            let month = this.getMonth(date);
            let dateNum = date.getDate();

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
                    common.bindNight();
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
                        let bool = item.obsrValue > 0;
                        common.setRain(bool);
                        common.setBtnOn($('#setting .setting-rain'), !bool);
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
        },
        setSeason: function (season) {
            $('.container').removeClass('spring summer fall winter');
            $('.container').addClass(season);
        },
        setRain: function (bool) {
            if (bool) {
                $('.container').addClass('rain');
                $('.container .rain').show();
                $('.cloud').show();
                this.makeItRain();
            } else {
                $('.container').removeClass('rain');
                $('.container .rain').hide();
                $('.cloud').hide();
                $('.rain-container').empty();
            }
        },
        setSnow: function (bool) {
            if (bool) {
                $('.container').addClass('rain');
                $('.cloud').show();
                $('.container .snow-container').snowfall({
                    image :"./assets/images/flake.png",
                    minSize: 3,
                    maxSize:10,
                    flakeCount : 120
                });
            } else {
                $('.container').removeClass('rain');
                $('.cloud').hide();
                $('.container .snow-container').empty();
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
        bindNight: function () {
            let date = new Date();
            let hour = date.getHours() < 10 ? '0'+date.getHours() : date.getHours();
            let minute = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes();
            let time = hour + '' + minute;

            let bool = this.sunrise > time || this.sunset < time;

            if (!bool) {
                $('#setting .setting-day').addClass('on');
            } else {
                $('#setting .setting-day').removeClass('on');
            }


            this.setNight(bool);

        },
        setNight : function (bool) {
            if (bool) {
                $('.container').addClass('night');
            } else {
                $('.container').removeClass('night');
            }
        }

        
    }