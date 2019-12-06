// 落ち物ゲームサンプル

// 画面サイズ
const W = 960;
const H = 640;

// 難易度
const difficultyType = ['Easy', 'Normal', 'Hard'];

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

        // 難易度（落下速度）決定
        let index = difficultyType.findIndex((item) => item === param.selectedDifficulty);
        this.difficultySpeed = 60 - (index * 20);

        // 落下するアイテムの種類
        this.difficultyLevel = index;

        // 落下速度設定
        this.count = this.difficultySpeed;

        // メインシーンの経過時間
        this.time = 0;

        // 残機
        this.missItem = 10;

        // ミスした回数
        this.missedItemCount = 0;

        // スコア
        this.score = 0;

        // 前回ヒットした種類
        this.getItemType = 99;

        // コンボ数
        this.conbo = 0;

        // プレイヤー配置
        this.player = Player();
        this.player.setPosition(this.gridX.center(), this.gridY.center(5)).addChildTo(this);

        // 星グループを作成
        this.group = DisplayElement().addChildTo(this);

        // スコア表示
        scoreLabel = Label({
            text: 'SCORE : ' + ('0000000000' + this.score).slice(-10),
            x: 200,
            y: 60,
            fontSize: 30,
            fontFamily: "digiFont",
            fill: '#F2F2F2'
        }).addChildTo(this);

        // 経過時間表示
        timeLabel = Label({
            text: 'TIME : ' + ('00000' + this.time).slice(-5),
            x: 800,
            y: 60,
            fontSize: 30,
            fontFamily: "digiFont",
            fill: '#F2F2F2'
        }).addChildTo(this);

        // 残機表示
        this.remaining = [];
        for (i = 0; i < this.missItem; i++) {
            this.remaining[i] = DisplayRemainingPlayer()

            this.remaining[i].setPosition(700 + (this.remaining[i].width * i), 600).addChildTo(this);
        }
    },

    update(app) {
        let p = app.pointer;

        this.time += app.deltaTime;
        timeLabel.text = 'TIME : ' + ('00000' + Math.floor(this.time / 1000)).slice(-5);

        // 退避用
        let self = this;

        self.count--;

        //プレイヤーオブジェクトをx軸方向に操作する
        let playerX = this.player.x;

        if (p.getPointing()) {

            let playerMoveX = (p.x - this.player.x) * 0.15;
            // this.player.moveBy(playerMoveX, playerMoveY);
            this.player.moveBy(playerMoveX, 0);
        }

        // 落ち物を生成する
        if (self.count < 0) {
            // 3種類からランダムで選択してアイテムを生成する
            const star = DropItem(Random.randint(0, 2)).setPosition(Random.randint(10, W - 10), 0).addChildTo(this.group);

            // 落とす
            star.tweener.moveBy(0, H, 2000).play();

            // 次の落ち物生成までの期間をランダムで設定する
            this.count = Random.randint(self.difficultySpeed - Math.ceil(self.difficultySpeed / 4), self.difficultySpeed);

            // ゲームの時間経過とともに落ち物生成を早める
            if (self.difficultySpeed > 10) {
                if (Math.floor(self.time / 1000) > 10) {
                    this.difficultySpeed -= Random.randint(0, 1);
                }
            }
        }

        this.checkHitItem();

        this.checkUnHitCount();

        scoreLabel.text = 'SCORE : ' + ('0000000000' + this.score).slice(-10);

    },

    checkUnHitCount() {
        let self = this;
        let missedItemCount = 0;

        // ミスしたオブジェクトがいる位置で判断
        console.log(self.group.children.length)
        self.group.children.each((star) => {

            if (star.y >= H) {
                missedItemCount++;

                self.remaining[(missedItemCount - 1)].fill = '#F2F2F2';
                self.remaining[(missedItemCount - 1)].stroke = 'black';

                // ラストになったら強調表示
                if (missedItemCount === 9) {
                    self.remaining[missedItemCount].tweener.by({ scaleX: 0.6, scaleY: 0.6, }, 100)
                        .by({ scaleX: -0.6, scaleY: -0.6, }, 100)
                        .setLoop(true)
                        .play();
                }

                // ミスした回数が残機分と同値になったら終了
                if (missedItemCount >= self.missItem) {
                    self.exit('result', { score: self.score, message: 'Thank you for playing!' });
                }

            }

        });
    },

    checkHitItem() {
        let player = this.player;
        let self = this;

        // プレイヤーの当たり判定は難易度が高いほど小さい
        let playerArea = RectangleShape({
            width: player.width / (1 + self.difficultyLevel),
            height: player.height / (1 + self.difficultyLevel),
        }).setPosition(player.x, player.y);

        // グループ中に存在するオブジェクト全部に対して当たり判定を行う
        self.group.children.each((star) => {
            let dropItemArea = RectangleShape({
                width: star.width,
                height: star.height,
            }).setPosition(star.x, star.y);

            // 矩形同士の当たり判定
            if (Collision.testRectRect(playerArea, dropItemArea)) {
                player.text = String.fromCharCode(0xf584); // アイコン表示変更
                player.fill = 'red';

                // Hitの文字表示
                DisplayLabelHit().addChildTo(self);

                // コンボ数を表示
                if (self.getItemType === star.itemType) {
                    this.conbo++;
                    DisplayLabelConbo(this.conbo).addChildTo(self);
                }
                else {
                    this.getItemType = star.itemType;
                    this.conbo = 0;
                }

                star.remove();

                // スコアはコンボ数と難易度が高いほど多く加算される
                this.score += 10 * (1 + this.conbo) * (self.difficultyLevel * 2) + this.conbo + (70 - self.difficultySpeed);
            }
        });
    }
});
/*
 * プレイヤークラス
 */
