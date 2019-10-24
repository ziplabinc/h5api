<img src="ziplabinc_logo.png" width="200">

**H5game Platform 게임 API**
=============

광고 및 포인트, 랭킹 기능이 포함된 ZIP-LAB H5game Platform 게임 API입니다.


Installation
-------------
- 게임 내 메인 html file의 head Tag 내에서 h5api 모듈 파일을 로드합니다.
- 모듈 Link : https://api.hifivegame.com/h5api/build/h5api-latest.min.js
    ```
    <head>
        <script type="text/javascript" src="https://api.hifivegame.com/h5api/build/h5api-latest.min.js"></script>
    </head>
    ```

Testing
-------------
- h5Api.init 실행 시 runMode 설정을 통해 테스트 모드(h5Api.MODE.TEST)로 구동 가능합니다.

***


**광고 및 포인트 API**
-------------

- 플랫폼에 입점되는 게임에는 사전 협의된 광고 시점에서 광고가 실행되어야 합니다.
    * (필수) 게임 시작 시
    * (필수) 게임 한판당 또는 적당한 특정 이벤트 시점 : h5Api에서 자동으로 60초에 한번씩 광고를 실행합니다.
    * (선택) 일정 보상 제공 시
- 광고의 종류는 다음과 같습니다.
    * 시작형 : 사용자가 게임 시작 시 시청하는 광고. 포인트 제공하지 않음.
    * 일반형 : 사용자가 광고 시청 시 획득 가능한 보상이 존재하지 않는 광고. 포인트 제공함. (ex. 맞고 한 판 종료 시, 인형뽑기 게임 내에서 인형을 뽑는 데에 성공할 시)
    * 보상형 : 사용자가 광고 시청 시 획득 가능한 보상이 존재하는 경우. 포인트 포인트 제공하지 않음. (ex. 광고 시청시 코인 5개 지급)
    * 풀슬롯 : 광고 수급 또는 브라우저 이슈로 인해, 일반형 또는 보상형 광고 재생이 불가능할 때 사용. (포인트 제공 여부는 대체되는 광고의 유형에 종속됨)
- API 설정 작업은 크게 *초기화, 실행* 으로 이루어집니다.

h5Api.MODE
-------------
- h5Api에서 사용 가능한 모드 프리셋입니다.

    Name                | Type      | Value | Description
    -----               | -----     | ----- | -----
    h5Api.MODE.TEST     | Number    | 0     | 테스트 수행 모드.
    h5Api.MODE.ALL      | Number    | 1     | 모든 기능 사용 가능한 모드. 플랫폼 게임에서 사용됨.
    h5Api.MODE.AD       | Number    | 2     | 광고 기능만 사용 가능한 모드. 주로 비-플랫폼 게임에서 광고를 호출하기 위해 사용됨.
    h5Api.MODE.TOKEN    | Number    | 3     | 토큰 팝업 기능만 사용 가능한 모드. 주로 플랫폼 내부에서 사용됨.

h5Api.init
-------------
- 광고 생성, 광고 재생 시 호출할 pause/resume 함수 선언, 랭킹 시스템 호출 등의 초기화를 수행합니다.
- window.onload 이후 호출할 것을 권장합니다.
- h5Api.init( [opt ] )

    Name            | Type      | Default   | Description
    -----           | -----     | -----     | -----
    opt             | Object    | {}        | key/value 오브젝트로 이루어진 h5Api.init 옵션 파라미터
    opt.runMode     | String    | "ALL"     | 모드 설정값
    opt.useReward   | Boolean   | false     | 보상형 광고 사용 여부
    opt.isRank      | Boolean   | false     | 랭킹 시스템의 사용 여부 (사용 시 플랫폼사와의 사전 협의 필요)
    opt.pauseGame   | Function  | -         | 광고 실행 시 동작해야 하는 게임 정지, 사운드 음소거 함수
    opt.resumeGame  | Function  | -         | 광고 실행 성공/실패 시 동작해야 하는 게임 재개, 사운드 재생 함수

    ```
    h5Api.init({
        useReward: true, // 보상형 광고 사용
        pauseGame: function() {
            // 게임 정지 및 게임 사운드 음소거 로직이 삽입되는 함수입니다.
            // 아래 게임 정지 및 음소거 코드는 Sample 코드입니다.
            if(WG.Sound.bgmGainNode !== undefined && WG.Sound.bgmGainNode.isMute === false) {
                G.isAdMute = true;
                WG.Sound.muteToggle("bgm", false);
                WG.Sound.muteToggle("sfx", false);
            }
            WG.pause = true;
        },
        resumeGame: function() {
            // 게임 재개 및 게임 사운드 재생 로직이 삽입되는 함수입니다.
            // 아래 게임 정지 및 음소거 코드는 Sample 코드입니다.
            if(G.isAdMute === true) {
                WG.Sound.muteToggle("bgm", false); // 게임 내 음소거 기능과 중첩되지 않도록 관리해야 합니다.
                WG.Sound.muteToggle("sfx", false);
            }
            WG.pause = false;
        }
    });
    ```

