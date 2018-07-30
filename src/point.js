gdApi.Point = new function() {
    this.DOM = {};
    this.init = function() {
        if(document.body === null || document.body === undefined) {
            console.error("[gdApi.Point] gdApi.Point must be call after window.onload. Abort!");
            return;
        }

        this._descText = {
            success: [
                "<div>축하합니다!</div>",
                "<div><span class='amount'></span>P</div>"
            ],
            not_login: [
                "<div>악!! 포인트는</div>",
                "<div>로그인 상태에서만</div>",
                "<div>적립됩니다.</div>"
            ],
            body: [
                "<span class='highlight'>100포인트</span>를 모으면",
                "<span class='highlight'>100컬쳐캐쉬</span>로 즉시 전환"
            ]
        };

        this.DOM.backScreen = document.createElement("div");
        this.DOM.backScreen.id = "gd-backScreen";
        // this.DOM.backScreen.addEventListener("click", function(e) {
        //     if(e.target.id != "gd-backScreen") return;
        //     e.target.style.display = "none";
        //     if(typeof this.resumeGame == "function") this.resumeGame();
        //     if(typeof this.callback == "function") this.callback();
        // }.bind(this));
        document.body.appendChild(this.DOM.backScreen);

        this.DOM.mainPopup = document.createElement("div");
        this.DOM.mainPopup.id = "gd-popup";
        this.DOM.backScreen.appendChild(this.DOM.mainPopup);

        this.DOM.topImage = document.createElement("div");
        this.DOM.topImage.id = "gd-top-image";
        this.DOM.mainPopup.appendChild(this.DOM.topImage);

        this.DOM.successText = document.createElement("div");
        this.DOM.successText.id = "gd-text-success";
        this.DOM.successText.classList.add("gd-text-header");
        this.DOM.successText.innerHTML = this._descText.success.join("");
        this.DOM.mainPopup.appendChild(this.DOM.successText);
        
        this.DOM.notloginText = document.createElement("div");
        this.DOM.notloginText.id = "gd-text-notlogin";
        this.DOM.notloginText.classList.add("gd-text-header");
        this.DOM.notloginText.innerHTML = this._descText.not_login.join("");
        this.DOM.mainPopup.appendChild(this.DOM.notloginText);
        
        var bodyText = document.createElement("div");
        bodyText.classList.add("gd-text-body");
        bodyText.innerHTML = this._descText.body.join("<br>");
        this.DOM.mainPopup.appendChild(bodyText);
        
        var buttonBox = document.createElement("div");
        buttonBox.id = "gd-button-box";
        this.DOM.mainPopup.appendChild(buttonBox);

        this.DOM.loginBtn = document.createElement("div");
        this.DOM.loginBtn.id = "gd-login";
        this.DOM.loginBtn.classList.add("gd-button");
        this.DOM.loginBtn.innerText = "로그인 하기";
        this.DOM.loginBtn.addEventListener("click", function(e) {
            parent.parent.location.href="/access?mode=login";
        }.bind(this));
        buttonBox.appendChild(this.DOM.loginBtn);

        var submitBtn = document.createElement("div");
        submitBtn.classList.add("gd-button");
        submitBtn.innerText = "게임 계속하기";
        submitBtn.addEventListener("click", function(e) {
            this.DOM.backScreen.style.display = "none";

            if(typeof this.resumeGame == "function")    this.resumeGame();
            if(typeof this.sucsback == "function")      this.sucsback();
        }.bind(this));
        buttonBox.appendChild(submitBtn);

    }.bind(this)


    this._openPopup = function(data) { // console.log(data);
        if(data.status == "fail") {
            if(typeof this.failback == "function") this.failback();
            return;
        }   
        else {
            if(typeof this.pauseGame == "function") this.pauseGame();
        }
        
        if(data.amount !== undefined) {
            var num = data.amount + "";
            var point = num.length % 3 ;
           
            var str = num.substring(0, point); 
            while (point < num.length) {
                if (str != "") str += ","; 
                str += num.substring(point, point + 3); 
                point += 3; 
            }
            this.DOM.mainPopup.getElementsByClassName("amount")[0].innerText = str;
        }
        
        if(data.status == "not_login") {
            this.DOM.successText.style.display = "none";
            this.DOM.notloginText.style.display = "block";

            this.DOM.loginBtn.style.display = "block";
            this.DOM.topImage.style.backgroundImage = "url("+gdApi.style.imageURI.bgNotlogin+")";
        }
        else if(data.status == "success") {
            this.DOM.notloginText.style.display = "none";
            this.DOM.successText.style.display = "block";

            this.DOM.loginBtn.style.display = "none";
            this.DOM.topImage.style.backgroundImage = "url("+gdApi.style.imageURI.bgSuccess+")";
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
        if (typeof opt.success === "function")      this.sucsback = opt.success;
        else                                        this.sucsback = null;
        if (typeof opt.fail === "function")         this.failback = opt.fail;
        else                                        this.failback = null;

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
                    if(typeof this.failback == "function") this.failback();
                }
            }
        }.bind(this);
    }.bind(this)
};