phina.define("Player", {
    // 継承
    superClass: 'Label',
    // コンストラクタ
    init() {
        // プレイヤーオブジェクト配置
        this.iconUnicode = 0xf118;

        this.superInit({
            text: String.fromCharCode(this.iconUnicode),
            fontFamily: "FontAwesome",
            fontSize: 50,
            fill: '#F2F2F2',
        });

        this.changeIconCount = 0;

    },

    update() {

        // デフォルトの表情と異なる場合カウントアップする
        if (this.text !== String.fromCharCode(this.iconUnicode)) {
            this.changeIconCount += 1;
        }

        // カウンターがしきい値を超えたら表情を元に戻す
        if (this.changeIconCount > 20) {
            this.text = String.fromCharCode(this.iconUnicode);
            this.fill = '#F2F2F2';
            this.changeIconCount = 0;
        }
    }
});

/*
 * 落ち物クラス
 */
phina.define("DropItem", {
    // 継承
    superClass: 'StarShape',
    // コンストラクタ
    init(itemType) {
        if (itemType === 0) {
            this.superInit({
                fill: 'lime',
            });

        }
        else if (itemType === 1) {
            this.superInit({
                fill: 'yellow',
            });

        }
        else if (itemType === 2) {
            this.superInit({
                fill: 'deeppink',
            });

        }
        else {
            this.superInit({
                fill: 'deeppink',
            });

        }

        this.itemType = itemType;
    }
});

/*
 * 衝突時表示する文字のクラス
 */
phina.define("DisplayLabelHit", {
    // 継承
    superClass: 'Label',
    // コンストラクタ
    init() {

        this.superInit({
            x: W / 2,
            y: H / 2,
            text: 'HIT!!',
            fontSize: 90,
            fontFamily: "digiFont",
            fill: 'lime',
        });

        this.removeCount = 0;

    },

    update() {

        this.removeCount += 1;

        // 一定期間経過したら破棄する
        if (this.removeCount > 30) {
            this.remove();
        }

        this.tweener.by({ y: 20 }, 50)
            .by({ y: -20 }, 50)
            .by({ y: 10 }, 50)
            .by({ y: -10 }, 50)
            .fadeOut(2000)
            .play();
    },
});

/*
 * コンボ数を表示する文字のクラス
 */
phina.define("DisplayLabelConbo", {
    // 継承
    superClass: 'Label',
    // コンストラクタ
    init(conboNumber) {

        this.superInit({
            x: W / 3,
            y: H / 3,
            text: conboNumber + ' Conbo!!',
            fontSize: 110,
            fontFamily: "digiFont",
            fill: 'cyan',
        });

        this.removeCount = 0;

    },

    update() {

        this.removeCount += 1;

        // 一定期間経過したら破棄する
        if (this.removeCount > 30) {
            this.remove();
        }

        this.tweener.by({ y: 20, scaleX: 0.1, scaleY: 0.1 }, 50)
            .by({ y: -20, scaleX: -0.1, scaleY: -0.1 }, 50)
            .by({ y: 10, scaleX: 0.1, scaleY: 0.1 }, 50)
            .by({ y: -10, scaleX: -0.1, scaleY: -0.1 }, 50)
            .fadeOut(1000)
            .play();
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
 * 残機数の表示
 */
phina.define("DisplayRemainingPlayer", {
    // 継承
    superClass: 'RectangleShape',
    init() {
        this.superInit({
            width: 25,
            height: 25,
            x: W - 60,
            y: H - 60,
            fill: '#274073',
            stroke: '#4EA4D9',
            strokeWidth: 5,
        });
    },

});

/*
 * 難易度選択シーン
 */
phina.define("SelectDifficultyScene", {
    // 継承
    superClass: 'DisplayScene',
    // 初期化
    init() {
        this.superInit({
            width: W,
            height: H,
        });

        this.backgroundColor = 'black'

        Label({
            text: 'Select Mode!',
            fill: '#F2F2F2',
            fontFamily: "digiFont",
        }).setPosition(this.gridX.center(), this.gridY.center(-4)).addChildTo(this);

        // 難易度ごとのボタンを生成してクリックされた難易度をメインシーンに引き継ぐ
        this.difficultyButton = [];
        (difficultyType.length).times((i) => {
            this.difficultyButton[i] = DisplayButton(difficultyType[i]);
            this.difficultyButton[i].setPosition(this.gridX.center(), this.gridY.center(i * 2 + 0.1)).addChildTo(this);
            this.difficultyButton[i].onpointend = () => {
                this.exit({
                    selectedDifficulty: difficultyType[i],
                });
            }

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
        startLabel: 'title',
        scenes: [
            {
                className: 'TitleScene',
                label: 'title',
                nextLabel: 'select',
            },
            {
                className: 'SelectDifficultyScene',
                label: 'select',
                nextLabel: 'main',
            },
            {
                className: 'MainScene',
                label: 'main',
                nextLabel: 'result',
            },
            {
                className: 'ResultScene',
                label: 'result',
                nextLabel: 'title',
            },
        ],
        width: W,
        height: H,
    });
    // fps表示
    app.enableStats();
    // 実行
    app.run();
});