h5Api.run
-------------
- 광고 실행 시점에서 생성한 광고를 실행하고, 광고 타입에 따라 포인트 요청을 호출하는 등 정해진 동작을 수행합니다.
- h5Api.run( opt )

    Name            | Type      | Default           | Description
    -----           | -----     | -----             | -----
    opt             | Object    | {}                | key/value 오브젝트로 이루어진 run 메소드 옵션
    opt.type        | String    | "normal"          | 광고 유형 값 ("start"\|"normal"\|"reward")
    opt.pauseGame   | Function  | h5Api.pauseGame   | 광고 실행 시 동작해야 하는 게임 정지, 사운드 음소거 함수. 초기화 시 선언한 pauseGame 대신 실행됩니다.
    opt.resumeGame  | Function  | h5Api.resumeGame  | 광고 실행 성공/실패 시 동작해야 하는 게임 재개, 사운드 재생 함수. 초기화 시 선언한 pauseGame 대신 실행됩니다.
    opt.callback    | Function  | h5Api.callback    | 광고 실행 성공/실패과 무관하게 h5Api.run 메소드 실행 후 동작하는 콜백 함수. 광고 재생 제한시간(60초) 내 run 메소드를 실행할 때에도 실행됩니다.
    opt.success     | Function  | null              | 보상형 광고 실행 성공 시 실행되는 콜백
    opt.fail        | Function  | null              | 보상형 실행 실패 시 실행되는 콜백. 풀슬롯 유형의 광고도 실행되지 않을 때 호출됨.

    ```
    // 일반형 광고 실행. 초기화 때 선언한 pauseGame, resumeGame 함수를 실행합니다.
    h5Api.run();

    // 일반형 광고 실행. 광고 실행 후 콜백 함수를 실행합니다.
    h5Api.run({
        callback: function() {
            광고 실행 성공/실패과 무관하게 실행되는 콜백입니다.
        }
    });

    // 보상형 광고 실행. 초기화 때 선언한 pauseGame, resumeGame 함수를 실행합니다.
    h5Api.run({
        type: "reward",
        pauseGame: function() {
            // 게임 정지 및 게임 사운드 음소거 로직이 삽입되는 함수입니다.
            // 초기화 시 선언한 함수를 실행하지 않습니다.
        },
        resumeGame: function() {
            // 게임 재개 및 게임 사운드 재생 로직이 삽입되는 함수입니다.
            // 초기화 시 선언한 함수를 실행하지 않습니다.
        },
        success: function() {
            // 보상형 광고 실행 성공 시 실행되는 콜백입니다.
        },
        fail: function() {
            // 보상형 광고 실행 실패 시 실행되는 콜백입니다.
        }
    });
    ```

h5Api.setAdcode
-------------
- 비플랫폼 게임의 경우 다른 광고 코드를 삽입해야 하는 경우가 있습니다. 이 경우 해당 메소드를 실행하여 adCode를 재설정합니다.

- h5Api.setAdcode( codeCallback, codeUrl )

    Name            | Type          | Default   | Description
    -----           | -----         | -----     | -----
    codeCallback    | Function      | -         | codeUrl 삽입 후 실행할 콜백 함수
    codeUrl         | String|Object | null      | 광고 코드 오브젝트 또는 코드를 호출할 URL

    ```
    h5Api.setAdcode(function (json) { // no Json
        h5Api.data.cn = "ziplab";
        h5Api.init({
            runMode: h5Api.MODE.AD,
            useReward: true, // 보상형 광고 사용
            pauseGame: function () {
                // 게임 정지 및 게임 사운드 음소거 로직이 삽입되는 함수입니다.
            },
            resumeGame: function () {
                // 게임 재개 및 게임 사운드 재생 로직이 삽입되는 함수입니다.
            });
        window.startGame();
    },
    { // 아래 광고코드 오브젝트는 아래의 형식을 지켜야 합니다.
        "url": "/",
        "cn": ["ziplab"], // 채널 네임
        "ad": {
            "normal": { // 일반 광고, 아래 adTime 사용함
                "ziplab": "https://googleads.g.doubleclick.net/..."
            },
            "reward": { // 보상 광고, adTime이 1초로 고정됨
                "ziplab": "https://googleads.g.doubleclick.net/..."
            },
            "fullslot": { // 일반/보상 광고 로드 실패 시 호출하는 풀슬롯 광고
                "ziplab": "https://googleads.g.doubleclick.net/..."
            }
        },
        "adTime": 60000 // 다음 광고를 호출 가능한 최소 시간. adTime만큼 시간이 지나지 않으면 광고를 실행해도 실행되지 않고 콜백 함수를 호출합니다.
    });
    ```
***

**랭킹 API**
-------------

- 플랫폼 내 랭킹 시스템에 정보를 전달하고 받는 기능.
- 랭킹 기능을 사용하기 위해서는 담당자와 사전 협의가 필요합니다.
