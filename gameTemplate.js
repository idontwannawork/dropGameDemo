// 戦闘画面サンプル

// 画面サイズ
const W = 960;
const H = 640;

// 素材asset
const ASSETS = {
    font: {
        fontAwesome: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/webfonts/fa-regular-400.woff",
        digiFont: "https://db.onlinewebfonts.com/t/55ea8f43f01d7f6e293a0b84be8861eb.woff2"
    }
};

phina.globalize();

/*
 * メインシーン
 */
phina.define("MainScene", {
    // 継承
    superClass: 'DisplayScene',
    // 初期化
    init(param) {
        // 親クラス初期化
        this.superInit({
            width: W,
            height: H,
        });
        // 背景色
        this.backgroundColor = 'black';
    },

    update(app) {
        let p = app.pointer;

        if (p.getPointing()) {
            let hue = Random.randint(0, 360);
            let color = 'hsl({0}, 75%, 50%)'.format(hue);

            console.log('hoge');

            let txt = Label({
                fill: color,
                text: 'hoge',
            });
            txt.setPosition(this.gridX.center(), this.gridY.center()).addChildTo(this);

        }
    },

});

/*
 * ボタンを表示するクラス
 */
phina.define("DisplayButton", {
    // 継承
    superClass: 'Button',

    init(text) {
        // 初期化
        this.superInit({
            width: 150,             // 横サイズ
            height: 70,             // 縦サイズ
            text: text,             // 表示文字
            fontSize: 32,           // 文字サイズ
            fontColor: '#FFF19E',   // 文字色
            cornerRadius: 10,       // 角丸み
            fill: '#6A93CC',        // ボタン色
            stroke: '#DEE3FF',         // 枠色
            strokeWidth: 5,         // 枠太さ
            fontFamily: "digiFont",
        });

    },
});

/*
 * メイン処理
 */
phina.main(function () {
    // アプリケーションを生成
    let app = GameApp({
        assets: ASSETS,
        // MainScene から開始
        startLabel: 'main',
        width: W,
        height: H,
    });
    // fps表示
    app.enableStats();
    // 実行
    app.run();
});