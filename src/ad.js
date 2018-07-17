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