h5Api.isMobile = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|ipad|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}();

h5Api.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

h5Api._loadScript = function (url, callback, seq) {
    if (url.constructor == Array) {
        if (url.length == 0) {
            callback();
            return;
        }
        if (seq === undefined) seq = 0;
        if (url[seq + 1] !== undefined) callback = this._loadScript.bind(this, url, callback, (seq + 1));

        url = url[seq];
    }
    var script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState) { //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others
        script.onload = function () {
            callback();
        };
        script.onerror = function (err) {
            console.warn('[h5Api] Script load fail: ' + url);
            callback();
        }
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

h5Api.b64EncodeUnicode = function (str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

h5Api.b64DecodeUnicode = function (str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

h5Api.createDOM = function () {
    if (typeof arguments[0] == "object") {
        var opt = arguments[0] || {};
    } else if (typeof arguments[0] == "string") {
        var opt = arguments[1] || {};
        opt.tag = arguments[0];
    }
    if (opt.tag === undefined) console.error("[createDOM] invalid tagName");

    var outer = document.createElement(opt.tag);
    delete opt.tag;

    if (opt.id !== undefined) {
        outer.id = opt.id;
        delete opt.id;
    }

    // Selector.attributes 처리
    if (opt.attr !== undefined) {
        if (opt.attr.constructor.name == "NamedNodeMap") {
            // element.attributes를 그대로 입력할 경우
            for (var i = 0; i < opt.attr.length; i++) {
                outer.setAttribute(opt.attr[i].nodeName, opt.attr[i].nodeValue);
            }
        } else if (opt.attr.constructor.name == "Object" || Array.isArray(opt.attr)) {
            // Object, Array 등 사용자 지정 attrubute일 경우
            if (!Array.isArray(opt.attr)) opt.attr = [opt.attr];
            for (var i = 0; i < opt.attr.length; i++) {
                var attName = opt.attr[i].nodeName || opt.attr[i].key;
                var attVal = opt.attr[i].nodeValue || opt.attr[i].val || "";

                if (attName !== undefined) {
                    outer.setAttribute(attName, attVal);
                } else console.error("[createDOM] invalid attribute nodeName or key");
            }
        } else {
            console.error("[createDOM] invalid attribute option");
        }
        delete opt.attr;
    }

    // Selector.class 처리
    if (opt.class !== undefined) {
        // Array일 경우와, Selector.classList의 경우 모두 체크
        if (Array.isArray(opt.class) || opt.class.constructor.name == "DOMTokenList") {
            for (var i = 0; i < opt.class.length; i++) {
                outer.classList.add(opt.class[i]);
            }
        } else if (typeof opt.class == "string") {
            outer.classList.add(opt.class);
        } else {
            console.error("[createDOM] invalid class option");
        }
        delete opt.class;
    }

    // Selector.value 처리
    if (opt.value !== undefined) {
        if (opt.tag == "input") outer.value = opt.value;
        else outer.innerHTML = opt.value.toString().replace(/ /gi, "&nbsp;");
        delete opt.value;
    }

    // Selector.innerHTML 처리
    if (opt.innerHTML !== undefined) {
        outer.innerHTML = opt.innerHTML.toString();
        delete opt.innerHTML;
    }

    // Selector.style 처리
    if (typeof opt.style === "object") {
        for (var key in opt.style) outer.style[key] = opt.style[key];
        delete opt.style;
    } else if (typeof opt.style === "string") {
        outer.setAttribute("style", opt.style);
    } else if (opt.style !== undefined) {
        console.error("[createDOM] invalid class option");
    }

    // Selector.child 처리
    if (opt.child !== undefined) {
        if (!Array.isArray(opt.child)) opt.child = [opt.child];
        for (var i = 0; i < opt.child.length; i++) {
            if (opt.child[i].constructor.name == "Object") {
                outer.appendChild(this.createDOM(opt.child[i]));
            } else {
                try {
                    outer.appendChild(opt.child[i]);
                } catch (e) {
                    console.log(e);
                    if (opt.child[i] !== undefined) console.error("[createDOM] invalid child option");
                }
            }
        }
        delete opt.child;
    }

    // 나머지 기타 어트리븃 처리
    for (var key in opt) {
        outer.setAttribute(key, opt[key]);
    }

    return outer;
}