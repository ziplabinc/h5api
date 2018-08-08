<!-- ![Logo](https://app.5gamedom.com/img/icon/zip-logo.png)   -->
**ZIP-LAB H5game Platform 게임 API**
=============

광고 및 포인트, 랭킹 기능이 포함된 ZIP-LAB H5game Platform 게임 API입니다.


Current version: v2.0.8

Installation
-------------
- 게임 내 메인 html file의 head Tag 내에서 gdapi 모듈 파일을 로드합니다.
- 모듈 Link : https://api.5gamedom.com/gdapi/build/gdapi2-latest.min.js
    ```
    <head>
        <script type="text/javascript" src="https://api.5gamedom.com/gdapi/build/gdapi2-latest.min.js"></script>
    </head>
    ```

Testing
-------------
- H5game Platform 상에 업로드된 게임이 아니라면 모든 기능은 Test mode로 구동됩니다.

***


**광고 및 포인트 API**
-------------

- 플랫폼에 입점되는 게임에는 사전 협의된 광고 시점에서 광고가 실행되어야 합니다.
    * (필수) 게임 시작 시
    * (필수) 게임 한판당 또는 적당한 특정 이벤트 시점 : gdApi에서 자동으로 60초에 한번씩 광고를 실행합니다.
    * (선택) 일정 보상 제공 시
- 광고의 종류는 다음과 같습니다.
    * 시작형 : 사용자가 게임 시작 시 시청하는 광고. 포인트 제공하지 않음.
    * 일반형 : 사용자가 광고 시청 시 획득 가능한 보상이 존재하지 않는 광고. 포인트 제공함. (ex. 맞고 한 판 종료 시, 인형뽑기 게임 내에서 인형을 뽑는 데에 성공할 시)
    * 보상형 : 사용자가 광고 시청 시 획득 가능한 보상이 존재하는 경우. 포인트 포인트 제공하지 않음. (ex. 광고 시청시 코인 5개 지급)
    * 풀슬롯 : 광고 수급 또는 브라우저 이슈로 인해, 일반형 또는 보상형 광고 재생이 불가능할 때 사용. (포인트 제공 여부는 대체되는 광고의 유형에 종속됨)
- API 설정 작업은 크게 *초기화, 실행* 으로 이루어집니다.

gdApi.init
-------------
- 광고 생성, 광고 재생 시 호출할 pause/resume 함수 선언, 랭킹 시스템 호출 등의 초기화를 수행합니다.
- window.onload 이후 호출할 것을 권장합니다.
- gdApi.init( [opt ] )

    Name            | Type      | Default   | Description
    -----           | -----     | -----     | -----
    opt             | Object    | {}        | key/value 오브젝트로 이루어진 gdApi.init 옵션 파라미터
    opt.useReward   | Boolean   | false     | 보상형 광고 사용 여부
    opt.isRank      | Boolean   | false     | 랭킹 시스템의 사용 여부 (사용 시 플랫폼사와의 사전 협의 필요)
    opt.pauseGame   | Function  | -         | 광고 실행 시 동작해야 하는 게임 정지, 사운드 음소거 함수
    opt.resumeGame  | Function  | -         | 광고 실행 성공/실패 시 동작해야 하는 게임 재개, 사운드 재생 함수

    ```
    <script>
    gdApi.init({
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
    </script>
    ```

gdApi.run
-------------
- 광고 실행 시점에서 생성한 광고를 실행하고, 광고 타입에 따라 포인트 요청을 호출하는 등 정해진 동작을 수행합니다.
- gdApi.run( opt )

    Name            | Type      | Default           | Description
    -----           | -----     | -----             | -----
    opt             | Object    | {}                | key/value 오브젝트로 이루어진 run 메소드 옵션
    opt.type        | String    | "normal"          | 광고 유형 값 ("start"\|"normal"\|"reward")
    opt.pauseGame   | Function  | gdApi.pauseGame   | 광고 실행 시 동작해야 하는 게임 정지, 사운드 음소거 함수. 초기화 시 선언한 pauseGame 대신 실행됩니다.
    opt.resumeGame  | Function  | gdApi.resumeGame  | 광고 실행 성공/실패 시 동작해야 하는 게임 재개, 사운드 재생 함수. 초기화 시 선언한 pauseGame 대신 실행됩니다.
    opt.callback    | Function  | gdApi.callback    | 광고 실행 성공/실패과 무관하게 gdApi.run 메소드 실행 후 동작하는 콜백 함수. 광고 재생 제한시간(60초) 내 run 메소드를 실행할 때에도 실행됩니다.
    opt.success     | Function  | null              | 보상형 광고 실행 성공 시 실행되는 콜백
    opt.fail        | Function  | null              | 보상형 실행 실패 시 실행되는 콜백. 풀슬롯 유형의 광고도 실행되지 않을 때 호출됨.

    ```
    // 일반형 광고 실행. 초기화 때 선언한 pauseGame, resumeGame 함수를 실행합니다.
    gdApi.run();

    // 보상형 광고 실행. 초기화 때 선언한 pauseGame, resumeGame 함수를 실행합니다.
    gdApi.run({
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
***

**랭킹 API**
-------------

- 플랫폼 내 랭킹 시스템에 정보를 전달하고 받는 기능.
- 랭킹 기능을 사용하기 위해서는 담당자와 사전 협의가 필요합니다.