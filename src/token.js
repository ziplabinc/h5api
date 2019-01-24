h5Api.Token = new function() {
    this.DOM = {};
    this.init = function() {
        if(document.body === null || document.body === undefined) {
            console.error("[h5Api.Token] h5Api.Token must be call after window.onload. Abort!");
            return;
        }

        this._descText = {
            success: [
                "<div>플레이 토큰 획득!</div>",
                "<div><div class='round-box token big ani-css'><div class='hi-token-inline ani-css'></div><div class='amount ani-css'></div></div></div>"
            ],
            not_login: [
                "<div>토큰<div class='hi-token-inline'></div>은</div>",
                "<div>로그인 상태에서만</div>",
                "<div>획득됩니다.</div>"
            ],
            body: [
                "<div>토큰을 획득해서<br><span class='highlight'>랭킹전</span>에 참여하세요!</div>",
                "<div class='have-token small'><span>소지 토큰 : </span><div class='hi-token-inline'></div><span class='amount'></span></div>"
            ]
        };
        this.testVal = {
            status : ["fail", "success", "not_login"],
            amount : [1]
        }

        this.DOM.mainPopup = document.createElement("div");
        this.DOM.mainPopup.id = "token-popup";
        this.DOM.mainPopup.classList.add("hi-popup");
        h5Api.style.backScreen.appendChild(this.DOM.mainPopup);

        this.DOM.topImage = document.createElement("div");
        this.DOM.topImage.classList.add("hi-top-image");
        this.DOM.mainPopup.appendChild(this.DOM.topImage);

        this.DOM.successText = document.createElement("div");
        this.DOM.successText.classList.add("hi-text-success");
        this.DOM.successText.classList.add("hi-text-header");
        this.DOM.successText.innerHTML = this._descText.success.join("");
        this.DOM.mainPopup.appendChild(this.DOM.successText);
        
        this.DOM.notloginText = document.createElement("div");
        this.DOM.notloginText.classList.add("hi-text-fail");
        this.DOM.notloginText.classList.add("hi-text-header");
        this.DOM.notloginText.innerHTML = this._descText.not_login.join("");
        this.DOM.mainPopup.appendChild(this.DOM.notloginText);
        
        var bodyText = document.createElement("div");
        bodyText.classList.add("hi-text-body");
        bodyText.innerHTML = this._descText.body.join("");
        this.DOM.mainPopup.appendChild(bodyText);
        
        var buttonBox = document.createElement("div");
        buttonBox.classList.add("hi-button-box");
        this.DOM.mainPopup.appendChild(buttonBox);

        this.DOM.loginBtn = document.createElement("div");
        this.DOM.loginBtn.classList.add("hi-button");
        this.DOM.loginBtn.innerText = "로그인 하기";
        this.DOM.loginBtn.addEventListener("click", function(e) {
            parent.parent.location.href="/access?mode=login";
        }.bind(this));
        buttonBox.appendChild(this.DOM.loginBtn);

        this.DOM.submitBtn = document.createElement("div");
        this.DOM.submitBtn.classList.add("hi-button");
        this.DOM.submitBtn.innerText = "게임 계속하기";
        this.DOM.submitBtn.addEventListener("click", function(successText) {
            successText.querySelector(".hi-token-inline").classList.toggle("show-token");
            successText.querySelector(".round-box.token .amount").classList.toggle("show-token-amount");
            successText.querySelector(".round-box.token").classList.toggle("show-token-box");

            h5Api.style.backScreen.activePopup = null;

            if(typeof this.resumeGame == "function")    this.resumeGame();
            if(typeof this.sucsback == "function")      this.sucsback();
        }.bind(this, this.DOM.successText));
        buttonBox.appendChild(this.DOM.submitBtn);

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
            this.DOM.successText.querySelector(".round-box.token .amount").innerText = "+"+str;
        }

        if(data.status == "not_login") {
            this.DOM.successText.style.display = "none";
            this.DOM.notloginText.style.display = "block";

            this.DOM.loginBtn.style.display = "block";
            this.DOM.topImage.style.backgroundImage = "url("+h5Api.style.imageURI.bgNotlogin+")";
            this.DOM.submitBtn.classList.add("deactive");

            this.DOM.mainPopup.querySelector(".have-token").style.display = "none";
        }
        else if(data.status == "success") {
            this.DOM.notloginText.style.display = "none";
            this.DOM.successText.style.display = "block";

            this.DOM.loginBtn.style.display = "none";
            this.DOM.topImage.style.backgroundImage = "url("+h5Api.style.imageURI.bgSuccess+")";
            this.DOM.submitBtn.classList.remove("deactive");
            
            this.DOM.mainPopup.querySelector(".have-token").style.display = "inline-block";
            this.DOM.mainPopup.querySelector(".have-token .amount").innerText = data.remainToken || "-";

            this.DOM.successText.querySelector(".hi-token-inline").classList.toggle("show-token")
            this.DOM.successText.querySelector(".round-box.token .amount").classList.toggle("show-token-amount")
            this.DOM.successText.querySelector(".round-box.token").classList.toggle("show-token-box")
        }

        h5Api.style.backScreen.activePopup = "token-popup";
    }.bind(this)

    this.call = function(opt) {
        if(opt === undefined)                       opt = {}
        if (opt.env === undefined) {
            console.error("[h5Api.Token] call env argument is undefined");
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

        if(opt.env == "test-directory") {
            var testRtn = {
                status: this.testVal.status[ Math.floor(Math.random()*this.testVal.status.length) ],
                amount: this.testVal.amount[ Math.floor(Math.random()*this.testVal.amount.length) ]
            }
            console.log(testRtn);
            this._openPopup(testRtn);
        }else {
            var xhr = new XMLHttpRequest();
            // xhr.responseType = "json"; // It is not working in IE...
            xhr.open("GET", "/accumulation/call/gift/"+opt.env+"/"+opt.action);
            xhr.send(null);
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4) { // DONE
                    if (xhr.status === 200) { // OK
                        this._openPopup(JSON.parse(xhr.response));
                    }else { // ETC(404, 503 ..)
                        console.error("[h5Api.Token] Token xhrCall error: "+xhr.status+" "+xhr.statusText+" ("+xhr.responseURL+")");
                        if(typeof this.failback == "function") this.failback();
                    }
                }
            }.bind(this);
        }
    }.bind(this)
};