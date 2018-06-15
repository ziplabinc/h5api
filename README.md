![5gamedom Logo](https://app.5gamedom.com/img/icon/zip-logo.png)  
**5gamedom 게임 API**
=============

광고 및 포인트 기능이 포함된 5gamedom 게임 API입니다.

**_현재 API의 테스트 기능은 준비 중입니다._**

Current version: v1.0

Installation
-------------
- 게임 내 메인 html file의 head Tag에서 gdapi 모듈 파일을 로드합니다.
- 모듈 Link : https://api.5gamedom.com/gdapi/build/gdapi-latest.min.js
    ```
    <script type="text/javascript" src="https://api.5gamedom.com/gdapi/build/gdapi-latest.min.js"></script>
    ```
***

**광고 API**
-------------

Description
-------------
- 5gamedom에 입점되는 게임에는 사전 협의된 광고 시점에서 광고가 실행되어야 합니다.
- 광고의 종류는 다음과 같습니다.
    * 일반형 : 사용자가 광고 시청 시 획득 가능한 보상이 존재하지 않는 광고 (ex. 1분마다 한번씩 광고 시청)
    * 보상형 : 사용자가 광고 시청 시 획득 가능한 보상이 존재하는 경우 (ex. 광고 시청시 코인 5개 지급)
    * 풀슬롯 : 광고 수급 또는 플랫폼 이슈로 인해, 일반형 또는 보상형 광고 재생이 불가능할 때 사용.
- 광고 설정 작업은 크게 *광고코드 호출, 생성 실행* 으로 이루어집니다.

Load Adcode
-------------
- window.onload 이후(document.body가 존재할 때) 광고 생성 전, 사용할 광고 코드를 호출합니다.
- gdApi.getAdcode( codeCallback [, codeUrl ] )

    Name            | Type      | Default                               | Description
    -----           | -----     | -----                                 | -----
    codeCallback    | Function  | -                                     | 광고코드 호출 후 실행되는 콜백 함수
    codeUrl         | String    | https://api.5gamedom.com/adcode.php   | 호출할 광고 코드
    ```
    window.onload = function() {
        gdApi.getAdcode(function(json) {
            // 광고 생성 작업을 수행합니다.
        });
    }
    ```
* 광고코드 json file 구조
    ```
    {
        ad: {
            normal: {
                app: "...[gn]...",
                cultureland: "...[gn]..."
            },
            reward: {
                app: "...[gn]...",
                cultureland: "...[gn]..."
            },
            fullSlot: {
                app: "...[gn]...",
                cultureland: "...[gn]..."
            },
        },
        adTime: 60000
    }
    ```
* 광고코드 사용 예시
    ```
    data.ad.normal.app; // 일반형 광고, 채널사코드: app
    data.ad.reward.app; // 보상형 광고, 채널사코드: app
    data.ad.normal.app.replace("[gn]", "24"); // 일반형 광고, 채널사코드: app, 게임no: 24
    ```

Create
-------------
- 로드한 광고코드를 사용하여 게임 내에서 필요한 광고를 생성합니다.
- new gdApi.Ad( url [, opt ] )

    Name        | Type      | Default       | Description
    -----       | -----     | -----         | -----
    adcode      | String    | -             | 광고 호출에 사용되는 광고코드
    opt         | Object    | {}            | key/value 오브젝트로 이루어진 gdApi.Ad 생성자 옵션
    opt.title   | String    | "GAME START"  | 광고 커버 생성 시 노출되는 게임 타이틀
    opt.image   | String    | null          | 게임 아이콘 (권장 사이즈 : 512x512)
    opt.limit   | Number    | -1            | 광고 호출 횟수 제한 횟수 (-1 설정 시 무제한)
    opt.time    | Number    | 1             | 광고 호출간 coolTime (ms)
    opt.otherAd | String    | null          | Google 광고 이외의 기타 광고 설정시 사용되는 설정값

    ```
    gdApi.getAdcode(function(json) {
        // 일반형 광고
        window.normalAd = new gdApi.Ad(
            json.ad.normal.app.replace("[gn]", "24"), // 일반형 광고, 채널사코드: app, 게임no: 24
            {
                title: 'Block Breaker',
                image: '../img/icon.jpg', // 일반적으로 5gamedom에 노출되는 아이콘과 동일한 이미지 사용
                time : json.adTime,
            }
        );
    });
    ```

Run
-------------
- 광고 실행 시점에서 생성한 광고를 실행합니다.
- gdApi.Ad.run( [opt ] )

    Name            | Type      | Default   | Description
    -----           | -----     | -----     | -----
    opt             | Object    | {}        | key/value 오브젝트로 이루어진 run 메소드 옵션
    opt.pauseGame   | Function  | null      | 광고 실행 시 동작해야 하는 게임 정지, 사운드 음소거 함수
    opt.resumeGame  | Function  | null      | 광고 실행 성공/실패 시 동작해야 하는 게임 재개, 사운드 재생 함수
    opt.success     | Function  | null      | 광고 실행 성공 시 실행되는 콜백
    opt.fail        | Function  | null      | 광고 실행 실패 시 실행되는 콜백

    ```
    window.normalAd.run({
        pauseGame: function() {
            // 게임 정지 및 게임 사운드 음소거 로직이 삽입되는 함수입니다.
            // 아래 게임 정지 및 음소거 코드는 Sample 코드입니다.
            GAME.pause = true;
            GAME.Sound.muteToggle(true);
            ~~~
        },
        resumeGame: function() {
            // 게임 재개 및 게임 사운드 재생 로직이 삽입되는 함수입니다.
            // 아래 게임 정지 및 음소거 코드는 Sample 코드입니다.
            GAME.pause = false;
            GAME.Sound.muteToggle(false); // 기존 음소거 기능과 중첩되지 않도록 관리해야 합니다.
            ~~~
        },
        success: function() {
            // 광고 실행 성공 시 실행되는 콜백입니다.
            ~~~
        },
        fail: function() {
            // 광고 실행 실패 시 실행되는 콜백입니다.
            ~~~
        }
    });
    ```
***

**포인트 API**
-------------

Description
-------------
- 5gamedom에 입점되는 게임에는 사전 협의된 포인트 요청 시점에서 포인트 요청 호출 메소드가 실행되어야 합니다.
- 포인트 모듈은 포인트 요청 후 서버의 응답에 따라 세 가지 유형의 응답을 수신하고 해당 응답에 대한 처리를 수행합니다.
- 포인트 요청에 대한 응답 유형은 다음과 같습니다.
    * success : 포인트 적립 성공
    * not_login : 포인트 적립에 성공했으나, 비로그인 상태 (적립되지 않음)
    * fail : 적립 실패
- 포인트 요청 작업은 크게 초기화 및 실행으로 이루어집니다.

Init
-------------
- 포인트 요청 전, 게임 내에서 포인트 모듈을 초기화합니다.
- window.onload 이후(document.body가 존재할 때) 포인트 모듈을 초기화합니다.
- gdApi.Point.init()
    ```
    window.onload = function() {
        gdApi.Point.init();
    }
    ```

Call
-------------
- 광고 실행 시점에서 생성한 광고를 실행합니다.
- gdApi.Point.call( [opt ] )

    Name            | Type      | Default   | Description
    -----           | -----     | -----     | -----
    opt             | Object    | {}        | key/value 오브젝트로 이루어진 call 메소드 옵션
    opt.env         | String    | -         | 포인트 요청 시 전송하는 게임 구분값.
    opt.action      | String    | ""        | 포인트 요청 시 전송하는 요청 시점 구분값.
    opt.pauseGame   | Function  | null      | 포인트 적립 시 팝업 창이 생성될 때 동작해야 하는 게임정지 함수
    opt.resumeGame  | Function  | null      | 포인트 적립 팝업 창을 닫을 때 동작해야 하는 게임재개 함수

    ```
    gdApi.Point.call({
        env: "block",
        pauseGame: function(){
            // 아래 게임 정지 코드는 Sample 코드입니다.
            GAME.pause = true;
        },
        resumeGame: function(){
            // 아래 게임 정지 코드는 Sample 코드입니다.
            GAME.pause = false;
        }
    });
    ```
