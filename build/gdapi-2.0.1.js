/*
 * build date : 2018-07-17 16:01:01
 */
window.gdApi = new function() {
  this._isInit = "notSet";

  this.isMobile = function () {
    var check = false;
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|ipad|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }();

  this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  this._loadScript = function(url, callback, seq){
    if(url.constructor == Array) {
      if(url.length == 0) { callback(); return; }
      if(seq === undefined) seq = 0;
      if(url[seq+1] !== undefined)  callback = this._loadScript.bind(this, url, callback, (seq+1));

      url = url[seq];
    }
    var script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" || script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  // Adcode 관련 초기화
  this.adList = {};
  this._adcodeCallback = function(json) { this.adcode = json; };
  this._getAdcode = function(codeCallback, codeUrl) {
    if(codeCallback === undefined)  console.error("[gdApi] getCode param(codeCallback) is undefined");
    else {
      // _getAdcode 사용 시 _adcodeCallback 재선언
      this._adcodeCallback = function(callback, json) {
        this.adcode = json;
        callback(json);
      }.bind(this, codeCallback);
    }
    if(codeUrl === undefined) {
        codeUrl = '//api.5gamedom.com/adcode.php?callback=gdApi._adcodeCallback';
    }
    var script = document.createElement('script');
    script.src = codeUrl;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  // gdApi.data 게임정보 초기화
  try {
    throw JSON.stringify(window.parent.gameData);
  } catch(e) {
    if(e === undefined || e.name == "TypeError") {
      // console.error("[gdApi.run] GameData was undefined or TypeError. Abort!");
      // return;
      this.data = {};
    }else {
      this.data = JSON.parse(e);
    }
  }
  if(this.data.gn === undefined)  this.data.gn = "0";
  if(this.data.gt === undefined)  this.data.gt = "TEST GAME";
  if(this.data.gi === undefined)  this.data.gi = "../img/icon.jpg";
  if(this.data.gd === undefined)  this.data.gd = "test-directory";
  // TODO : 테스트모드 warn 세팅

  // gdApi.data 채널명 초기화
  this.data.cn = document.domain.split(".")[0];
  this.data.cn = (this.data.cn == "dev" || this.data.cn == "platform") ? "app" : this.data.cn;


  // gdApi._prevOnload =  window.onload || null;
  this.init = function(opt) {

    // argument 검증
    if(opt === undefined)                         opt = {};
    if (typeof opt.pauseGame === "function")    this.pauseGame = opt.pauseGame;
    else                                        var udfArg = "opt.pauseGame";
    if (typeof opt.resumeGame === "function")   this.resumeGame = opt.resumeGame;
    else                                        var udfArg = "opt.resumeGame";
    // if(opt.type === undefined)     var udfArg = "opt.type";
    if(udfArg) {
      console.error("[gdApi.run] "+udfArg+" was undefined. Abort!");
      return false;
    }

    if(this._isInit === "domReady") {
      console.log("[gdapi] Initializing...");
      // gdApi 초기화
      this.Point.init();
      this._loadScript([
        "//api.5gamedom.com/adcode.php?callback=gdApi._adcodeCallback",
        "//s0.2mdn.net/instream/html5/ima3.js"
      ], function() {
        this.adList.normal = new this.Ad(
          this.adcode.ad.normal[gdApi.data.cn].replace("[gn]", gdApi.data.gn),
          {
            title: gdApi.data.gt,
            image: gdApi.data.gi,
            time : this.adcode.adTime,
          }
        );

        // gdApi 관련 처리 끝낸 후 기존 window.onload 호출
        // if(typeof gdApi._prevOnload == "function")  gdApi._prevOnload();

        this._isInit = "complete";
      }.bind(this));

    }else {
      setTimeout(function() {
        this.init(
          Object.assign({ retry: true }, opt)
        );
      }.bind(this), 200);
    }
  }

  this.run = function(opt) {
    // argument 검증
    if(opt === undefined)                         opt = {};
    if (typeof opt.pauseGame === "function")    var runPauseGame = opt.pauseGame;
    else                                        var runPauseGame = this.pauseGame;
    if (typeof opt.resumeGame === "function")   var runResumeGame = opt.resumeGame;
    else                                        var runResumeGame = this.resumeGame;
    
    if(this._isInit === "complete") {
      // 우선 normal, reward 구분 없이 로드
      this.adList.normal.run({
        pauseGame: runPauseGame,
        resumeGame: runResumeGame,
        success: function () {
          this.Point.call({
            env: this.data.gd,
            pauseGame: runPauseGame,
            resumeGame: runResumeGame
          });
        }.bind(this),
        fail: function () {}
      })
  
    // 아직 _isInit 로드 안되어있으면 조금 이후에 재실행
    }else {
      setTimeout(function() {
        this.run(
          Object.assign({ retry: true }, opt)
        );
      }.bind(this), 200);
    }
  }
}
gdApi.Ad = function (adUrl, opt) {
    if(document.body === null || document.body === undefined) {
        console.error("[gdApi.Ad] new gdApi.Ad must be call after window.onload. Abort!");
        return;
    }
    if (adUrl === undefined)  console.error("[gdApi.Ad] adUrl is not defined. Abort!");
    else                      this.adUrl = adUrl;
  
    if (opt === undefined)    opt = {};
    if (opt.title)            this.title = opt.title;
    if (opt.image)            this.image = opt.image;
    if (opt.limit)            this.adPlayLimit = opt.limit;
    else                      this.adPlayLimit = -1; // 무한
    if (opt.time)             this.adAgainTime = opt.time;
    else                      this.adAgainTime = 1; // 즉시
    
    // 카울리 및 타 광고플랫폼 대응
    // this.otherAd = opt.otherAd;
    
    this.adsManager;
    this.adsLoader;
    this.adDisplayContainer;
    this.intervalTimer;
  
    this.adPlayCount = 0;
    this.lastAdTime = this.adAgainTime;
    
    this._initAdsense();
};

gdApi.Ad.prototype._initAdsense = function () {
    if(document.querySelector("body #adWrapper") !== null) {
        this.adWrapper  = document.querySelector("body #adWrapper");
        this.adPlayImage  = document.querySelector("body #adWrapper #adPlayImage");
    }else if(gdApi.isMobile) { //모바일일 경우에만 Wrapper 생성
        this.adWrapper = document.createElement('div');
        this.adWrapper.id = "adWrapper";
        document.body.appendChild(this.adWrapper);

        var background = document.createElement('div');
        background.id = "adBackground";
        this.adWrapper.appendChild(background);
  
        var adMobileCover = document.createElement('div');
        adMobileCover.id = "adMobileCover";
        this.adWrapper.appendChild(adMobileCover);
        
        if (this.image) {
          this.adWrapper.style.backgroundColor = "#535353";
          background.style.filter = "blur(25px)";
          background.style.backgroundImage = "url('" + this.image + "')";
  
          var image = document.createElement('img');
          image.id = "adGameImage";
          image.src = this.image;
          adMobileCover.appendChild(image);
        }
        
        this.adPlayImage = document.createElement('div'); // img
        this.adPlayImage.id = "adPlayImage";
        adMobileCover.appendChild(this.adPlayImage);
    }

    this.adMainContainer = document.createElement('div');
    this.adMainContainer.classList.add("adMainContainer");
    window.addEventListener("resize", function () {
    if (this.adsManager)
        this.adsManager.resize(window.innerWidth, window.innerHeight, google.ima.ViewMode.FULLSCREEN);
    }.bind(this));
    document.body.appendChild(this.adMainContainer);

    this.adVideo = document.createElement('video');
    this.adVideo.style.width = window.innerWidth+"px";
    this.adVideo.style.height = window.innerHeight+"px";
    this.adVideo.classList.add("adVideo");
    if(gdApi.isIOS) {
        // see https://developers.google.com/interactive-media-ads/docs/sdks/html5/skippable-ads
        this.adVideo.setAttribute("playsinline","");
    }
    this.adMainContainer.appendChild(this.adVideo);

    this.adContainer = document.createElement('div');
    this.adContainer.classList.add("adContainer");
    this.adContainer.style.width = window.innerWidth+"px";
    this.adContainer.style.height = window.innerHeight+"px";
    this.adMainContainer.appendChild(this.adContainer);

    google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
    // google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.INSECURE);
    this.adDisplayContainer = new google.ima.AdDisplayContainer(this.adContainer, this.adVideo);   

    this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
    if(gdApi.isIOS) {
        // see https://developers.google.com/interactive-media-ads/docs/sdks/html5/skippable-ads
        this.adsLoader.getSettings().setDisableCustomPlaybackForIOS10Plus(true);
    }
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
    if (opt === undefined)                          opt = {};
    if(opt.retry !== true) {
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

        if (typeof this.pauseGame === "function")  this.pauseGame();
    }

    this.lastAdTime = Date.now();
    this.adMainContainer.style.display = "block";
    
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
};
  
gdApi.Ad.prototype._ad = function () {
    if (gdApi.isMobile) {
      this.adWrapper.style.display = "none";
      this.adMainContainer.style.backgroundColor = "black";
    }
    try {
      this.adsManager.init(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
      this.adsManager.start();
      this.adPlayCount++;
    } catch (adError) {
      debugger;
      console.error("[gdApi.Ad] ErrorCode "+adErrorEvent.h.h+" : "+adErrorEvent.h.l);
      
      this._resumeAfterAd();
      // 광고 실패 혹은 끝 픽시 다시 켜주기
    }
  };
  
gdApi.Ad.prototype._onAdsManagerLoaded = function(adsManagerLoadedEvent) {
    console.log("[gdApi.Ad] _onAdsManagerLoaded start")
  
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
        // adsManager 로드 후 버튼 생성해야 버튼 뜨자마자 클릭해도 문제 없음.
        this.adPlayImage.addEventListener("click", this._ad.bind(this));
        this.adPlayImage.style.opacity = 1;
        this.adWrapper.style.display = "block";
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
            if (ad.isLinear())  clearInterval(this.intervalTimer);
            
            this.adsManager.destroy();

            if (gdApi.isMobile) {
                this.adPlayImage.removeEventListener("click", this._ad);
                this.adPlayImage.style.opacity = 0;
                this.adWrapper.style.display = "none";
            }
            this.adMainContainer.style.display = "none";

            this._resumeAfterAd();
            break;
    }
};

gdApi.Ad.prototype._forceOpenCover = function() {
    this.adPlayImage.addEventListener("click", this._ad.bind(this));
    this.adPlayImage.style.opacity = 1;
    this.adWrapper.style.display = "block";
}
gdApi.Ad.prototype._resumeAfterAd = function() {

    if (typeof this.resumeGame === "function")  this.resumeGame();
    if (typeof this.failback === "function")    this.failback();

    // 풀슬롯 재생이었을 경우가 있으므로, false로 초기화
    if(this.isFullslot === true) {
        this.isFullslot = false;
        this.adUrl = this._originAdUrl;
        delete this._originAdUrl;
    }
}

gdApi.Ad.prototype._onAdError = function(adErrorEvent) {
    console.warn("[gdApi.Ad] ErrorCode "+adErrorEvent.h.h+" : "+adErrorEvent.h.l);
    
    if (this.adsManager !== undefined)  this.adsManager.destroy();

    if (gdApi.isMobile) {
        this.adPlayImage.removeEventListener("click", this._ad);
        this.adPlayImage.style.opacity = 0;
        this.adWrapper.style.display = "none";
    }
    this.adMainContainer.style.display = "none";

    if(this.isFullslot !== true) {
        this._originAdUrl = this.adUrl;
        this.adUrl = gdApi.adcode.ad.fullslot[gdApi.data.cn];
        this.isFullslot = true;
        this.run({ retry: true });
    }else {
        this._resumeAfterAd();
    }
};
  
gdApi.Ad.prototype._onContentPauseRequested = function() {};

gdApi.Ad.prototype._onContentResumeRequested = function() {};
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
gdApi.style = new function() {
    this.css = {
        ad: [
            "body .adMainContainer {",
                "position: absolute;",
                "top: 0px;",
                "left: 0px;",
                "width: 100%;",
                "height: 100%;",
                "background-color: black;",
                "z-index: 9998;",
                "display: none;",
                "}",
                "body .adMainContainer .adVideo {",
                "position: absolute;",
                "top: 0px;",
                "left: 0px;",
                "background-color: black",
                "}",
                "body #adMainContainer .adContainer {",
                "position: absolute;",
                "top: 0px;",
                "left: 0px;",
            "}",
        
            "body #adWrapper {",
                "position: absolute;",
                "top: 0px;",
                "left: 0px;",
                "width: 100%;",
                "height: 100%;",
                "background-color: black;",
                "z-index: 9999;",
                "display: none;",
            "}",
            "body #adWrapper #adBackground {",
                "position: absolute;",
                "top: 0px;",
                "left: 0px;",
                "width: 100%;",
                "height: 100%;",
                "opacity: .75;",
                "background-image: url([bgDefault]);",
                "background-size: cover;",
                "background-position: center;",
            "}",
            "body #adWrapper #adMobileCover {",  
                "width: 100%;",
                "position: relative;",
                "z-index: 2;",
                "padding: 30px 0;",
                "background: rgba(0,0,0,0.5);",
                "top: 50%;",
                "transform: translateY(-50%);",
                "-o-transform: translateY(-50%);",
                "-ms-transform: translateY(-50%);",
                "-moz-transform: translateY(-50%);",
                "-webkit-transform: translateY(-50%);",
                "transition: opacity 1s;",
                //   "opacity: 0;",
            "}",
            "#adMobileCover #adGameImage {",
                "position: relative;",
                "width: 192px;",
                "height: 192px;",
                "left: 50%;",
                "margin-bottom: 30px;",
                "transform: translateX(-50%);",
                "-o-transform: translateX(-50%);", // Opera
                "-ms-transform: translateX(-50%);", // IE 9
                "-moz-transform: translateX(-50%);", // Firefox
                "-webkit-transform: translateX(-50%);", // Safari and Chrome
            "}",
            "#adMobileCover #adPlayImage {",
                "position: relative;",
                "width: 65px;",
                "height: 65px;",
                "left: 50%;",
                "opacity: 0;",
                "transform: translateX(-50%);",
                "-o-transform: translateX(-50%);", // Opera
                "-ms-transform: translateX(-50%);", // IE 9
                "-moz-transform: translateX(-50%);", // Firefox
                "-webkit-transform: translateX(-50%);", // Safari and Chrome
                "border-radius: 50%;",
                "-webkit-box-shadow: 0 1px 0 0 rgba(0,0,0,0.75);",
                "box-shadow: 0 1px 0 0 rgba(0,0,0,0.75);",
                "background: rgba(90,213,186,1);",
                "background: -moz-linear-gradient(-45deg, rgba(90,213,186,1) 0%, rgba(91,203,249,1) 100%);", /* Old Browsers */
                "background: -webkit-gradient(left top, right bottom, color-stop(0%, rgba(90,213,186,1)), color-stop(100%, rgba(91,203,249,1)));", /* FF3.6+ */
                "background: -webkit-linear-gradient(-45deg, rgba(90,213,186,1) 0%, rgba(91,203,249,1) 100%);", /* Chrome, Safari4+ */
                "background: -o-linear-gradient(-45deg, rgba(90,213,186,1) 0%, rgba(91,203,249,1) 100%);", /* Chrome10+,Safari5.1+ */
                "background: -ms-linear-gradient(-45deg, rgba(90,213,186,1) 0%, rgba(91,203,249,1) 100%);", /* Opera 11.10+ */
                "background: linear-gradient(135deg, rgba(90,213,186,1) 0%, rgba(91,203,249,1) 100%);", /* IE 10+ */
                "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#5ad5ba', endColorstr='#5bcbf9', GradientType=1 );", /* W3C */
            "}",
            "#adMobileCover #adPlayImage:after {",
                "content: '';",
                "position: absolute;",
                "width: 0;",
                "height: 0;",
                "left: 26px;",
                "top: 21px;",
                "border: 13px solid transparent;",
                "border-left: 20px solid #fff;",
                "border-right: 0;",
            "}"
        ],
        point: [
            // "body {",
            //     "@media only screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 2) {",
            //         "font-size: 24px;",
            //     "}",
            // "}",
            "#gd-backScreen * {",
                "box-sizing: unset;",
            "}",
            "#gd-backScreen {",
                "position: absolute;",
                "top: 0px;",
                "left: 0px;",
                "width: 100%;",
                "height: 100%;",
                "background: rgba(0, 0, 0, 0.4);",
                "z-index: 9999;",
                "display: none;",
            "}",
            "#gd-popup {",
                "position: absolute;",
                "left: 50%;",
                "top: 50%;",
                "color: black;",
                "transform: translate(-50%, -50%);",
                "-webkit-transform: translate(-50%, -50%);",
                "-moz-transform: translate(-50%, -50%);",
                "-o-transform: translate(-50%, -50%);",
                "max-width: 100%;",
                "max-height: 100%;",
                "width: 300px;",
                "height: 424px;",
                "background-color: white;",
                // "min-width: 300px;",
                // "background-image: url([bgSuccess]);",
                "background-repeat: no-repeat;",
                "background-size: unset;",
            "}",
            "#gd-corner-tag {",
                "position: absolute;",
                "width: 0;",
                "height: 0;",
                "border-top: 70px solid #62BFE8;", // old: 70d4f1
                "border-right: 70px solid transparent;",
            "}",
            "#gd-corner-tag > span {",
                "position: absolute;",
                "top: -66px;",
                "left: 16px;",
                "transform: rotate(45deg);",
                "-webkit-transform: rotate(45deg);",
                "-moz-transform: rotate(45deg);",
                "-o-transform: rotate(45deg);",
                "color: white;",
                "font-size: .9rem;",
                "font-weight: 600;",
            "}",
            ".gd-text-header {",
                "text-align: left;",
                "padding: 0px 22px;",
                "font-size: 1.5rem;",
                "font-weight: 400;",
                "margin: 46px 0px 10px 0px;",
            "}",
            ".gd-text-body {",
                "text-align: center;",
                "font-size: 0.8rem;",
                "font-weight: 600;",
                "position: absolute;",
                "width: 100%;",
                "left: 0px;",
                // "display: inline-block;",
                // "word-wrap: break-word;",
                // "word-break: keep-all;",
            "}",
            "#gd-text-success .gd-text-body {",
                "bottom: 100px;",
            "}",
            "#gd-text-notlogin .gd-text-body {",
                "bottom: 159px;",
            "}",
            ".gd-text-header .bigsize {",
                "font-size: 2.3rem;",
                "font-weight: 600;",
            "}",
            ".gd-text-header .gd-bold-blue {",
                "color: #70d4f1;",
                "font-weight: 600;",
            "}",
    
            ".gd-coin {",
                "position: relative;",
                "top: 1px;",
                "padding-left: 30px;",
                "background-size: contain;",
                "background-repeat: no-repeat;",
                "background-image: url([coin]);",
            "}",
    
            ".gd-button#gd-login {",
                "bottom: 100px",
            "}",
            ".gd-button {",
                "position: absolute;",
                "width: 127px;",
                "height: 36px;",
                "left: 0;",
                "right: 0;",
                "bottom: 41px;",
                "margin: auto;",
                "padding-top: 14px;",
                "padding-left: 40px;",
                "color: white;",
                "text-align: center;",
                "cursor: pointer;",
                "background-repeat: no-repeat;",
                "background-size: contain;",
                "background-image: url([button]);",
            "}"
        ]
    };
    
    this.imageURI = {
        bgDefault: 
            "data:image/jpeg;base64,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",
        bgSuccess:
            "data:image/png;base64,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",
        bgNotlogin:
            "data:image/png;base64,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",
        button:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARQAAABTCAYAAABeWvgZAAAACXBIWXMAAC4jAAAuIwF4pT92AABDvmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwNjcgNzkuMTU3NzQ3LCAyMDE1LzAzLzMwLTIzOjQwOjQyICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDE4LTAzLTA5VDE4OjIzOjEwKzA5OjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMTgtMDMtMjlUMDM6MDU6MzIrMDk6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDE4LTAzLTI5VDAzOjA1OjMyKzA5OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjM1MWNkY2M1LWZiOWMtNTg0Ny04ODY5LTg1MmFlYzE1NTFhZTwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjk0MGQ4OWNhLTMyYjItMTFlOC05NGI4LWEzM2VhMjEzMDBlNzwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD54bXAuZGlkOjkzNmYzZWNjLThiOGQtZWM0Zi05ZWQ0LTgwZDIwNjk1NDkyODwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmNyZWF0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDo5MzZmM2VjYy04YjhkLWVjNGYtOWVkNC04MGQyMDY5NTQ5Mjg8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTgtMDMtMDlUMTg6MjM6MTArMDk6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmNvbnZlcnRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6cGFyYW1ldGVycz5mcm9tIGltYWdlL3BuZyB0byBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wPC9zdEV2dDpwYXJhbWV0ZXJzPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDphMTg0MzQ0MC0wNDJhLWU3NGQtOWU3Ny0zOGZiN2M5N2M2NjQ8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTgtMDMtMDlUMTg6NDI6NDcrMDk6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6MWZmZGMwMzMtMTA3Yy0wMzQ4LTgxZDEtM2I1OTEyZmRiYzMwPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE4LTAzLTA5VDE4OjQ1OjIyKzA5OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jb252ZXJ0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+ZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZzwvc3RFdnQ6cGFyYW1ldGVycz4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmRlcml2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+Y29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmc8L3N0RXZ0OnBhcmFtZXRlcnM+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjA4NGE3ODgxLTY4MjctZTc0Ny1iMjMwLWRmYmEwMDMyNWZmMjwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxOC0wMy0wOVQxODo0NToyMiswOTowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICAgICA8c3RFdnQ6Y2hhbmdlZD4vPC9zdEV2dDpjaGFuZ2VkPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDozNTFjZGNjNS1mYjljLTU4NDctODg2OS04NTJhZWMxNTUxYWU8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTgtMDMtMjlUMDM6MDU6MzIrMDk6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8eG1wTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICA8c3RSZWY6aW5zdGFuY2VJRD54bXAuaWlkOjFmZmRjMDMzLTEwN2MtMDM0OC04MWQxLTNiNTkxMmZkYmMzMDwvc3RSZWY6aW5zdGFuY2VJRD4KICAgICAgICAgICAgPHN0UmVmOmRvY3VtZW50SUQ+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjM1MmM0ODIyLTIzN2UtMTFlOC1hYzY3LWFlNTU5OGU2YjYyYjwvc3RSZWY6ZG9jdW1lbnRJRD4KICAgICAgICAgICAgPHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD54bXAuZGlkOjkzNmYzZWNjLThiOGQtZWM0Zi05ZWQ0LTgwZDIwNjk1NDkyODwvc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8L3htcE1NOkRlcml2ZWRGcm9tPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj4zMDAwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj4zMDAwMDAwLzEwMDAwPC90aWZmOllSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4yPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8ZXhpZjpDb2xvclNwYWNlPjY1NTM1PC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4yNzY8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+ODM8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PvXNhfwAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAADChJREFUeNrsnU9sGlcex78PYwcwrWnMLj44LitVsg+VYkuRdpVUKpWaa+1j99RsuVZqe8kel15z8mp7xZucklttX9PD5OCqh0qmqx5sKdIS2ysZLc7iBAO2B88e5g0Bwp8Z8wYP8P1IozgwDI+Zed/5vd/v935PGIYBL5DUcnEAcQCLACLy5QiAxfDYywgIGWHOjGDl7CJYAaDVvZyVWyadiBW80E5xVYKS1HIJANb2MW8ZQnriBYCMFBwtnYhlhlpQklouAmBFbsu8/oS4LjAagIfpREwbGkGRQ5mUFJIpXmdCrkRcVqW4uDo0ck1Q5JAmxeEMIZ7hGMA6gFQ6EcsOhKBIi+QhhYQQTwvLKoBV1RaLMkGRPpJvAPyN14uQgRGWe9JqaUk6EXN0QJ/C4U2GYkLIQDEF4AcpKBFPWChJLZeikBAyFNbKChrzXPonKHKIsw76SggZJr6DGUzpn6BIx+s6gJs8/4QMHY9g+lbcF5SklluUZhFzSggZXn6FmcVecPIhR05ZigkhI8NN2dcjrggKxYQQiooSQalzwFJMCBk9UVlVJihSTDQA7/PcEjKSfGFXVPw29llFH6M50cAYpgNjWIhMtHw/X6kiX6lit3DGy0xI//haGhbrnXbqGOVJarl7AP7pZitDfoGlaABL0WtYiEwg6Be2P7tf1LFbOMPWYRl7RZ2XnBB3OYZZAC3rWFBkrkkGLvlNooExLMcn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",
        coin:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAACqCAYAAAA9dtSCAAAACXBIWXMAAC4jAAAuIwF4pT92AAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAEPtaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzA2NyA3OS4xNTc3NDcsIDIwMTUvMDMvMzAtMjM6NDA6NDIgICAgICAgICI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiCiAgICAgICAgICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTgtMDUtMTFUMTY6MzE6MzYrMDk6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDE4LTA1LTExVDE3OjM1OjU4KzA5OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxOC0wNS0xMVQxNzozNTo1OCswOTowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6OTY1ZDVkZDQtMzRlNy1mZDQ4LWIzNzktYTc3NTc4MDIwYWNjPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD5hZG9iZTpkb2NpZDpwaG90b3Nob3A6NGZjZmYyOWYtNTRmNi0xMWU4LTk3MTEtZmI5MjdlODZmZDQ1PC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6NzIxNDZhOWItYTU1NS0xMDQxLWE3NzItOWJiOGRjYjAyYjRjPC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjcyMTQ2YTliLWE1NTUtMTA0MS1hNzcyLTliYjhkY2IwMmI0Yzwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxOC0wNS0xMVQxNjozMTozNiswOTowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDo0YmI4ZjFhMy1mMThiLTlhNGYtYTVjMS1iY2RlNGRjNzRiMWI8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTgtMDUtMTFUMTY6MzI6MDgrMDk6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6OGY2NzRiNjMtNzcyZS04ODQ5LTk5MmQtMGMzZDhiMDFkZjE1PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE4LTA1LTExVDE3OjM1OjU4KzA5OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jb252ZXJ0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+ZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZzwvc3RFdnQ6cGFyYW1ldGVycz4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmRlcml2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+Y29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmc8L3N0RXZ0OnBhcmFtZXRlcnM+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjk2NWQ1ZGQ0LTM0ZTctZmQ0OC1iMzc5LWE3NzU3ODAyMGFjYzwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxOC0wNS0xMVQxNzozNTo1OCswOTowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICAgICA8c3RFdnQ6Y2hhbmdlZD4vPC9zdEV2dDpjaGFuZ2VkPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6U2VxPgogICAgICAgICA8L3htcE1NOkhpc3Rvcnk+CiAgICAgICAgIDx4bXBNTTpEZXJpdmVkRnJvbSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgIDxzdFJlZjppbnN0YW5jZUlEPnhtcC5paWQ6OGY2NzRiNjMtNzcyZS04ODQ5LTk5MmQtMGMzZDhiMDFkZjE1PC9zdFJlZjppbnN0YW5jZUlEPgogICAgICAgICAgICA8c3RSZWY6ZG9jdW1lbnRJRD54bXAuZGlkOjcyMTQ2YTliLWE1NTUtMTA0MS1hNzcyLTliYjhkY2IwMmI0Yzwvc3RSZWY6ZG9jdW1lbnRJRD4KICAgICAgICAgICAgPHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD54bXAuZGlkOjcyMTQ2YTliLWE1NTUtMTA0MS1hNzcyLTliYjhkY2IwMmI0Yzwvc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8L3htcE1NOkRlcml2ZWRGcm9tPgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8cGhvdG9zaG9wOklDQ1Byb2ZpbGU+c1JHQiBJRUM2MTk2Ni0yLjE8L3Bob3Rvc2hvcDpJQ0NQcm9maWxlPgogICAgICAgICA8cGhvdG9zaG9wOlRleHRMYXllcnM+CiAgICAgICAgICAgIDxyZGY6QmFnPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHBob3Rvc2hvcDpMYXllck5hbWU+6rKM7J6E64+UIOuhnOq3uOyduCDtm4Qg7J207Jqp7ZWY7Iuc66m0IO2PrOyduO2KuOulvCDsoIHrpr3tlaAg7IiYIOyeiOyKteuLiOuLpC4gPC9waG90b3Nob3A6TGF5ZXJOYW1lPgogICAgICAgICAgICAgICAgICA8cGhvdG9zaG9wOkxheWVyVGV4dD7qsozsnoTrj5Qg66Gc6re47J24IO2bhCDsnbTsmqntlZjsi5zrqbQg7Y+s7J247Yq466W8IOyggeumve2VoCDsiJgg7J6I7Iq164uI64ukLiA8L3Bob3Rvc2hvcDpMYXllclRleHQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHBob3Rvc2hvcDpMYXllck5hbWU+UDwvcGhvdG9zaG9wOkxheWVyTmFtZT4KICAgICAgICAgICAgICAgICAgPHBob3Rvc2hvcDpMYXllclRleHQ+UDwvcGhvdG9zaG9wOkxheWVyVGV4dD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOkJhZz4KICAgICAgICAgPC9waG90b3Nob3A6VGV4dExheWVycz4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+MzAwMDAwMC8xMDAwMDwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+MzAwMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNzA8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTcwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz5Y8qthAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAByASURBVHja7J17kGRVfcc/5/bt7tmZndnZeewL3CCxYsVIkKhRFsGwWCWQVBI0aFTwiZaoSVVMKrEQSiOESv6w8ocaNCpGDPGVoBVTYqUAReVhikQImCrfK6Cs7O7s7rwf3X3yxz1393b3fZxz7rN75lTdmunue8/j9/v+nudxhfzp+6hkcQBX/S23TANnAc9U1zPUdzPALLADmEQgVI/H1XMLQAuQwAngJHAEOAYcBZ4ADgE/UX+PlTrKDrCh/lawuJXrkc/uWuEt14DnAi8AzlH/n6sAaVPGA/9Padx/FHgEeAx4FHhI/d8uTDE0VWsbSryqBItKadSaAqkoTEgPAL+j/h7oAZedkGVbFoD71fUN9bdVCHU2CmtpgDSqAOqFmPkzgMuAS4GXKbNd5TIOvFxdKPfhLuBrwJ3Az3Nrua4UR0XcgfI1qm/m89Oie4A/Al6ttKZTiOAV41XeD3we+FfgcG4ttRRgNyVQ89WiTeAPgLcCFxfq8Qrl34lCqdkGvg78I/DvwFouYrFenu9ajunPzxd9FnAtcLWKyIsvsjSKvkxdTwP/DNwC/CjTYGtEgbVd/ACLT/7UcwHpAeDfgO8D7y4NpNUouxQNvq9ociDT2hvqGlqgCjVAJ6B50mufS4H71PUKqpB1JdPxpeXtKwL0uTRT/d0s1r1xCmulETMwc4ZeAnxbRb4H2Co6FudORbODmboCzrAAtabMfTY+3XnA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"
    }

    window.addEventListener('DOMContentLoaded', function() {
        this._dom = document.createElement("style");
        for(var key in this.css) {
            this._dom.innerText += this.css[key].join(" ");
        }
        for(var key in this.imageURI) {
            this._dom.innerText = this._dom.innerText.replace("["+key+"]", this.imageURI[key]);
        }
        document.body.appendChild(this._dom);
        
        gdApi._isInit = "domReady";
    }.bind(this));
}
gdApi.VERSION = "2.0.1"