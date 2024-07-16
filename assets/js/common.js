const common =
    {
        goods: [
            {
                idx: 1,
                name: "스티커 (25종 개별)",
                img: "./assets/images/goods/image10.png",
                price: 2000,
            },
            {
                idx: 2,
                name: "금속배지",
                options: [
                    {
                        type: "type",
                        option: ["대감", "무궁화"],
                    },
                ],
                img: "./assets/images/goods/image11.png",
                price: 12000,
            },
            {
                idx: 3,
                name: "캔배지 (3종 1세트)",
                img: "./assets/images/goods/image12.png",
                price: 8000,
            },
            {
                idx: 4,
                name: "티셔츠",
                options: [
                    {
                        type: "color",
                        option: ["white", "black"],
                    },
                    {
                        type: "size",
                        option: ["m", "l", "xl"],
                    },
                ],
                img: "./assets/images/goods/image07.png",
                price: 35000,
            },
            {
                idx: 5,
                name: "공무원증 세트",
                img: "./assets/images/goods/image08.png",
                price: 15000,
            },
            {
                idx: 6,
                name: "에코백",
                img: "./assets/images/goods/image09.png",
                price: 18000,
            },
            {
                idx: 7,
                name: "디오라마",
                options: [
                    {
                        type: "type",
                        option: ["석어당", "역적"],
                    },
                ],
                img: "./assets/images/goods/image05.png",
                price: 29000,
            },
            {
                idx: 8,
                name: "아크릴 스탠드",
                options: [
                    {
                        type: "type",
                        option: ["1. 출근", "2. 흠", "3. 무관", "4. 학창의", "5. 구라파", "6. 종묘", "7. 뛰뛰"],
                    },
                ],
                img: "./assets/images/goods/image06.png",
                price: 9000,
            },
            {
                idx: 9,
                name: "죽창 스마트톡",
                img: "./assets/images/goods/image01.png",
                price: 15000,
            },
            {
                idx: 10,
                name: "합죽선",
                img: "./assets/images/goods/image02.png",
                price: 15000,
            },
            {
                idx: 11,
                name: "공명첩 손수건",
                img: "./assets/images/goods/image03.png",
                price: 15000,
            },
            {
                idx: 12,
                name: "페이스 쿠션",
                img: "./assets/images/goods/image04.png",
                price: 36000,
            }
        ],
        init: function () {
        },

        convertGoodHtml: function (item) {
            let html = ``;
            html += `<div class="col item-card" data-idx="${item.idx}">`;
            html += `<img src="${item.img}">`;
            html += `<div class="name">${item.name}</div>`;
            html += `<div class="price" data-price="${item.price}">${item.price.toLocaleString()}원</div>`;
            // option 추가
            if (item.options !== undefined) {
                html += `<div class="options">`;
                html += `<div class="option input-group option${item.idx}">`;
                $(item.options).each(function (index) {
                    let option = item.options[index];
                    html += `<select class="custom-select" name="${item.idx}[${option.type}][]">`;
                    $(option.option).each(function (index) {
                        let optionItem = option.option[index];
                        html += `<option value="${optionItem}">${optionItem}</option>`;
                    });
                    html += `</select>`;
                });
                html += `<select class="custom-select qty qty-option" name="option[${item.idx}]['qty'][]">`;
                html += common.bindQtyOptions();
                html += `</select>`;
                html += `<button type="button" class="add btn btn-sm btn-outline-secondary" data-idx="${item.idx}">추가</button>`;
                html += `</div>`;
            } else {
                html += `<select class="custom-select qty" name="option[${item.idx}]['qty']">`;
                html += common.bindQtyOptions(item.idx == 1 ? 101 : 0);
                html += `</select>`;
            }
            html += `</div>`;
            html += `</div>`;
            return html;
        },
        bindQtyOptions: function (length = 0) {
            let html = ``;
            for (int in Array.from(Array(length == 0 ? 11 : length).keys())) {
                html += `<option value="${int}">${int}</option>`;
            }

            return html;
        },
        setGoods: function (element) {
            let html = ``;
            $(this.goods).each(function (index) {
                let item = common.goods[index];
                html += common.convertGoodHtml(item);
            });

            element.html(html);
        },
        cloneOption: function (element) {
            let idx = element.attr('data-idx');
            let clone = $(`.option${idx}`).last().clone();
            clone.children('.add').remove();
            clone.append(`<button type="button" class="remove btn btn-sm btn-outline-danger" data-idx="${idx}">X</button>`);
            let originSelects = element.parent().find('select');
            clone.find('select').each(function (index) {
                $(this).val(originSelects.eq(index).val());
            });

            element.parents('.options').prepend(clone);
            common.calcAmount();
        },
        calcAmount : function () {
            let amount = 0;

            $('select.qty').each(function (index) {
                let select = $(this);
                let parent = select.parents('.item-card');
                let qty = parseInt(select.val());

                if (qty == 0) {
                    return;
                }

                if (select.hasClass('qty-option')) {
                    let optionParent = select.parents('.option');
                    if (optionParent.has('.add').length > 0) {
                        return;
                    }
                }

                let price = parent.find('.price').attr('data-price');
                let totalPrice = qty * price;

                amount += totalPrice;
            });
            $('#amountInfo .amount').html(amount.toLocaleString() + '원');
            $('#amountInfo .gift').html((parseInt(amount / 20000)).toLocaleString() + '개');
        },
        saveImage: function () {
            let html = ``;
            let amount = 0;

            $('select.qty').each(function (index) {
                let select = $(this);
                let parent = select.parents('.item-card');
                let qty = parseInt(select.val());

                if (qty == 0) {
                    return;
                }

                let name = parent.find('.name').text();
                let img = parent.find('img').attr('src');

                if (select.hasClass('qty-option')) {
                    let optionParent = select.parents('.option');
                    if (optionParent.has('.add').length > 0) {
                        return;
                    }

                    let optionText = ``;
                    $(optionParent).find('select').not('.qty').each(function () {
                        let value = $(this).val();
                        if (optionText != '') {
                            optionText += '/';
                        }

                        optionText += value;
                    });

                    if (optionText != '') {
                        name += ` (${optionText})`;
                    }
                }

                let price = parent.find('.price').attr('data-price');
                let totalPrice = qty * price;

                amount += totalPrice;

                html += `<div class="item clearfix">`;
                html += `<span class="left"><img src="${img}"></span>`;
                html += `<span class="left">${name}</span>`;
                html += `<span class="right">`;
                html += `<span class="price">${qty}*${price.toLocaleString()}</span>`;
                html += `<span class="total">${(totalPrice).toLocaleString()}원</span>`;
                html += `</span>`;
                html += `</div>`;
            });
            $('#amountInfo .amount').html(amount.toLocaleString() + '원');
            $('#amountInfo .gift').html((parseInt(amount / 20000)).toLocaleString() + '개');

            $('#wrapItems').hide();
            $('#itemList').html(html).show();
            $('.signature').show();

            html2canvas(document.querySelector('#receipt')).then(function (canvas) {\
                $('#preview').append(`<img src="` + canvas.toDataURL("image/png", 1.0) + `">`).show();
                $('.image-btn a').attr('href', canvas.toDataURL("image/png", 1.0));
                $('#receipt').hide();
                $('.preview-btn').hide();
                $('.image-btn').show();
            });
        }
    }