const common =
    {
        serviceKey : 'wi0HturBsF0NNnifZD1S50ta2vXAgK7AXz8a/Ssf0FJWyw/r6tsJkotxBQ7XMg0t7EwhpyOB8UkNiBoUshvpMg==',
        wetherUrl : 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst',
        riseUrl : 'https://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo',
        nx : '60',
        ny : '127',
        hour : 0,
        sunrise : 0,
        sunset : 0,
        interval : null,
        init : function () {
            this.getRise();
            this.events();
        },
        events : function () {
            setTimeout(function () {
                common.setNight();
            }, 500);
            this.reset();

            this.interval = setInterval(function () {
                // 날짜가 바뀌면 일출/일몰 계산

                if (hour != common.hour) {
                    common.reset();
                }
            }, 360000);
        },
        reset : function () {
            this.bindCurrentHour();
            $('.container').append('<div>'+this.getCurrentDate()+ ' '+this.getCurrentHour()+'기준 </div>');
            this.getWether();       
        },
        getCurrentDate : function () {
            let date = new Date();
            let month = date.getMonth()+1;
            if (month < 10) {
                month = '0'+month;
            }
            return date.getFullYear() + '' + month +''+ date.getDate();
        },
        bindCurrentHour : function () {
            let date = new Date();
            this.hour = date.getHours() - 1;
        },
        getCurrentHour : function () {
            let hour = this.hour < 10 ? '0' + this.hour : this.hour;
            return hour +'00';
        },
        getRise : function () {
            $.ajax({    
                type : 'get',
                url : this.riseUrl,
                async : true,
                data : {
                    serviceKey : this.serviceKey,
                    locdate : this.getCurrentDate(),
                    location : '서울',
                },
                success : function (result) {
                    let obj = $.xml2json(result);
                    let items = obj.body.items.item;
                    common.sunrise = items.sunrise;
                    common.sunset = items.sunset;
                    $('.container').append('<div>일출 : '+common.sunrise+ '</div>');
                    $('.container').append('<div>일몰 : '+common.sunset+ '</div>');
                },
                error : function (error) {
                    console.log(error);
                }
            });
        },
        getWether : function () {
            $.ajax({    
                type : 'get',
                url : this.wetherUrl,
                async : true,
                data : {
                    serviceKey : this.serviceKey,
                    pageNo : 1,
                    dataType : 'JSON',
                    base_date : this.getCurrentDate(),
                    base_time : this.getCurrentHour(),
                    nx : this.nx,
                    ny : this.ny,
                },
                success : function (result) {
                    let items = result.response.body.items.item;
                    common.bindWetherResults(items);
                },
                error : function (error) {
                    console.log(error);
                }
            });
        },
        bindWetherResults : function (items) {
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
                    $('.container').append('<div>비옴</div>');
                    break;
                }
            });
        },
        setRain : function (bool) {
            if (bool) {
                $('.container').addClass('rain');
            } else {
                $('.container').removeClass('rain');
            }
        },
        setNight : function () {            
            let date = new Date();
            hour = date.getHours();
            minute = date.getMinutes();
            let time = hour + '' + minute;

            let bool = this.sunrise < time || this.sunset > time
            if (bool) {
                $('.container').addClass('night');
            } else {
                $('.container').removeClass('night');
            }
        }
    }
