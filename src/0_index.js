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
    var loadArr = ["//s0.2mdn.net/instream/html5/ima3.js", codeUrl];

    this._loadScript(loadArr, function(){});
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
  if(this.data.adc === undefined)  this.data.adc = null;
  // TODO : 테스트모드 warn 세팅

  // gdApi.data 채널명 초기화
  this.data.cn = document.domain.split(".")[0];


  // gdApi._prevOnload =  window.onload || null;
  this.init = function(opt) {

    // argument 검증
    if(opt === undefined)                       opt = {};
    if (typeof opt.pauseGame === "function")    this.pauseGame = opt.pauseGame;
    else                                        var udfArg = "opt.pauseGame";
    if (typeof opt.resumeGame === "function")   this.resumeGame = opt.resumeGame;
    else                                        var udfArg = "opt.resumeGame";
    if (typeof opt.callback === "function")     this.callback = opt.callback;
    // if(opt.type === undefined)     var udfArg = "opt.type";

    if(udfArg) {
      console.error("[gdApi.run] "+udfArg+" was undefined. Abort!");
      return false;
    }

    if(this._isInit === "domReady") {
      console.log("[gdapi] Initializing...");
      // gdApi 초기화
      this.Point.init();

      var loadArr = [
        "//api.5gamedom.com/adcode.php?callback=gdApi._adcodeCallback",
        "//s0.2mdn.net/instream/html5/ima3.js"
      ];
      if(opt.isRank === true) loadArr.push("//api.5gamedom.com/rank.php?gd="+this.data.gd);

      this._loadScript(loadArr, function(useReward) {
        // data.cn 보정
        if(this.adcode.cn.indexOf(this.data.cn) === -1)  this.data.cn = "test";

        this.adList.normal = new this.Ad(
          this.adcode.ad.normal[gdApi.data.cn].replace("[gn]", this.data.gn).replace("[adc]", this.data.adc),
          {
            title: this.data.gt,
            image: this.data.gi,
            time : this.adcode.adTime,
          }
        );
        
        if(useReward === true) {
          this.adList.reward = new this.Ad(
            this.adcode.ad.reward[gdApi.data.cn].replace("[gn]", this.data.gn).replace("[adc]", this.data.adc),
            {
              title: this.data.gt,
              image: this.data.gi,
              time : 1,
            }
          );
        }

        // gdApi 관련 처리 끝낸 후 기존 window.onload 호출
        // if(typeof gdApi._prevOnload == "function")  gdApi._prevOnload();

        this._isInit = "complete";
      }.bind(this, opt.useReward));

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
    
    if(this._isInit === "complete") {
      if(runType == "normal") {
        var runSuccess = function (gdApiCallback) {
          this.Point.call({
            env: this.data.gd,
            pauseGame: runPauseGame,
            resumeGame: runResumeGame,
            success: gdApiCallback,
            fail: gdApiCallback,
          });
        }.bind(this, runCallback);

        var runFail = function(gdApiCallback) {
          if(typeof gdApiCallback == "function")  gdApiCallback();
        }.bind(this, runCallback);

      }else if(runType == "start") {
        var runSuccess = function (gdApiCallback) {
          if(typeof gdApiCallback == "function")  gdApiCallback();
        }.bind(this, runCallback);

        var runFail = function(gdApiCallback) {
          if(typeof gdApiCallback == "function")  gdApiCallback();
        }.bind(this, runCallback);

      }else if(runType == "reward") {
        var runSuccess = function (gdApiCallback, success) {
          if(typeof success == "function")        success();
          if(typeof gdApiCallback == "function")  gdApiCallback();
        }.bind(this, runCallback, opt.success);

        var runFail = function(gdApiCallback, fail) {
          if(typeof fail == "function")           fail();
          if(typeof gdApiCallback == "function")  gdApiCallback();
        }.bind(this, runCallback, opt.fail);
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

  this.cc = function (k) { // chocolateCake
    var r = '';
    var line = k.split(String.fromCharCode(0x3000));
    for (var i = 0; i < line.length; i++) {
      r += String.fromCharCode(
        parseInt(
          line[i].replace(/\t/gi, "1").replace(/ /gi, "0"),
          2
        )
        .toString(10)
      );
    }
    return r;
  };
  this.bc = function (t) {
    var r = '';
    for (var i = 0; i < t.length; i++) {
      r += (t[i].charCodeAt()).toString(2)
        .replace(/1/gi, "	").replace(/0/gi, " ");
      r += String.fromCharCode(0x3000);
    }
    return r.slice(0,-1);
  }

}