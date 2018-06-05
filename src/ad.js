gdApi.Ad = function (adUrl, opt) {
    if(document.body === null || document.body === undefined) {
        console.error("new gdApi.Ad must be call after window.onload");
        return;
    }
    if (adUrl === undefined)  console.error("adUrl is not defined. Abort!");
    else                      this.adUrl = adUrl;
  
    if (opt === undefined)    opt = {};
    if (opt.title)            this.title = opt.title;
    else                      this.title = "GAME START";
    if (opt.image)            this.image = opt.image;
    if (opt.limit)            this.adPlayLimit = opt.limit;
    else                      this.adPlayLimit = -1; // 무한
    if (opt.time)             this.adAgainTime = opt.time;
    else                      this.adAgainTime = 1; // 즉시
    
    // 카울리 및 타 광고플랫폼 대응
    this.otherAd = opt.otherAd;
  
    var styleDOM = document.createElement("style");
    styleDOM.innerText = this._styleText.join(" ");
    document.body.appendChild(styleDOM);
  
    this.adsManager;
    this.adsLoader;
    this.adDisplayContainer;
    this.intervalTimer;
  
    this.adPlayCount = 0;
    this.lastAdTime = this.adAgainTime;
  
    // 구글 IMA
    if(this.otherAd === undefined) {
        if(window.google === undefined || window.google.ima === undefined) {
            // 스크립트 동적 로드
            var script = document.createElement("script");
            script.type = "text/javascript";
            if (script.readyState){  //IE
                script.onreadystatechange = function(){
                    if (script.readyState == "loaded" || script.readyState == "complete"){
                        script.onreadystatechange = null;
                        this._initAdsense();
                    }
                }.bind(this);
            } else {  //Others
                script.onload = this._initAdsense.bind(this);
            }
            script.src = "//s0.2mdn.net/instream/html5/ima3.js";
            document.getElementsByTagName("head")[0].appendChild(script);
        }

    // 카울리 및 타 광고플랫폼 대응
    }else if(this.otherAd == "cauly") {
        // 기존에 로드한 스크립트가 없을 경우 동작
        if(window.CaulyAds === undefined) {
            // 스크립트 동적 로드
            var script = document.createElement("script");
            script.type = "text/javascript";
            if (script.readyState){  //IE
                script.onreadystatechange = function(){
                    if (script.readyState == "loaded" || script.readyState == "complete"){
                        script.onreadystatechange = null;
                        // this._caulyCallback.bind(this);
                    }
                }.bind(this);
            } else {  //Others
                // script.onload = this._caulyCallback.bind(this);
            }
            script.src = "https://image.cauly.co.kr/websdk/common/lasted/ads.min.js";
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    }
};
  
gdApi.Ad.prototype._initAdsense = function () {
    if(document.querySelector("body #mainContainer") !== null) {
        this.mainContainer  = document.querySelector("body #mainContainer");
        this.adVideo        = document.querySelector("body #mainContainer #adVideo");
        this.adContainer    = document.querySelector("body #mainContainer #adContainer");
    }else {
        this.mainContainer = document.createElement('div');
        this.mainContainer.id = "mainContainer";
        window.addEventListener("resize", function () {
        if (this.adsManager)
            this.adsManager.resize(window.innerWidth, window.innerHeight, google.ima.ViewMode.FULLSCREEN);
        }.bind(this));
        document.getElementsByTagName('body')[0].appendChild(this.mainContainer);
        this.adVideo = document.createElement('video');
        this.adVideo.style.width = window.innerWidth;
        this.adVideo.style.height = window.innerHeight;
        this.adVideo.id = "adVideo";

        this.mainContainer.appendChild(this.adVideo);

        this.adContainer = document.createElement('div');
        this.adContainer.id = "adContainer";
        this.adContainer.style.width = window.innerWidth;
        this.adContainer.style.height = window.innerHeight;
        this.mainContainer.appendChild(this.adContainer);
    }

    google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
    // google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.INSECURE);
    this.adDisplayContainer = new google.ima.AdDisplayContainer(this.adContainer, this.adVideo);   

    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
    this.adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this._onAdsManagerLoaded.bind(this), false
    );
    this.adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this._onAdError.bind(this), false
    );
};

