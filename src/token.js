h5Api.Token = new function() {
    this.DOM = {};
    this.init = function() {
        if(document.body === null || document.body === undefined) {
            console.error("[h5Api.Token] h5Api.Token must be call after window.onload. Abort!");
            return;
        }

        this._descText = {
            success: ["플레이 토큰 획득!"],
            not_login: [
                "토큰<div class='hi-token-inline'></div>은",
                "로그인 상태에서만",
                "획득됩니다."
            ],
            body: [
                "토큰을 획득해서",
                "<span class='highlight'>랭킹전</span>에 참여하세요!"
            ],
            submit: "게임 계속하기",
            login: "로그인 하기"
        };
        this.testVal = {
            status : ["fail", "success", "not_login"],
            amount : [1]
        }

        this.DOM.topImage = h5Api.createDOM({ tag: "div", class: "hi-top-image" });
        this.DOM.successText = h5Api.createDOM({
            tag: "div", class: ["hi-text-success", "hi-text-header"], child: [
                { tag: "div", innerHTML: this._descText.success.join("<br>") },
                { tag: "div", child: { tag: "div", class: ["round-box", "token", "big", "ani-css"], child: [
                    { tag: "div", class: ["hi-token-inline", "ani-css"] },
                    { tag: "div", class: ["amount", "ani-css"] },
                ]}}
            ]
        });
        this.DOM.successText.tDOM = this.DOM.successText.children[0];
        this.DOM.notloginText = h5Api.createDOM({
            tag: "div", class: ["hi-text-fail", "hi-text-header"], innerHTML: this._descText.not_login.join("<br>")
        });

        this.DOM.loginBtn = h5Api.createDOM({ tag: "div", class: "hi-button", value: this._descText.login });
        this.DOM.loginBtn.addEventListener("click", function(e) {
            parent.parent.location.href="/access?mode=login";
        }.bind(this));

        this.DOM.submitBtn = h5Api.createDOM({ tag: "div", class: "hi-button", value: this._descText.submit });
        this.DOM.submitBtn.addEventListener("click", function(successText) {
            successText.querySelector(".hi-token-inline").classList.toggle("show-token");
            successText.querySelector(".round-box.token .amount").classList.toggle("show-token-amount");
            successText.querySelector(".round-box.token").classList.toggle("show-token-box");

            h5Api.style.backScreen.activePopup = null;

            if(typeof this.resumeGame == "function")    this.resumeGame();
            if(typeof this.sucsback == "function")      this.sucsback();
        }.bind(this, this.DOM.successText));
        

        this.DOM.mainPopup = h5Api.createDOM({
            tag: "div", id: "token-popup", class: "hi-popup", child: [
                this.DOM.topImage,
                this.DOM.successText,
                this.DOM.notloginText,
                { tag: "div", class: "hi-text-body", child: [
                    { tag: "div", innerHTML: this._descText.body.join("<br>") },
                    { tag: "div", class: ["have-token", "small"], child: [
                        { tag: "span", value: "소지 토큰 : " },
                        { tag: "div", class: "hi-token-inline" },
                        { tag: "span", class: "amount" }
                    ]}
                ]},
                { tag: "div", class: "hi-button-box", child: [this.DOM.loginBtn, this.DOM.submitBtn] }
            ]
        });
        h5Api.style.backScreen.appendChild(this.DOM.mainPopup);

        return this;
    }.bind(this)


    this.openPopup = function(data) { // console.log(data);
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
            h5Api.data.remainToken += data.amount;
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

            if(data.message === undefined)  data.message = this._descText.success.join("<br>");
            this.DOM.successText.tDOM.innerHTML = data.message;
                
            if(data.submitText === undefined)   data.submitText = this._descText.submit;
            this.DOM.submitBtn.innerHTML = data.submitText;

            this.DOM.loginBtn.style.display = "none";
            this.DOM.topImage.style.backgroundImage = "url("+h5Api.style.imageURI.bgSuccess+")";
            this.DOM.submitBtn.classList.remove("deactive");
            
            this.DOM.mainPopup.querySelector(".have-token").style.display = "inline-block";
            this.DOM.mainPopup.querySelector(".have-token .amount").innerText = h5Api.data.remainToken || "-";

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
            this.openPopup(testRtn);
        }else {
            var xhr = new XMLHttpRequest();
            // xhr.responseType = "json"; // It is not working in IE...
            xhr.open("GET", "/accumulation/call/gift/"+opt.env+"/"+opt.action);
            xhr.send(null);
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4) { // DONE
                    if (xhr.status === 200) { // OK
                        try {
                            this.openPopup(JSON.parse(xhr.response));
                        } catch (error) {
                            var errCode = "h5Api.Token";
                            var message = "response parse error: "+h5Api.b64EncodeUnicode(xhr.response)+" ("+xhr.responseURL+")";
                        }
                    }else { // ETC(404, 503 ..)
                        var errCode = "h5Api.Token";
                        var message = "xhrCall error: "+xhr.status+" "+xhr.statusText+" ("+xhr.responseURL+")";
                    }
                    if(errCode) {
                        var errXhr = new XMLHttpRequest();
                        errXhr.open("POST", "https://api.hifivegame.com/error.php");
                        errXhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                        errXhr.send("code="+errCode+"&message="+message);
    
                        if(typeof this.failback == "function") this.failback();
                        console.error("["+errCode+"] "+message);
                    }
                }
            }.bind(this);
        }
    }.bind(this)
};