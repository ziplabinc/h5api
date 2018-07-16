gdApi.Point = new function() {
    this.DOM = {};
    this.init = function() {
        if(document.body === null || document.body === undefined) {
            console.error("[gdApi.Point] gdApi.Point must be call after window.onload. Abort!");
            return;
        }

        this._descText = {
            success: {
                "header": [
                    "<span class='bigsize'>축하합니다!</span>",
                    "게임돔 이용으로",
                    "<span class='gd-coin'></span><span class='gd-bold-blue'><span class='amount'></span>포인트</span>를",
                    "획득했습니다."
                ],
                "body": [
                    "<span class='gd-star'>★</span>100포인트를 모으면 100컬쳐캐쉬로<span class='gd-star'>★</span>",
                    "<span class='gd-star'>★</span>바로 전환할 수 있습니다.<span class='gd-star'>★</span>"
                ]
            },
            not_login: {
                "header": [
                    "게임돔 <span style='font-weight: 600'>로그인</span> 후",
                    "이용하시면 <span class='gd-coin'></span><span class='gd-bold-blue'>포인트</span>를",
                    "적립할 수 있습니다."
                ],
                "body": [
                    "<span class='gd-star'>★</span>100포인트를 모으면 100컬쳐캐쉬로<span class='gd-star'>★</span>",
                    "<span class='gd-star'>★</span>바로 전환할 수 있습니다.<span class='gd-star'>★</span>"
                ]
            },
        };

        this.DOM.backScreen = document.createElement("div");
        this.DOM.backScreen.id = "gd-backScreen";
        this.DOM.backScreen.addEventListener("click", function(e) {
            if(e.target.id != "gd-backScreen") return;
            e.target.style.display = "none";
            if(typeof this.resumeGame == "function") this.resumeGame();
        }.bind(this));
        document.body.appendChild(this.DOM.backScreen);

        this.DOM.mainPopup = document.createElement("div");
        this.DOM.mainPopup.id = "gd-popup";
        this.DOM.backScreen.appendChild(this.DOM.mainPopup);

        // POPUP 내 붙이는 태그
        var cornerTag = document.createElement("div");
        cornerTag.id = "gd-corner-tag";
            this.DOM.cornerTagSpan = document.createElement("span");
            this.DOM.cornerTagSpan.innerText = "적립";
            cornerTag.appendChild(this.DOM.cornerTagSpan);
        this.DOM.mainPopup.appendChild(cornerTag);


        this.DOM.successText = document.createElement("div");
        this.DOM.successText.id = "gd-text-success";
        this.DOM.successText.innerHTML = "<h2 class='gd-text-header'></h2><span class='gd-text-body'></span>";
        this.DOM.mainPopup.appendChild(this.DOM.successText);
        this.DOM.successText.getElementsByClassName("gd-text-header")[0].innerHTML
         = this._descText.success.header.join("<br>");
        this.DOM.successText.getElementsByClassName("gd-text-body")[0].innerHTML
         = this._descText.success.body.join("<br>");
        
        this.DOM.notloginText = document.createElement("div");
        this.DOM.notloginText.id = "gd-text-notlogin";
        this.DOM.notloginText.innerHTML = "<h2 class='gd-text-header'></h2><span class='gd-text-body'></span>";
        this.DOM.mainPopup.appendChild(this.DOM.notloginText);
        this.DOM.notloginText.getElementsByClassName("gd-text-header")[0].innerHTML
         = this._descText.not_login.header.join("<br>");
        this.DOM.notloginText.getElementsByClassName("gd-text-body")[0].innerHTML
         = this._descText.not_login.body.join("<br>");

        var submitBtn = document.createElement("div");
        submitBtn.classList.add("gd-button");
        submitBtn.innerText = "게임 계속하기";
        submitBtn.addEventListener("click", function(e) {
            this.DOM.backScreen.style.display = "none";
            if(typeof this.resumeGame == "function") this.resumeGame();
        }.bind(this));
        this.DOM.mainPopup.appendChild(submitBtn);

        this.DOM.loginBtn = document.createElement("div");
        this.DOM.loginBtn.id = "gd-login";
        this.DOM.loginBtn.classList.add("gd-button");
        this.DOM.loginBtn.innerText = "로그인";
        this.DOM.loginBtn.addEventListener("click", function(e) {
            parent.parent.location.href="/access?mode=login";
        }.bind(this));
        this.DOM.mainPopup.appendChild(this.DOM.loginBtn);
    }.bind(this)


    this._openPopup = function(data) { // console.log(data);
        if(data.status == "fail")   return;
        else {
            if(typeof this.pauseGame == "function") this.pauseGame();
        }
        
        if(data.amount !== undefined) {
            // 왜 no-this?
            gdApi.Point.DOM.mainPopup.getElementsByClassName("amount")[0].innerText = data.amount;
        }
        
        if(data.status == "not_login") {
            this.DOM.successText.style.display = "none";
            this.DOM.notloginText.style.display = "block";

            this.DOM.loginBtn.style.display = "block";
            this.DOM.cornerTagSpan.innerText = "안내";
            this.DOM.mainPopup.style.backgroundPosition = "center 163px";
            this.DOM.mainPopup.style.backgroundImage = "url("+gdApi.style.imageURI.bgNotlogin+")";
        }
        else if(data.status == "success") {
            this.DOM.notloginText.style.display = "none";
            this.DOM.successText.style.display = "block";

            this.DOM.loginBtn.style.display = "none";
            this.DOM.cornerTagSpan.innerText = "적립";
            this.DOM.mainPopup.style.backgroundPosition = "center -8px";
            this.DOM.mainPopup.style.backgroundImage = "url("+gdApi.style.imageURI.bgSuccess+")";
        }

        this.DOM.backScreen.style.display = "block";
    }.bind(this)

    this.call = function(opt) {
        if(opt === undefined)                       opt = {}
        if (opt.env === undefined) {
            console.error("[gdApi.Point] call env argument is undefined");
            return;
        }
        if (opt.action === undefined)               opt.action = "";
        if (typeof opt.pauseGame === "function")    this.pauseGame = opt.pauseGame;
        else                                        this.pauseGame = null;
        if (typeof opt.resumeGame === "function")   this.resumeGame = opt.resumeGame;
        else                                        this.resumeGame = null;

        var xhr = new XMLHttpRequest();
        // xhr.responseType = "json"; // It is not working in IE...
        xhr.open("GET", "/accumulation/call/gift/"+opt.env+"/"+opt.action);
        xhr.send(null);
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4) { // DONE
                if (xhr.status === 200) { // OK
                    this._openPopup(JSON.parse(xhr.response));
                }else { // ETC(404, 503 ..)
                    console.error("[gdApi.Point] Point xhrCall error: "+xhr.status+" "+xhr.statusText+" ("+xhr.responseURL+")");
                }
            }
        }.bind(this);
    }.bind(this)
};