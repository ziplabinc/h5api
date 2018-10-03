h5Api.Ad = function (adUrl, opt) {
    if(document.body === null || document.body === undefined) {
        console.error("[h5Api.Ad] new h5Api.Ad must be call after window.onload. Abort!");
        return;
    }
    if (adUrl === undefined)  console.error("[h5Api.Ad] adUrl is not defined. Abort!");
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

h5Api.Ad.prototype._initAdsense = function () {
    if(document.querySelector("body #adWrapper") !== null) {
        this.adWrapper  = document.querySelector("body #adWrapper");
        this.adPlayImage  = document.querySelector("body #adWrapper #adPlayImage");
    }else if(h5Api.isMobile) { //모바일일 경우에만 Wrapper 생성
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
    if(h5Api.isIOS) {
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
    if(h5Api.isIOS) {
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

h5Api.Ad.prototype.run = function (opt) {
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

        // 아직 광고쿨타임이 덜 지났거나
        // 플레이 한계수를 넘겼을 경우 false 리턴
        if(Date.now() - this.lastAdTime <= this.adAgainTime)                      return false;
        else if (this.adPlayLimit != -1 && this.adPlayCount >= this.adPlayLimit)  return false;

        if (typeof this.pauseGame === "function")  this.pauseGame();
    }

    this.lastAdTime = Date.now();
    if (h5Api.isMobile) {
        this.adWrapper.style.display = "block";
    }
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

    return true;
};
  
h5Api.Ad.prototype._ad = function () {
    if (h5Api.isMobile) {
      this.adWrapper.style.display = "none";
      this.adMainContainer.style.backgroundColor = "black";
    }
    try {
      this.adsManager.init(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
      this.adsManager.start();
      this.adPlayCount++;
    } catch (adError) {
      console.error("[h5Api.Ad] adsManager.start ErrorCode "+adErrorEvent.h.h+" : "+adErrorEvent.h.l);
      this._resumeAfterAd(false);
    }
  };
  
h5Api.Ad.prototype._onAdsManagerLoaded = function(adsManagerLoadedEvent) {
    console.log("[h5Api.Ad] _onAdsManagerLoaded start")
  
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
  
  
    if (!h5Api.isMobile)
        this._ad();
    else {
        // adsManager 로드 후 버튼 생성해야 버튼 뜨자마자 클릭해도 문제 없음.
        this.adPlayImage.addEventListener("click", this._ad.bind(this));
        this.adPlayImage.style.opacity = 1;
    }
};
  
h5Api.Ad.prototype._onAdEvent = function(adEvent) {
    var ad = adEvent.getAd();
    switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
            if (!ad.isLinear()) {;} // 광고 실패 혹은 끝?
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

            this._resumeAfterAd(true);
            break;
    }
};

h5Api.Ad.prototype._forceOpenCover = function() {
    this.adPlayImage.addEventListener("click", this._ad.bind(this));
    this.adPlayImage.style.opacity = 1;
    this.adWrapper.style.display = "block";
}
h5Api.Ad.prototype._resumeAfterAd = function(isSuccess) {

    if (typeof this.resumeGame === "function")              this.resumeGame();
    if (typeof this.callback === "function" && isSuccess)   this.callback();
    if (typeof this.failback === "function" && !isSuccess)  this.failback();

    // 광고 뷰 관련 초기화
    if (h5Api.isMobile) {
        this.adPlayImage.removeEventListener("click", this._ad);
        this.adPlayImage.style.opacity = 0;
        this.adWrapper.style.display = "none";
    }
    this.adMainContainer.style.display = "none";

    // 풀슬롯 재생이었을 경우에는 관련 변수 초기화
    if(this.isFullslot === true) {
        this.adUrl = this._originAdUrl;
        this.isFullslot = false;
        this.adVideo.style.display = "block";
        delete this._originAdUrl;
    }
}

h5Api.Ad.prototype._onAdError = function(adErrorEvent) {
    console.warn("[h5Api.Ad] ErrorCode "+adErrorEvent.h.h+" : "+adErrorEvent.h.l);
    
    if (this.adsManager !== undefined)  this.adsManager.destroy();

    // 풀슬롯이 아닌 경우, 재도전
    // (1009 VAST 에러일 경우 풀슬롯으로는 정상 동작하는 경우가 존재하므로)
    if(this.isFullslot !== true) {
        this._originAdUrl = this.adUrl;
        this.adUrl = h5Api.adcode.ad.fullslot[h5Api.data.cn].replace("[gn]", h5Api.data.gn).replace("[adc]", h5Api.data.adc);
        this.isFullslot = true;
        this.adVideo.style.display = "none";
        this.run({ retry: true });
    }else {
        this._resumeAfterAd(false);
    }
};
  
h5Api.Ad.prototype._onContentPauseRequested = function() {};

h5Api.Ad.prototype._onContentResumeRequested = function() {};