gdApi.Ad.prototype.run = function (opt) {
    if (opt === undefined)                      opt = {};
    if (typeof opt.success === "function")      this.callback = opt.success;
    else                                        this.callback = null;
    if (typeof opt.fail === "function")         this.failback = opt.fail;
    else                                        this.failback = null;
    if (typeof opt.pauseGame === "function")    this.pauseGame = opt.pauseGame;
    else                                        this.pauseGame = null;
    if (typeof opt.resumeGame === "function")   this.resumeGame = opt.resumeGame;
    else                                        this.resumeGame = null;
    
    if(Date.now() - this.lastAdTime <= this.adAgainTime)                      return;
    else if (this.adPlayLimit != -1 && this.adPlayCount >= this.adPlayLimit)  return;
    
  
    
    // 카울리 및 타 광고플랫폼 대응
    if(this.otherAd == undefined) {
        if(window.google !== undefined && window.google.ima !== undefined) {
            // 인터벌 유무 체크
            if(this._resendInterval !== undefined) {
                clearInterval(this._resendInterval);
                delete this._resendInterval;
            }

            this.lastAdTime = Date.now();
            this.mainContainer.style.display = "block";
            
            if (typeof this.pauseGame === "function")  this.pauseGame();

            // 아래는 초기화 부분이 아닌 광고 호출 부분
            // Must be done as the result of a user action on mobile
            this.adDisplayContainer.initialize();
        
            var adsRequest = new google.ima.AdsRequest();
            adsRequest.adTagUrl = this.adUrl;
        
            adsRequest.linearAdSlotWidth = window.innerWidth;
            adsRequest.linearAdSlotHeight = window.innerHeight;
        
            adsRequest.nonLinearAdSlotWidth = window.innerWidth;
            adsRequest.nonLinearAdSlotHeight = window.innerHeight;
            adsRequest.setAdWillAutoPlay(true);
            adsRequest.setAdWillPlayMuted(true);
        
            this.adsLoader.requestAds(adsRequest);

        // 아직 JS 로드 안되어있으면 조금 이후에 재실행
        }else if(this._resendInterval === undefined){
            this._resendInterval = setInterval(function() {
                this.run(opt);
            }.bind(this), 200);
        }
    }else if(this.otherAd == "cauly") {
        if(window.CaulyAds !== undefined) {
            // 카울리 창 올라와 있을 때에는 리턴
            if(document.querySelectorAll("body .caulyDisplay").length !== 0) {
              var rtn = [].slice.call(document.querySelectorAll("body .caulyDisplay iframe")).some(function(e, i, a) {
                return (window.getComputedStyle(e).display == "block")
              });
              if(rtn === true) return;
            }
            
            // 인터벌 유무 체크
            if(this._resendInterval !== undefined) {
                clearInterval(this._resendInterval);
                delete this._resendInterval;
            }

            this.lastAdTime = Date.now();
    
            // wrap DOM 체크 및 생성
            if(document.querySelector("body #caulyDisplay-"+this.adUrl) !== null) {
                document.body.removeChild(this.mainContainer);
            }
            this.mainContainer = document.createElement('div');
            this.mainContainer.id = "caulyDisplay-"+this.adUrl;
            this.mainContainer.classList.add("caulyDisplay");
            document.getElementsByTagName('body')[0].appendChild(this.mainContainer);
            
            this.cauly_ads = new CaulyAds({
                app_code: this.adUrl,
                placement: 1,
                displayid: "caulyDisplay-"+this.adUrl,
                passback: function (e) { console.log("passback", this.adUrl);
                    if (typeof this.failback === "function")    this.failback();
                }.bind(this),
        
                success: function (e) { console.log("success", this.adUrl);
                    if (typeof this.callback === "function")    this.callback();
                }.bind(this)
            });
            
            this.cauly_ads.showPopup();
    
        // 아직 JS 로드 안되어있으면 조금 이후에 재실행
        }else if(this._resendInterval === undefined){
            this._resendInterval = setInterval(function() {
                this.run(opt);
            }.bind(this), 200);
        }
    }
};
  
