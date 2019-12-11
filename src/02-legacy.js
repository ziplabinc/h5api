window.h5Api = window.h5Api || {};

h5Api.warnDeprecate = function (message, version) {
    console.warn('[h5Api] Deprecation Warning: ', (message + "\nDeprecated since v" + version));
}


// this.setAdcode(Fn, String) : 다른 url adCode 호출하고 Fn 실행
// this.setAdcode(Fn, Object) : adCode를 hard 삽입하고 Fn 실행
h5Api.setAdcode = function (codeCallback, codeUrl) {
    this.warnDeprecate('use h5Api.Ad.setCode', '3.0.0');
    if (codeCallback === undefined) {
        console.error("[h5Api] getCode param is undefined: codeCallback");
        return;
    }

    if (codeUrl.constructor === String || codeUrl.constructor === undefined) { // 레거시 지원 : codeUrl == undefined
        this.adLoadList[1] = codeUrl || this.adLoadList[1];

        // _getAdcode 사용 시 _adcodeCallback 재선언
        this._adcodeCallback = function (callback, json) {
            this.adcode = json;
            callback(json);
        }.bind(this, codeCallback);
    } else if (codeUrl.constructor === Object) {
        this.adLoadList.splice(1, 1);
        this.adcode = codeUrl;
        codeCallback(codeUrl);
    }
}