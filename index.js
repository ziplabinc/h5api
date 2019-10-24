window.h5Api = new function() {
  this._isInit = "notSet";

  // Adcode 관련 초기화
  this.adList = {};
  this.adLoadList = [
    "//imasdk.googleapis.com/js/sdkloader/ima3.js",
    "//api.hifivegame.com/adcode.php?callback=h5Api._adcodeCallback"
  ];
  this._adcodeCallback = function(json) { this.adcode = json; };

  // h5Api MODE 추가
  this.MODE = {};
  Object.defineProperties(this.MODE, {
    'TEST':  { value: 0, enumerable: true },
    'ALL':   { value: 1, enumerable: true },
    'AD':    { value: 2, enumerable: true },
    'TOKEN': { value: 3, enumerable: true },
  });
  Object.defineProperty(this.MODE, 'allow', {
    value: {
      token: [this.MODE.TEST, this.MODE.ALL, this.MODE.TOKEN],
      rank: [this.MODE.TEST, this.MODE.ALL],
      ad: [this.MODE.TEST, this.MODE.ALL, this.MODE.AD],
    }
  });

  // h5Api.data 게임정보 초기화
  try {
    throw JSON.stringify(window.parent.gameData);
  } catch(e) {
    if(e === undefined || ["TypeError", "SecurityError"].indexOf(e.name) !== -1) {
      // SecurityError: Platform in iframe
      // console.error("[h5Api.run] GameData was undefined or TypeError. Abort!");
      // return;
      this.data = {};
      this.runMode = this.MODE.TOKEN;
    }else {
      this.data = JSON.parse(e);
    }
  }
  if(this.data.gn === undefined)          this.data.gn = "0";
  if(this.data.gt === undefined)          this.data.gt = "TEST GAME";
  if(this.data.gi === undefined)          this.data.gi = "../img/icon.jpg";
  if(this.data.gd === undefined)          this.data.gd = "test-directory";
  if(this.data.adc === undefined)         this.data.adc = null;
  if(this.data.isRank === undefined)      this.data.isRank = 1;
  if(this.data.accessCode === undefined)  this.data.accessCode = "testCode";
  if(this.data.matchCost === undefined)   this.data.matchCost = 1;

  // h5Api.data 채널명 초기화
  if(['127.0.0.1', '::1', 'localhost'].indexOf(this.data.cn) !== -1) {
    this.data.cn = "test";
  } else {
      this.data.cn = document.domain.split(".")[0];
  }


  // h5Api._prevOnload =  window.onload || null;
  this.init = function(opt) {

    // argument 검증
    if(opt === undefined)                       opt = {};
    if (typeof opt.pauseGame === "function")    this.pauseGame = opt.pauseGame;
    else                                        var udfArg = "opt.pauseGame";
    if (typeof opt.resumeGame === "function")   this.resumeGame = opt.resumeGame;
    else                                        var udfArg = "opt.resumeGame";
    if (typeof opt.callback === "function")     this.callback = opt.callback;
    else                                        this.callback = function(){};

    if (opt.ad) {
        if (opt.ad.url && opt.ad.url.constructor === String) {
            this.adLoadList[1] = opt.ad.url;
        }
        else if (opt.ad.code && opt.ad.code.constructor === Object) {
            this.adLoadList.splice(1, 1);
            this.adcode = opt.ad.code;
        }
        if (opt.ad.channel && opt.ad.channel.constructor === String) {
            this.data.cn = opt.ad.channel;
        }
    }

    if(udfArg) {
      console.error("[h5Api.run] "+udfArg+" was undefined. Abort!");
      return false;
    }

    if(this._isInit === "domReady") {
      console.log("[h5Api] Initializing...");
      // runMode 설정 : 기본값 ALL
      this.runMode = this.runMode || ((opt.runMode === undefined) ? this.MODE.ALL : opt.runMode);

      if(this.runMode === this.MODE.TEST) {
        console.warn("[h5Api] Settings not found. Test mode is activated.");
        if(opt.gameData !== undefined) {
          this.data = Object.assign({}, this.data, opt.gameData);
        }
      }

      if(this.MODE.allow.token.indexOf(this.runMode) !== -1) {
        this.Token.init();
      }
      
      if(this.MODE.allow.rank.indexOf(this.runMode) !== -1) {
        // 플랫폼의 isRank 여부와 게임내 isRank 모두 체크
        if(this.data.isRank && opt.isRank === true) this.Rank.init();
      }

      if(this.MODE.allow.ad.indexOf(this.runMode) !== -1) {
        this._loadScript(this.adLoadList, function(useReward) {
          // data.cn 보정
          if(this.adcode.cn.indexOf(this.data.cn) === -1)  this.data.cn = "test";

          this.adList.normal = new this.Ad(
            this.adcode.ad.normal[h5Api.data.cn].replace("[gn]", this.data.gn).replace("[adc]", this.data.adc),
            {
              title: this.data.gt,
              image: this.data.gi,
              time : this.adcode.adTime,
            }
          );
          
          if(useReward === true) {
            this.adList.reward = new this.Ad(
              this.adcode.ad.reward[h5Api.data.cn].replace("[gn]", this.data.gn).replace("[adc]", this.data.adc),
              {
                title: this.data.gt,
                image: this.data.gi,
                time : 1,
              }
            );
          }

          // h5Api 관련 처리 끝낸 후 기존 window.onload 호출
          // if(typeof h5Api._prevOnload == "function")  h5Api._prevOnload();

          this._isInit = "complete";
        }.bind(this, opt.useReward));
      }

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
    if (opt === undefined)                      opt = {};
    if (opt.type !== undefined)                 var runType = opt.type;
    else                                        var runType = "normal";
    if (typeof opt.pauseGame === "function")    var runPauseGame = opt.pauseGame;
    else                                        var runPauseGame = this.pauseGame;
    if (typeof opt.resumeGame === "function")   var runResumeGame = opt.resumeGame;
    else                                        var runResumeGame = this.resumeGame;
    if (typeof opt.callback === "function")     var runCallback = opt.callback;
    else                                        var runCallback = this.callback;
    
    // 플랫폼의 isRank가 1일 때 광고 차단
    if(this.MODE.allow.rank.indexOf(this.runMode) !== -1 && this.data.isRank) {
      runCallback();
      return;
    }
    
    if(this._isInit === "complete") {
      if(runType == "normal") {
        if(this.MODE.allow.token.indexOf(this.runMode) !== -1) {
          var runSuccess = function () {
            this.Token.call({
              env: this.data.gd,
              pauseGame: runPauseGame,
              resumeGame: runResumeGame,
              success: runCallback,
              fail: runCallback
            });
          }.bind(this);
        }else {
          var runSuccess = runCallback;
        }
        var runFail = runCallback;
      }
      else if(runType == "start") {
        var runSuccess = runCallback;
        var runFail = runCallback;
      }
      else if(runType == "reward") {
        var runSuccess = function () {
          if(typeof opt.success === "function") opt.success();
          runCallback();
        }.bind(this);
        var runFail = function() {
          if(typeof opt.fail === "function") opt.fail();
          runCallback();
        }.bind(this);
      }

      var runAdType = (runType != "reward") ? "normal" : "reward";
      var rtn = this.adList[runAdType].run({
        pauseGame: runPauseGame,
        resumeGame: runResumeGame,
        success: runSuccess,
        fail: runFail
      });

      if(!rtn && typeof runCallback == "function")  runCallback();
  
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