gdApi.Ad.prototype._ad = function () {
    
    if (gdApi.isMobile) {
        this.mainContainer.removeChild(document.getElementById('adGametitle'));
        this.mainContainer.removeChild(document.getElementById('adPlayImage'));
        this.mainContainer.removeChild(document.getElementById('adBackground'));
        this.mainContainer.removeChild(document.getElementById('adBackgroundBlur'));
        if (document.getElementById('adGameImage'))
            this.mainContainer.removeChild(document.getElementById('adGameImage'));
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "black";
    }
    try {
        this.adsManager.init(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
        this.adsManager.start();
        this.adPlayCount++;
    } catch (adError) {
        // 광고 실패 혹은 끝 픽시 다시 켜주기
    }
};
  
gdApi.Ad.prototype._onAdsManagerLoaded = function(adsManagerLoadedEvent) {
    console.log("_onAdsManagerLoaded")
  
    // Get the ads manager.
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  
    // videoContent should be set to the content video element.
    this.adsManager = adsManagerLoadedEvent.getAdsManager(
        this.adVideo,
        adsRenderingSettings
    );
  
    // Add listeners to the required events.
    var events = [
        { evt: google.ima.AdErrorEvent.Type.AD_ERROR,             fnc: this._onAdError },
        { evt: google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,   fnc: this._onContentPauseRequested },
        { evt: google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,  fnc: this._onContentResumeRequested },
        { evt: google.ima.AdEvent.Type.ALL_ADS_COMPLETED,         fnc: this._onAdEvent },
        { evt: google.ima.AdEvent.Type.SKIPPED,                   fnc: this._onAdEvent },
        { evt: google.ima.AdEvent.Type.USER_CLOSE,                fnc: this._onAdEvent },
        // Listen to any additional events, if necessary.
        { evt: google.ima.AdEvent.Type.LOADED,                    fnc: this._onAdEvent },
        { evt: google.ima.AdEvent.Type.STARTED,                   fnc: this._onAdEvent },
        { evt: google.ima.AdEvent.Type.COMPLETE,                  fnc: this._onAdEvent },
        { evt: google.ima.AdEvent.Type.CLICK,                     fnc: this._onAdEvent }
    ]
    events.forEach(function(item,idx,arr) {
        this.adsManager.addEventListener(item.evt, item.fnc.bind(this));
    }.bind(this));
  
  
    if (!gdApi.isMobile)
        this._ad();
    else {
        var smallRatio = Math.min(
            window.innerWidth / window.innerHeight,
            window.innerHeight / window.innerWidth
        );
  
        var background = document.createElement('div');
        background.id = "adBackground";
        this.mainContainer.appendChild(background);
    
        var backgroundBlur = document.createElement('div');
        backgroundBlur.id = "adBackgroundBlur";
        this.mainContainer.appendChild(backgroundBlur);
    
        adPlayImage = document.createElement('div'); // img
        adPlayImage.id = "adPlayImage";
        adPlayImage.style.width = (128 * smallRatio);
        adPlayImage.style.height = (128 * smallRatio);
        adPlayImage.addEventListener("click", this._ad.bind(this));
        this.mainContainer.appendChild(adPlayImage);
    
        var title = document.createElement('p');
        title.id = "adGametitle";
        title.innerHTML = this.title;
        title.style.fontSize = (35 * smallRatio);
        this.mainContainer.appendChild(title);
  
        if (this.image) {
            background.style.filter = "blur(5px)";
            var image = document.createElement('img');
            image.id = "adGameImage";
            image.src = this.image
            background.style.backgroundImage = "url('" + this.image + "')";
            image.style.width = (128 * smallRatio);
            image.style.height = (128 * smallRatio);
            this.mainContainer.appendChild(image);
        }
    }
};
  
gdApi.Ad.prototype._onAdEvent = function(adEvent) {
    var ad = adEvent.getAd();
    switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
            if (!ad.isLinear()) {
            // 광고 실패 혹은 끝 픽시 다시 켜주기
            }
            break;
        case google.ima.AdEvent.Type.STARTED:
            if (ad.isLinear()) {
                this.intervalTimer = setInterval(function () {
                    var remainingTime = this.adsManager.getRemainingTime();
                }.bind(this), 300); // every 300ms
            }
            break;
        case google.ima.AdEvent.Type.COMPLETE:
        case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
        case google.ima.AdEvent.Type.SKIPPED:
        case google.ima.AdEvent.Type.USER_CLOSE:
            if (ad.isLinear()) {
                clearInterval(this.intervalTimer);
            }
            this.adsManager.destroy();
            this.mainContainer.style.display = "none";
    
            if (typeof this.resumeGame === "function")  this.resumeGame();
            if (typeof this.callback === "function")    this.callback();

            break;
    }
};
  
