window.h5Api = window.h5Api || {};

h5Api.Payment = h5Api.payment = new function () {
    this.eventTypes = {
        SUCCESS: "success",
        FAIL: "fail",
        ERROR: "error",
        CLOSE: "close"
    }
    this.callback = {};
    this.product = {
        package: [], term: [], money: []
    };
    /**
     * this.options.domain : "https://ims.zip-lab.co.kr:3728"
     * this.options.title : "메이햄의 유산"
     */
    this.init = function (options) {
        this.options = Object.assign({
            domain: undefined,
            style: "white",
            title: "TITLE",
            packageName: "mayhem",
            userKey: null,
            storeName: "playstore",
            customStationFn: null,
            theme: null
        }, options);
        
        this.style = this.getUiStyle(this.options.style);
        this.setLoader();
    }
    this.open = function () {
        var url = "/payment/store_item/"+this.options.storeName+"/"+this.options.packageName+"/"+this.options.userKey;
        this.httpRequest(this.options.domain + url, null, function (data) {
            try {
                var res = JSON.parse(data);
                if (res.status == 'success' && res.data.itemList.length) {
                    this.openStation(res.data.itemList);
                } else {
                    throw new Error("error");
                }
            } catch (e) {
                console.log(e);
                alert("상품 정보를 획득하는데 실패했습니다.");
                return false;
            }
        })
    }

    this.close = function () {
        this.isLoading = false;
        document.body.removeChild(this.wrapperDOM);
        document.body.removeChild(this.loadingDOM);

        if (this.callback[this.eventTypes.CLOSE] !== undefined)
            this.callback[this.eventTypes.CLOSE]();
    }

    // station 생성
    this.openStation = function (product) {
        this.isLoading = false;

        for(var type in this.product) {
            this.product[type] = [];
        }
        product.forEach(function(itm) {
            this.product[itm.type].push(itm);
        }.bind(this));

        if(this.options.theme) {
            this.dynamicLoad([
                this.options.domain + '/s/flickity/flickity.pkgd.min.js',
                this.options.domain + '/s/flickity/flickity.min.css',
                this.options.domain + '/s/theme/pay-card-theme.css',
                this.options.domain + '/s/theme/pay-card-theme.js'
            ]);
            // ], runCustomStation.bind(this, this.product, this.close));
        } else if(this.options.customStationFn) {
            this.wrapperDOM = (this.options.customStationFn.bind(this))(this.product, this.close);
        } else {
            var closeBt = h5Api.createDOM({ tag: "div", style: this.style.close });
            closeBt.addEventListener("click", this.close.bind(this));
    
            var listWrap = { tag: "div", style: this.style.list, child: [] }
    
            Object.keys(this.product).forEach(function(type) {
                this.product[type].forEach(function (itm) {
                    listWrap.child.push(this.makeProductList(itm));
                }.bind(this));
            }.bind(this));

            this.wrapperDOM = h5Api.createDOM({
                tag: "div",
                style: this.style.wrapper,
                child: [
                    closeBt,
                    { tag: "div", style: this.style.header, value: this.options.title },
                    listWrap,
                    { tag: "div", style: this.style.footer, value: "" }
                ]
            });
            document.body.appendChild(this.wrapperDOM);
        }

    }

    // 각 상품의 payload 요청 메소드
    this.getDevPayload = function (productId) {
        this.isLoading = true;
        var url = "/payment/payload/"+this.options.storeName+"/"+this.options.packageName+"/"+this.options.userKey+"/"+productId;
        this.httpRequest(this.options.domain + url, null, function (data) {
            try {
                var res = JSON.parse(data);
                if (res.status == 'success') {
                    if(this.options.storeName == "playstore") {
                        var payload = "payload:" + res.data.dev_payload;
                    }else if(this.options.storeName == "onestore") {
                        var payload = res.data.dev_payload;
                    }
                    window._ZIPAPP.purchase(res.data.product_id, payload);
                } else {
                    throw new Error("error");
                }
            } catch (e) {
                console.log(e);
                alert("데이터 획득에 실패했습니다. 증상이 계속되면 고객센터로 문의해주세요.")
            }
        });
    }

    // 영수증 응답 수신 콜백
    // 앱 내에서 영수증 검증 요청 실행함 (CordovaActivity.java > domain)
    // 추후 엑솔라도 ims로 통합할 때 사용할 듯. 현재는 미사용
    this.appCallback = function (status, sig, res) {
        if (status == true) {
            var xhttp = new XMLHttpRequest();
            var sendData = {
                sig: sig,
                receipt: JSON.parse(res)
            }

            xhttp.open("POST", this.options.domain + "/payment/verification/" + this.options.storeName, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.onreadystatechange = function (e) {
                if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
                    this.isLoading = false;
                    try {
                        data = JSON.parse(e.currentTarget.responseText);
                        if (data.status in this.callback)
                            this.callback[data.status]();
                        else {
                            if (data.status === "success") {
                                this.close();
                            } else {
                                alert("결제에 실패했습니다. 증상이 계속되면 고객센터로 문의해주세요.");
                                this.close();
                            }
                        }
                    } catch (e) {
                        console.log(e.currentTarget);
                        alert("데이터 획득에 실패했습니다..")
                    }
                }
            }.bind(this);
            xhttp.send(JSON.stringify(sendData));
        } else {
            // h5Api.Payment.appCallback(false, 'thisIsPayload', 'result.getCode()')
            // h5Api.Payment.appCallback(false, 'thisIsPayload', '2')
            var xhttp = new XMLHttpRequest();
            xhttp.open("PUT", this.options.domain + "/payment/payload/" + this.options.storeName, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({
                dev_payload: (this.options.storeName == "playstore") ? sig.split(":")[1] : sig,
                status: "fail_from_client_code"+res,
                user: this.options.userKey
            }));
        }
    }

    /**
     * h5Api.Payment.on(h5Api.Payment.eventTypes.SUCCESS, function(){....})
     */
    this.on = function (type, callback) {
        this.callback[type] = callback;
    }

    this.makeProductList = function (product) {
        var desc = {
            tag: "div", class: "product-desc",
            style: "color: #ababab; font-size: 11px;",
            child: [
                { tag: "pre", style: "font-weight: inherit; font-family: inherit;", value: product.desc }
            ]
        }
        if(product.bonus) {
            desc.child.push({ tag: "div", value: "(+ "+product.bonus+")", style: "color:red;" })
        }

        var el = h5Api.createDOM({
            tag: "div", class: "product-col",
            product: product.id,
            style: this.style.productCol,
            child: [
                { tag: "img", id: "product-img-" + product.id, style: this.style.img, src: this.options.domain+"/"+product.image },
                { tag: "div", style: this.style.desc, child: [
                    { tag: "div", style: "overflow:hidden;", value: product.name },
                    desc
                ]},
                { tag: "div", style: this.style.button, child: 
                    { tag: "div", style: this.style.buy, value: String.fromCharCode(0x20A9) + this.numberWithCommas(product.price) }
                }
            ]
        });

        el.addEventListener("click", this.getDevPayload.bind(this, product.id));
        return el;
    }

    this.getUiStyle = function (type) {
        var styleDom = document.createElement("style");
        styleDom.innerText = "#gpcall-shadow * { box-sizing: inherit; }"
        document.body.appendChild(styleDom);

        return ({
            white: {
                wrapper: "position: fixed; top:0px; left:0px; width: 100%; height: 100%; background-color: white; z-index: 10000; box-sizing: border-box;",
                header: "width: 100%; height: 50px; color: #4e4e4e; background-color: rgb(243, 243, 243); font-family: NanumSquareRound; font-weight: 800; text-align: center; font-size: 17px; padding-top: 13px; border-bottom: 1px solid #d4d4d4;",
                list: "height: calc(100% - 100px); height: -webkit-calc(100% - 100px); height: -moz-calc(100% - 100px); overflow-y: auto; font-family: NanumSquareRound; font-weight: 600;",
                productCol: "position: relative; width:100%; min-height: 80px; border-bottom: 1px solid #d4d4d4; line-height: 1.5; padding: 10px 0px;",
                imgwrap: "width: 70px;height: 100%;float: left;padding: 5px;",
                img: "width: 60px; height: 60px; margin: 0px 5px; float: left; border-radius: 10px; border: 1px solid #c9c9c9;",
                desc: "width: calc(100% - 180px); width: -webkit-calc(100% - 190px); width: -moz-calc(100% - 180px); margin: 0px 5px; display: inline-block;",
                button: "float: right; width: 100px; text-align: center; font-family: NanumSquareRound;color: black;font-weight: 400; display: inline-block; margin-top: 18px;",
                buy: "font-size: 14px; position: relative; left: 50%; transform: translateX(-50%); border: 1px solid black; border-radius: 20px; width: 85px;",
                close: "position: absolute; top: 0px; right: 0px; width: 50px; height: 50px; background-image: url(" + this.exitBt + "); background-size: 30%; background-repeat: no-repeat; background-position: 50%; opacity:0.5;",
                footer: "position: absolute; height: 50px; width: 100%; bottom: 0px; background-color: #f4f4f4; border-top: 1px solid #dcdcdc; border-bottom: 1px solid #dcdcdc;",
                loader: {
                    position: "fixed",
                    top: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(128, 128, 128, 0.251)",
                    zIndex: 99999,
                    display: "none"
                },
                loaderChild1: {
                    position: "relative",
                    top: "50%",
                    left: "50%",
                    webkitTransform: "translate(-50%, -50%)",
                    mozTransform: "translate(-50%, -50%)",
                    msTransform: "translate(-50%, -50%)",
                    oTransform: "translate(-50%, -50%)",
                    transform: "translate(-50%, -50%)",
                    float: "left"
                },
                loaderChild2: {
                    position: "relative",
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #3498db",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    animation: "spin 2s linear infinite",
                    opacity: 1
                }
                // loader : "position: fixed; top:0; width: 100%; height: 100%; background-color: rgba(128, 128, 128, 0.251); z-index:99999; display: none",
                // loader_div1 : "position: relative; top: 50%; left: 50%; -webkit-transform: translate(-50%, -50%); -moz-transform: translate(-50%, -50%); -ms-transform: translate(-50%, -50%); -o-transform: translate(-50%, -50%); transform: translate(-50%, -50%); float: left;",
                // loader_div2 : "position: relative; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; opacity: 1;"
            }
        })[type];
    }

    this.setLoader = function () {
        this.loadingDOM = h5Api.createDOM({
            tag: "div",
            id: "loading-ready",
            style: this.style.loader,
            child: {
                tag: "div",
                style: this.style.loaderChild1,
                child: {
                    tag: "div",
                    style: this.style.loaderChild2
                }
            }
        });
        document.body.appendChild(this.loadingDOM);
    }
    this._isLoading = false;
    Object.defineProperty(this, "isLoading", {
        set: function (val) {
            this._isLoading = val;
            this.loadingDOM.style.display = this._isLoading ? "block" : "none";
        },
        get: function () {
            return this._isLoading;
        }
    });

    this.numberWithCommas = function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    this.httpRequest = function (url, data, callback) {
        this.isLoading = true;
        var xhttp = new XMLHttpRequest();
        var bd = callback.bind(this);
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("loading-ready").style.display = "none";
                try {
                    bd(this.responseText);
                } catch (e) {
                    console.log(e);
                    alert("데이터 획득에 실패했습니다..")
                }
            }
        };
        xhttp.open("GET", url, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(data);
    }

    this.dynamicLoad = function(src, callback) {
        if(src.constructor !== Array) src = [src];
        this._dynamicLoadCnt = src.length;

        src.forEach(function(cb, eachSrc) {
            var ext = eachSrc.split('.').pop();
            var loadTagName = (ext == 'js') ? 'script' : 'link';
    
            var loadDOM = document.createElement(loadTagName);
            if (loadDOM.readyState) { //IE
                loadDOM.onreadystatechange = function (cb) {
                    if (loadDOM.readyState == "loaded" || loadDOM.readyState == "complete") {
                        loadDOM.onreadystatechange = null;
                        this._dynamicLoadCheck(cb);
                    }
                }.bind(this, cb);
            } else { //Others
                loadDOM.onload = function (cb) {
                    this._dynamicLoadCheck(cb);
                }.bind(this, cb);
            }
    
            if(loadTagName == 'script') {
                loadDOM.src = eachSrc;
            } else if(loadTagName == 'link') {
                loadDOM.rel = 'stylesheet';
                loadDOM.href = eachSrc;
            }
            document.getElementsByTagName("head")[0].appendChild(loadDOM);
        }.bind(this, callback));
    }
    this._dynamicLoadCnt = null;
    this._dynamicLoadCheck = function(callback) {
        this._dynamicLoadCnt--;
        if(this._dynamicLoadCnt === 0) {
            // TODO: callback().....
            this.wrapperDOM = (runCustomStation.bind(this))(this.product, this.close);
        };
    }



    this.exitBt = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAADo0lEQVRogeXay27aQBQG4KPGki8YR068DcaLRH6ISEklKqVdILUrXmCI3woleYXYGBLkoJgIxc9gw6bQrJIqEhLN4nTRuMqFiz2+gFqks2LG+BPwz3hmABEBEWE4HO4eHx+fqKr6g2VZLJVKd4SQ08FgsBe2WVX5vq8TQk5UVR0zDIOapo0Mw2gEQaCHbQARodfrHcqy/AgA+La2t7cf+v3+waoQnuftK4pyP+veZFl+7PV6h4gIMBwOd+chwioWi5Nut/spb4TruhVJkiaL7k2W5ccgCHQwDKOxqGFYhUJh2ul0qnkhHMc5EkVxISIswzAaUC6Xv0dpDAAoCMK03W5njul0OtVCoTCNel+apo2AZdlIjcPieX7aarUyw1xcXFQFQYiMAADc2NhAKJVKd3E6hRjbtlPHtNvtKs/zsRAAgDs7O3dACDmN2xEAkOO4VDG0CADAer1+CoPBYE9RlAdaTLPZTIxptVrUiK2trZ9BEOiAiNDv9w+KxWKkhJiFsSyLGmPbNjVCFMXJzc3NR0SEvxfsdruVOEmRBsa27SrHcVSfKQjC1HGco/Ba72IvbmLQYprNJjWC5/np5eXlq8+aGX+0X/Uz5mvWiFlj2dwsp8WwLPtkmmZtHsKyrNQRcyFJ43AeJili0UCcWSy+xZimWWNZ9ikLxFJIGpjz8/OaaZo1juOoEFEH3sxjkmXZJ9pvIs7sIZfMp0XEmTVEhiSNzSwRsSF5YGjnb7EhiMlidBmCdt5GBXmBofoTzwuFJJNPagjin7EhDcyy2UDmkBBDG69pIRARPsAavBAxnYv81z8ty7KqSX5SaWOoEVnEbxJM7A5ZD4i0mLVChMVx3K+4Y0rkhquYNMbBZI5IOo2PilnaYB0erKJMIhe+meZze9ZPibkgwkoS2xzHxV98+CeWg1JYbfyWZYzPWmV8B3Ec53Ne679JMM/rvl9mQlzXrUTds0uKSCPWRVGcXF9fV15BPM/bX7Z7mjbiJYb2/yhJ0uT29nYfEQF839fn7WNHQax6o0dRlHvf93UghJzRItZl640Qcgaqqo7jdsxqZ5c29lVVHQPDMLERWe6102xPMwyDoGnaKGoHQRBmZnjaRXVgIOoRDlEUJ2+zO8u6urqKd4QjCAJ92aEaSZJeZXZe5bpuZXNzM9qhGsTFx5wURbn3PG8/b0RYkY85hR2CINANw2homjZiGAZVVR0TQs5839dXAXhZvu/r9Xr9pFwuzz149ht48NiXggMxLAAAAABJRU5ErkJggg==";
}