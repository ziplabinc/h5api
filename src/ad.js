gdApi.Ad = function (adUrl, opt) {
    if(document.body === null || document.body === undefined) {
        console.error("[gdApi.Ad] new gdApi.Ad must be call after window.onload");
        return;
    }
    if (adUrl === undefined)  console.error("[gdApi.Ad] adUrl is not defined. Abort!");
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
  
    // 이거 한번만 실행되도록 옮기고 커밋할것!!!!
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
    if (opt === undefined)                      opt = {};
    if(this.isFullslot !== true) {
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
    
    if(this.otherAd == undefined) {
        if(window.google !== undefined && window.google.ima !== undefined) {
            // 인터벌 유무 체크
            if(this._resendInterval !== undefined) {
                clearInterval(this._resendInterval);
                delete this._resendInterval;
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

        // 아직 JS 로드 안되어있으면 조금 이후에 재실행
        }else if(this._resendInterval === undefined){
            this._resendInterval = setInterval(function() {
                this.run(opt);
            }.bind(this), 200);
        }

    // 카울리 및 타 광고플랫폼 대응
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
                document.body.removeChild(this.adContainer);
            }
            this.adContainer = document.createElement('div');
            this.adContainer.id = "caulyDisplay-"+this.adUrl;
            this.adContainer.classList.add("caulyDisplay");
            document.getElementsByTagName('body')[0].appendChild(this.adContainer);
            
            this.cauly_ads = new CaulyAds({
                app_code: this.adUrl,
                placement: 1,
                displayid: "caulyDisplay-"+this.adUrl,
                passback: function (e) { console.log("[gdApi.Ad] passback", this.adUrl);
                    if (typeof this.failback === "function")    this.failback();
                }.bind(this),
        
                success: function (e) { console.log("[gdApi.Ad] success", this.adUrl);
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
        this.adUrl = gdApi.adcode.ad.fullslot[gdApi.channelName];
        this.isFullslot = true;
        this.run();
    }else {
        this._resumeAfterAd();
    }
};
  
gdApi.Ad.prototype._onContentPauseRequested = function() {};

gdApi.Ad.prototype._onContentResumeRequested = function() {};

gdApi.Ad.prototype._styleText = [
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
      "background-image: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAIAAgADAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDpq6z8PCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACmAUwEoGJmmAVQhKBhQMKBhQAUAFACUwEqgCgApjCmMTNAhCaACmMSmAUwCgAoAKADNAxKYxM0xhTAKBBQAUAFUAZoGJQAlMBKYBQMKYwzQMSgApgFMQUwEoAKBhQAUwEpgaFeKcgUAFABQAUAFABQAUAFABQAUAFABQAUAFABTAKYCUDEzTAKoQlAwoGFAwoAKACgBM0wEqgCgApjCmMQ0CEJoAKYxKYBTAKACgAoAKBiZpjEzTAKYwoEFABTAKYBQMTNACUwEzTAKBhTGFAxM0AFMApiCmAhoAKBhQAUwEpgJQM0a8U4woAKACgAoAKACgAoAKACgAoAKACgAoAKYBTASgYmaYBVCEoGFAwoGFABQAUAJTASqAKACmMKYxM0CEJoAKYxKYBTAKACgAoAM0DEpjEzTGFMAoEFABQAVQBmgYlACUwEpgFAwpjDNAxKACmAUxBTASgAoGFABTASmAlAwoA0a8U4woAKACgAoAKACgAoAKACgAoAKACgApgFMBKBiZpgJVCCgYUDCgYUAFABQAmaYCVQBQAUxhTAQ0AITQAUxiUwCmAUAFABQAUDEzTGJmmAUxhQIKACmAUwCgYmaAEpgJmmAUDCmMKBiZoAKYBTEFMBDQAUDCgApgJTASgYUAFAGjXinGFABQAUAFABQAUAFABQAUAFABQAUwCmAlAxM0wCqEJQMKBhQMKACgAoASmAlUAUAFMYUxiZoEITQAUxiUwCmAUAFABQAZoGJTGJmmMKYBQIKACgAqgDNAxKAEpgJTAKBhTGGaBiUAFMApiCmAlABQMKACmAlMBKBhQAUAFMDRrxDjCgAoAKACgAoAKACgAoAKACgApgFMBKBiZpgJVCCgYUDCgYUAFABQAmaYCVQBQAUxhTAQ0AITQAUxiUwCmAUAFABQAUDEzTGJmmAUxhQIKACmAUwCgYmaAEpgJmmAUDCmMKBiZoAKYBTEFMBDQAUDCgApgJTASgYUAFABTGJTA0q8M4goAKACgAoAKACgAoAKACgApgFMBKBiZpgFUISgYUDCgYUAFABQAlMBKoAoAKYwpjEzQIQmgApjEpgFMAoAKACgAzQMSmMTNMYUwCgQUAFMApgGaBiUAJTASmAUDCmMM0DEoAKYBTEFMBKACgYUAFMBKYCUDCgAoAKYBTGJTA0q8I4goAKACgAoAKACgAoAKACmAUwEoGJmmAlUIKBhQMKBhQAUAFACZpgJVAFABTGFMBDQAhNABTGJTAKYBQAUAFABQMTNMYmaYBTGFAgoAKYBTAKBiZoASmAmaYBQMKYwoGJmgApgFMQUwENABQMKACmAlMBKBhQAUAFMYlMApgLQBo14RxBQAUAFABQAUAFABQAUwCmAlAxM0wCqEJQMKBhQMKACgAoASmAlUAUAFMYUxiZoEITQAUxiUwCmAUAFABQAZoGJTGJmmMKYBQIKACmAUwDNAxKAEpgJTAKBhTGGaBiUAFMApiCmAlABQMKACmAlMBKBhQAUAFMApjEpgLQAlMDSrwTiCgAoAKACgAoAKACmAUwEoGJmmAlUIKBhQMKBhQAUAFACZpgJVAFABTGFMBDQAhNABTGJTAKYBQAUAFABQMTNMYlMYUwCgQUAFMApgFAxM0AJTATNMAoGFMYUDEoAKYBTEFMBDQAUDCgApgJTASgYUAFABmmMSmAUwFoATNMBM0wNOvAOIKACgAoAKACgApgFMBKBiUwCqEJQMKBhQMKACgAoASmAlUAUAFMYUxiZoEITQAUxiUwCmAUAFABQAZoGJTGJmmMKYBQIKACmAUwDNAxKAEpgJTAKBhTGGaBiUAFMApiCmAlABQMKACmAlMBKBhQAUAFMApjEpgLQAlMBM0wEpgalfPnEFABQAUAFABTAKYCUDEzTASqEFAwoGFAwoAKACgBM0wEqgCgApjCmAhoAQmgApjEqgCgAoAKACgAoGJmmMSmMKYBQIKACmAUwCgYmaAEpgJmmAUDCmMKBiUAFMApiCmAhoAKBhQAUwEpgJQMKACgAzTGJTAKYC0AJmmAmaYCUwCgZqV8+cIUAFABQAUwCmAlAxKYBVCEoGFAwoGFABQAUAJTASqAKACmMKYxM0CEJoAKYxKYBTAKACgAoAM0DEpjEzTGFMAoEFABTAKYBmgYlACUwEpgFAwpjDNAxKACmAUxBTASgAoGFABTASmAlAwoAKACmAUxiUwFoASmAmaYCUwCgYUDNSvnzgCgAoAKYBTASgYmaYCVQgoGFAwoGFABQAUAJmmAlUAUAFMYUwENACE0AFMYlUAUAFABQAUAFAxM0xiUxhTAKBBQAUwCmAUDEzQAlMBKYBQMKYwoGJQAUwCmIKYCUAFAwoAKYCUwEoGFABQAZpjEpgFMBaAEzTATNMBKYBQMKBhQBqV8+cAUAFMApgJQMSmAVQhKBhQMKBhQAUAFACUwEqgCgApjCmMTNAhCaACmMSmAUwCgAoAKADNAxKYxM0xhTAKBBQAUwCmAZoGJQAlMBKYBQMKYwzQMSgApgFMQUwEoAKBhQAUwEpgJQMKACgApgFMYlMBaAEpgJmmAlMAoGFAwoAKYGpXzxwBTAKYCZoGJmmAlUIKBhQMKBhQAUAFACZqgEpgFABTGFMBDQAhNABTGJVAFABQAUAFABQMTNMYlMYUwCgQUAFMApgFAxM0AJTASmAUDCmMKBiUAFMApiCmAlABQMKACmAlMBKBhQAUAGaYxKYBTAWgBM0wEzTASmAUDCgYUAFMAoA1K+fOAKYCUDEpgFUISgYUDCgYUAFABQAlMBKoAoAKYwpjEzQIQmgApjEpgFMAoAKACgAzQMSmMTNMYUwCgQUAFMApgGaBiUAJTASmAUDCmMM0DEoAKYBTEFMBKACgYUAFMBKYCUDCgAoAKYBTGJTAWgBKYCZpgJTAKBhQMKACmAUAFMZqV8+eeJmgYmaYCVQgoGFAwoGFABQAUAJmqASmAUAFMYUwENACGgApjEqgCgAoAKACgAoGJmmMSmMKYBQIKACmAUwCgYmaAEpgJTAKBhTGFAxKACmAUxBTASgAoGFABTASmAlAwoAKADNMYlMApgLQAmaYCZpgJTAKBhQMKACmAUAFMYlAGpXz5wCZpgFUISgYUDCgYUAFABQAlMBKoAoAKYwpgJmgBCaACmMSmAUwCgAoAKADNAxKYxM0xhTAKBBQAUwCmAZoGJQAlMBKYBQMKYwzQMSgApgFMQUwEoAKBhQAUwEpgJQMKACgApjCmAlMBaAEpgJmmAlMAoGFAwoAKYBQAUxiZoASgDUzXgHAJVCCgYUDCgYUAFABQAmaoBKYBQAUxhTAQ0AJmgApjEqgCgAoAKACgAoGJmmMSmMKYBQIKACmAUwCgYmaAEpgJTAKBhTGFAxKACmAUxBTASgAoGFABTASmAlAwoAKADNMYlMApgLQAmaYCZpgJTAKBhQMKACmAUAFMYlACZpgJQBq14J54lAwoGFAwoAKACgBKYCVQBQAUxhTATNACE0AFMYlMApgFABQAUAGaBiUxiZpjCmAUCCgApgFMAzQMSgBKYCUwCgYUxhmgYlABTAKYgpgJQAUDCgApgJTASgYUAFABTGFMBKYC0AJTATNMBKYBQMKBhQAUwCgApjEzQAlACUwCmM1K8A88KBhQMKACgAoATNUAlMAoAKYwpgJQAmaACmMSqAKACgAoAKACgYmaYxKYwpgFAgoAKYBTAKBiZoASmAlMAoGFMYUDEoAKYBTEFMBKACgYUAFUAlACUDCgAoAM0xiUwCmAtACZpgJTASmAUDCgYUAFMAoAKYxKAEzTASgApjCmBqV8+cAUDCgAoAKAEpgJmqAKACmMKYCZoAQ0AFMYlMApgFABQAUAGaBiUxiZpjCmAUCCgApgFMAzQMSgBKYCUwCgYUxhmgYlABTAKYgpgJQAUDCgApgJmmAlAwoAKACmMKYCUwFoASmAmaYCUwCgYUDCgApgFABTGJmgBKAEpgFMYUxhQI1K+fOEKACgAoATNUAlMAoAKYwpgJQAmaACmMSqAKACgAoAKACgYmaYxKYwpgFAgoAKYBTAKBiZoASmAlMAoGFMYUDEoAKYBTEFMBKACgYUAFUAlACUDCgAoAM0xiUwCmAtACZpgJTASmAUDCgYUAFMAoAKYxKAEzTASgApjCmAUAJQBq18+cIUAFACVQCZpgFABTGFMBM0AIaACmMSmAUwCgAoAKADNAxKYxM0xhTAKBBQAUwCmAZoGJQAlMBKYBQMKYwzQMSgApgFMQUwEoAKBhQAUwEzTASgYUAFABTGFMBKYC0AJTATNMBKYBQMKBhQAUwCgApjEzQAlMBKACmMKYBQAmaAEpjNavnjgCgBM1QCUwCgApjCmAlACZoAKYxKoAoAKACgAoAKBiZpjEpjCmAUCCgApgFMAoGJmgBKYCUwCgYUxhQMSgApgFMQUwEoAKBhQAVQCUAJQMKACgAzTGJTAKYC0AJmmAlMBKYBQMKBhQAUwCgApjEoATNMBKACmMKYBQAlACUxhTA1q+dOASqATNMAoAKYwpgJmgBDQAUxiUwCmAUAFABQAZoGJTGJmmMKYBQIKACmAUwDNAxKAEpgJTAKBhTGGaBiUAFMApiCmAlABQMKACmAmaYCUDCgAoAKYwpgJTAWgBKYCZpgJTAKBhQMKACmAUAFMYmaAEpgJQAUxhTAKAEzQAlMYUwCmBq5r544BKYBQAUxhTASgBM0AFMYlUAUAFABQAUAFAxM0xiUxhTAKBBQAUwCmAUDEzQAlMBKYBQMKYwoGJQAUwCmIKYCUAFAwoAKoBKAEoGFABQAZpjEpgFMBaAEzTASmAlMAoGFAwoAKYBQAUxiUAJmmAlABTGFMAoASgBKYwpgFMAoA1M18+cAUAFMYUwEzQAhoAKYxKYBTAKACgAoAM0DEpjEzTGFMAoEFABTAKYBmgYlACUwEpgFAwpjDNAxKACmAUxBTASgAoGFABTATNMBKBhQAUAFMYUwEpgLQAmaYCZpgJTAKBhQMKACmAUAFMYmaAEpgJQAUxhTAKAEzQAlMYUwCmAUAFAzUr5888KYwpgJQAmaACmMSqAKACgAoAKACgYmaYxKYwpgFAgoAKYBTAKBiZoASmAlMAoGFMYUDEoAKYBTEFMBKACgYUAFUAlACUDCgAoAM0xiUwCmAtACZpgJTASmAUDCgYUAFMAoAKYxKAEzTASgApjCmAUAJQAlMYUwCmAUAFAwp2A1K+fOAKYxM0CENABTGJTAKYBQAUAFABmgYlMYmaYwpgFAgoAKYBTAM0DEoATNMBKYBQMKYwzQMSgApgFMQUwEoAKBhQAUwEzTASgYUAFABTGFMBKYC0AJmmAmaYCUwCgYUDCgApgFABTGJmgBKYCUAFMYUwCgBM0AJTGFMApgFABQMKYBTA1K+fOASgBM0AFMYlUAUAFABQAUAFAxM0xiUxhTAKBBQAUwCmAUDEzQAlMBKYBQMKYwoGJQAUwCmIKYCUAFAwoAKoBKAEoGFABQAZpjEpgFMBaAEzTASmAlMAoGFAwoAKYBQAUxiUAJmmAlABTGFMAoASgBKYwpgFMAoAKBhTsAZpgJQM1M18+eeJQAUxiVQBQAUAFABQAZoGJTGJmmMKYBQIKACmAUwDNAxKAEzTASmAUDCmMM0DEoAKYBTEFMBKACgYUAFMBM0wEoGFABQAUxhTASmAtACZpgJmmAlMAoGFAwoAKYBQAUxiZoASmAlABTGFMAoATNACUxhTAKYBQAUDCmAUwEzQMSgDUzXz554UxiVQBQAUAFABQAUDEzTGJTGFMAoEFABTAKYBQMTNACUwEpgFAwpjCgYlABTAKYgpgJQAUDCgAqgEoASgYUAFABmmMSmAUwFoATNMBKYCUwCgYUDCgApgFABTGJQAmaYCUAFMYUwCgBKAEpjCmAUwCgAoGFOwBTASgYmaACgZqV4B54lUAUAFABQAUAGaBiUxiZpjCmAUCCgApgFMAzQMSgBM0wEpgFAwpjDNAxKACmAUxBTASgAoGFABTATNMBKBhQAUAFMYUwEpgLQAmaYCZpgJTAKBhQMKACmAUAFMYmaAEpgJQAUxhTAKAEzQAlMYUwCmAUAFAwpgFMBM0DEoAKBhTEadeCcAUAFABQAUAFAxM0xiUxhTAKBBQAUwCmAUDEzQAlMBKYBQMKYwoGJQAUwCmIKYCUAFAwoAKoBKAEoGFABQAZpjEpgFMBelACZpgIaYCUwCgYUDCgApgFABTGJQAmaYCUAFMYUwCgBKAEpjCmAUwCgAoGFOwBTASgYmaACgYUxBTEadeAcIUAFABQAZoGJTGJmmMKYBQIKACmAUwDNAxKAEzTASmAUDCmMM0DEoAKYBTEFMBKACgYUAFMBM0wEoGFABQAUxhTASmAtACZpgJmmAlMAoGFAwoAKYBQAUxiE0AJTASgApjCmAUAJmgBKYwpgFMAoAKBhTAKYCZoGJQAUDCmIKYgpgadfPnCFABQAUDEzTGJTGFMAoEFABTAKYBQMTNACUwEpgFAwpjCgYlABTAKYgpgJmgAoGFABVAJQAlAwoAKADNMYlMApgL0oATNMBDTASmAUDCgYUAFMAoAKYxKAEzTASgApjCmAUAJQAlMYUwCmAUAFAwp2AKYCUDEoAKBhTEFMQUwCgZp18+cAUAGaBiUxiZpjCmAUCCgApgFMAzQMSgBM0wEpgFAwpjDNAxKACmAUxBTASgAoGFABTATNMBKBhQAUAFMYlMApgLQAmaYCZpgJTAKBhQMKACmAUAFMYhNACUwEoAKYwpgFACZoASmMKYBTAKACgYUwCmAmaBiUAFAwpiCmIKYBQMKBmnXz554UDEzTGJTGFMAoEFABTAKYBQMTNACUwEpgFAwpjCgYlABTAKYgpgJmgAoGFABVAJmgBKBhQAUAGaYxKYBTAXpQAmaYCGmAlMAoGFAwoAKYBQAUxiUAJmmAlABTGFMAoASgBKYwpgFMAoAKBhTAKYCUDEoAKBhTEFMQUwCgYZoGJmmBqZr544BKYxM0xhTAKBBQAUwCmAZoGJQAmaYCUwCgYUxhmgYlABTAKYgpgJQAUDCgApgJmmAlAwoAKACmMSmAUwFoATNMBM0wEpgFAwoGFABTAKACmMQmgBKYCUAFMYUwCgBM0AJTGFMApgFAwoAKYBTATNAxKACgYUxBTEFMAoGFAxM0wEpgama+eOESmMKYBQIKACmAUwCgYmaAEpgJTAKBhTGFAxKACmAUxBTATNABQMKACqATNACUDCgAoAM0xiUwCmAvSgBM0wENMBKYBQMKBhQAUwCgApjEoATNMBKACmMKYBQAlACUxhTAKYBQAUDCmAUwEoGJmgAoGFMQUxBTAKBhmgYmaYCZpgJTA1M188cQUwCgQUAFMApgGaBiUAJmmAlMAoGFMYZoGJQAUwCmIKYCUAFAwoAKYCZpgJQMKACgApjEpgFMBaAEzTATNMBKYBQMKBhQAUwCgApjEJoASmAlABTGFMAoATNACUxhTAKYBQMKACmAUwEzQMSgAoGFMQUxCUwFoGFAxM0wEpgJTAKBmpXz5whQIKACmAUwCgYhNACUwEpgFAwpjCgYlABTAKYgpgJmgAoGFABVAJmgBKBhQAUAGaYxKYBTAXpQAmaYCGmAlMAoGFAwoAKYBQAUxiUAJmmAlABTGFMAoASgBKYwpgFMAoAKBhTAKYCUDEzQAUDCmIKYgpgFAwzQMTNMBM0wEpgFAwqhmpXzp54UAFMApgGaBiUAJmmAlMAoGFMYZoGJQAUwCmIKYCUAFAwoAKYCUwEoGFABQAUxiUwCmAtACZpgJmmAlMAoGFAwoAKYBQAUxiE0AJTASgApjCmAUAJmgBKYwpgFMAoGFABTAKYCZoGJQAUDCmIKYhKYC0DCgYmaYCUwEpgFAwqhhQM1K+dPOCmAUwCgYhNACUwEpgFAwpjCgYlABTAKYgpgJmgAoGFABVAJmgBKBhQAUAGaYxKYBTAXpQAmaYCGmAlMAoGFAwoAKYBQAUxiUAJmmAlABTGFMAoASgBKYwpgFMAoAKBhTAKYCUDEzQAUDCmIKYgpgFAwzQMTNMBM0wEpgFAwqhhQMKANSvnjzgpgGaBiUAJmmAlMAoGFMYZoGJQAUwCmIKYCUAFAwoAKoBKAEoGFABQAUxiUwCmAtACZpgJmmAlMAoGFAwoAKYBQAUxiZoASmAlABTGFMAoASgBKYwpgFMAoGFABTAKYCZoGJQAUDCmIKYhKYC0DCgYmaYCUwEpgFAwqhhQMKACgDUr5884KBiE0AJTASmAUDCmMKBiUAFMApiCmAmaACgYUAFUAmaAEoGFABQAZpjEpgFMBelACZpgIaYCUwCgYUDCgApgFABTGJQAmaYCUAFMYUwCgBKAEpjCmAUwCgAoGFMApgJQMTNABQMKYgpiCmAUDDNAxM0wEzTASmAUDCqGFAwoAKACgRqZr584BKAEzTASmAUDCmMM0DEoAKYBTEFMBKACgYUAFUAlACUDCgAoAKYxKYBTAWgBM0wEzTASmAUDCgYUAFMAoAKYxM0AJTASgApjCmAUAJQAlMYUwCmAUDCgApgFMBM0DEoAKBhTEFMQlMBaBhQMTNMBKYCUwCgYVQwoGFABQAUCEoA1Ca+fOASmAlMAoGFMYUDEoAKYBTEFMBM0AFAwoAKoBM0AJQMKACgAzTGJTAKYC9KAEzTAQ0wEpgFAwoGFABTAKACmMTNACZpgJQAUxhTAKAEoASmMKYBTAKACgYUwCmAlAxM0AFAwpiCmIKYBQMM0DEzTATNMBKYBQMKoYUDCgAoAKBCUAJTA1M18+cAlMAoGFMYZoGJQAUwCmIKYCUAFAwoAKoBKAEoGFABQAUxiUwCmAtACZpgJmmAlMAoGFAwoAKYBQAUxiZoASmAlABTGFMAoASgBKYwpgFMAoGFABTAKYCZoGJQAUDCmIKYhKYC0DCgYmaYCUwEpgFAwqhhQMKACgAoEJQAlMAxTGadfPnnhQMKYwoGJQAUwCmIKYCZoAKBhQAVQCZoASgYUAFABmmMSmAUwF6UAJmqAQ0AJTAKBhQMKACmAUAFMYmaAEzTASgApjCmAUAJQAlMYUwCmAUAFAwpgFMBKBiZoAKBhTEFMQUwCgYZoGJmmAmaYCUwCgYVQwoGFABQAUCEoASmAUDCqA06+eOAKYwzQMSgApgFMQUwEoAKBhQAVQCUAJQMKACgApjEpgFMBaAEzTATNMBKYBQMKBhQAUwCgApjEzQAlMBKACmMKYBQAlACUxhTAKYBQMKACmAUwEzQMSgAoGFMQUxCUwFoGFAxM0wEpgJTAKBhVDCgYUAFABQISgBKYBimMWmAlAGnXz5whQMSgApgFMQUwEzQAUDCgAqgEzQAlAwoAKADNMYlMApgL0oATNUAhoASmAUDCgYUAFMAoAKYxM0AJmmAlABTGFMAoASgBKYwpgFMAoAKBhTAKYCUDEzQAUDCmIKYgpgFAwzQMTNMBM0wEpgFAwqhhQMKACgAoEJQAlMAoGFUAZoASgDUzXz5xCUAFMApiCmAlABQMKACqASgBKBhQAUAFMYlMApgLQAmaYCZpgJTAKBhQMKACmAUAFMYmaAEpgJQAUxhTAKAEoASmMKYBTAKBhQAUwCmAmaBiUAFAwpiCmISmAtAwoGJmmAlMBKYBQMKoYUDCgAoAKBCUAJTAMUxi0wEoASgAoA06+fOIKYBTEFMBM0AFAwoAKoBM0AJQMKACgAzTGJTAKYC9KAEzVAIaAEpgFAwoGFABTAKACmMSgBM0wEoAKYwpgFACUAJTGFMApgFABQMKYBTASgYlABQMKYgpiCmAUDDNAxM0wEzTASmAUDCqGFAwoAKACgQmaAEpgFAwqgDNACUAFABQBp14BxBTEFMBKACgYUAFUAlAxKACgAoAKYxKYBTAWgBM0wEzTASmAUDCgYUAFMAoAKYxM0AJTASgApjCmAUAJQAlMYUwCmAUDCgApgFMBM0DEoAKBhTEFMQlMBaBhQMTNMBKYCUwCgYVQwoGFABQAUCEoASmAYpjCmAUAJQAUAFABQBp14JwhTATNABQMKACqATNACUDCgApgGaBiUwCmAvSgBM1QCGgBKYBQMKBhQAUwCgApjEzQAmaYCUAFMYUwCgBKAEpjCmAUwCgAoGFMApgJQMSgAoGFMQUxBTAKBhmgYmaYCZpgJTAKBhVDCgYUAFABQITNACUwCmMKYBmgBKACgAoAKACgDTrwjhEoAKBhQAVQCUDEoAKACgApjEpgFMBaAEpgJmmAlMAoGFAwoAKYBQAUxiZoASmAlABTGFMAoASgBKYwpgFMAoGFABTAKYCZoGJQAUDCmIKYhKYC0DCgYmaYCUwEpgFAwqhhQMKACgAoEJQAlMAxTGFMAoASgAoAKACgAoAKANKvCOEKBhQAVQCZoASgYUAFMAzQMSmAUwF6UAJmqAQ0AJTAKBhQMKACmAUAGaYxM0AJmmAlABTGFMAoASgBKYwpgFMAoAKBhTAKYCUDEoAKBhTEFMQUwCgYZoGJmmAmaYCUwCgYVQwoGFABQAUCEzQAlMApjCmAZoASgAoAKACgAoAKACgDSrwjiCgAqgEoGJQAUAFABTGJTAKYC0AJTATNMBKYBQMKBhQAUwCmAUDEzQAlMBKACmMKYBQAlACUxhTAKYBQMKACmAUwEzQMSgAoGFMQUxCUwFoGFAxM0wEpgJTAKBhVDCgYUAFABQISgBKYBimMKYBQAlABQAUAFABQAUAFABQBpV4RxBVAJmgBKBhQAUwDNAxKYBTAXpQAmaoBDQAlMAoGFAwoAKYBQAZpjEzQAmaYCUAFMYUwCgBKAEpjCmAUwCgAoGFMApgJQMSgAoGFMQUxBTAKBhmgYmaYCZpgJTAKBhVDCgYUAFABQITNACUwCmMKYBQAlABQAUAFABQAUAFABQAUAaVeIcQlAxKACgAoAKYxKYBTAWgBKYCZpgJTAKBhQMKACmAUwCgYmaAEpgJQAUxhTAKAEoASmMKYBTAKBhQAUwCmAmaBiUAFAwpiCmISmAtAwoGJmmAlMBKYBQMKoYUDCgAoAKBCUAJTAMUxhTAKAEoAKACgAoAKACgAoAKACgAoA0c14hxCUDCgApgGaBiUwCmAvSgBM1QCGgBKYBQMKBhQAUwCgAzTGJmgBM0wEoAKYwpgFACUAJTGFMApgFABQMKYBTASgYlABQMKYgpiCmAUDDNAxM0wEzTASmAUDCqGFAwoAKACgQmaAEpgFMYUwCgBKACgAoAKACgAoAKACgAoAKACgD//2Q==);",
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
];