gdApi.Ad.prototype._onAdError = function(adErrorEvent) {
    console.warn(adErrorEvent);
    if (this.adsManager !== undefined)
        this.adsManager.destroy();

    this.mainContainer.style.display = "none";

    if (typeof this.resumeGame === "function")  this.resumeGame();
    if (typeof this.failback === "function")    this.failback();
};
  
gdApi.Ad.prototype._onContentPauseRequested = function() {};

gdApi.Ad.prototype._onContentResumeRequested = function() {};

gdApi.Ad.prototype._styleText = [
    "body #mainContainer {",
        "position: absolute;",
        "top: 0px;",
        "left: 0px;",
        "width: 100%;",
        "height: 100%;",
        "display: none",
    "}",
    "body #mainContainer #adVideo {",
        "position: absolute;",
        "top: 0px;",
        "left: 0px;",
    "}",
    "body #mainContainer #adContainer {",
        "position: absolute;",
        "top: 0px;",
        "left: 0px;",
    "}",
    "body #mainContainer #adBackground {",
        "position: absolute;",
        "top: 0px;",
        "left: 0px;",
        "width: 100%;",
        "height: 100%;",
        "background-image: url(data:image/jpeg;base64,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);",
        "background-size: cover;",
        "background-position: center;",
    "}",
    "body #mainContainer #adBackgroundBlur {",
        "position: absolute;",
        "top: 0px;",
        "left: 0px;",
        "width: 100%;",
        "height: 100%;",
        "background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYlWP8//+/LwMRgIkYRaMKqacQAE8/A168CUghAAAAAElFTkSuQmCC);",
        "background-size: cover;",
        "background-position: center;",
    "}",
    "body #mainContainer #adPlayImage {",
        "position: absolute;",
        "left: 50%;",
        "top: 50%;",
        "transform: translate3d(-50%, -50% , 0);",
        "-o-transform: translate3d(-50%, -50% , 0);", // Opera
        "-ms-transform: translate3d(-50%, -50% , 0);", // IE 9
        "-moz-transform: translate3d(-50%, -50% , 0);", // Firefox
        "-webkit-transform: translate3d(-50%, -50% , 0);", // Safari and Chrome
        "background-image: url(data:image/png;base64,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);",
        "background-size: cover;",
        "background-position: center;",
    "}",
    "body #mainContainer #adGametitle {",
        "position: absolute;",
        "top: 35%;",
        "left: 50%;",
        "color: white;",
        "text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;",
        "transform: translate3d(-50%, -50% , 0);",
        "-o-transform: translate3d(-50%, -50% , 0);", // Opera
        "-ms-transform: translate3d(-50%, -50% , 0);", // IE 9
        "-moz-transform: translate3d(-50%, -50% , 0);", // Firefox
        "-webkit-transform: translate3d(-50%, -50% , 0);", // Safari and Chrome
    "}",
    "body #mainContainer #adGameImage {",
        "position: absolute;",
        "top: 27%;",
        "left: 50%;",
        "background-size: cover;",
        "transform: translate3d(-50%, -50% , 0);",
        "-o-transform: translate3d(-50%, -50% , 0);", // Opera
        "-ms-transform: translate3d(-50%, -50% , 0);", // IE 9
        "-moz-transform: translate3d(-50%, -50% , 0);", // Firefox
        "-webkit-transform: translate3d(-50%, -50% , 0);", // Safari and Chrome
    "}"
];