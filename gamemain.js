// 星が振りつつテキストを表示するサンプル

phina.globalize();

const MESSAGE_SPEED = 4; //1<n 低いほど早い  
const FONT_SIZE = 50;
const TEXTS = [
    'われわれはうちゅうじんだ。',
    'ちきゅうはいただいた。',
    'いのちがおしければ、めいれいにしたがえ!!!!'
];

phina.define('MainScene', {
    superClass: 'DisplayScene',

    init: function (opt) {
        this.superInit(opt);

        this.utyuujin = Utyuujin().addChildTo(this)
            .setPosition(this.gridX.center(), this.gridY.span(4));

        this.labelArea = LabelArea({
            text: '',
            width: 400,
            height: 300,
            fontSize: FONT_SIZE,
        }).addChildTo(this)
            .setPosition(this.gridX.center(), this.gridY.center(2));

        RectangleShape({
            cornerRadius: 15,
            width: 450,
            height: 350,
            strokeWidth: 15,
            stroke: 'black',
            fill: 'transparent',
        }).addChildTo(this.labelArea);

        this.texts = TEXTS;
        this.textIndex = 0;
        this.charIndex = 0;

        this.nextTriangle = TriangleShape({
            fill: 'black',
            stroke: 'transparent',
            radius: FONT_SIZE / 2,
        }).addChildTo(this)
            .setPosition(this.labelArea.right - 25, this.labelArea.bottom - 25);

        this.nextTriangle.rotation = 180;

        this.nextTriangle.hide();

        this.messageSpeed = MESSAGE_SPEED;
    },

    update: function (app) {
        const SCREEN_WIDTH = 640;
        const SCREEN_HEIGHT = 960;
        const SHAPE_SIZE = 32;
        const SHAPE_HALF = SHAPE_SIZE / 2;
        if (app.pointer.getPointingStart()) {
            if (this.textAll) {
                this.nextText();
            }
            else {
                this.showAllText();
            }
        }
        else if (app.frame % this.messageSpeed === 0) {
            this.addChar();
        }

        if (this.textAll) {
            if (app.frame % 10 === 0) {
                if (this.nextTriangle.visible) {
                    this.nextTriangle.hide();
                } else {
                    this.nextTriangle.show();
                }
            }
        } else {
            this.nextTriangle.hide();
        }

        if (app.frame % 10 === 0) {
            let self = this;

            (function () {
                // Shapeを作成してシーンに追加  
                let shape = StarShape({
                    radius: SHAPE_SIZE,
                }).addChildTo(self);
                // 画面上に収まるランダムな位置に配置  
                shape.x = Random.randint(SCREEN_WIDTH * -1, SCREEN_WIDTH);
                shape.y = Random.randint(-10, 0);
                shape.tweener.moveBy(SCREEN_HEIGHT + Random.randint(0, SCREEN_HEIGHT) + SHAPE_SIZE, SCREEN_HEIGHT + Random.randint(0, SCREEN_HEIGHT) + SHAPE_SIZE, 2000).play();
            })();
        }
    },

    showAllText: function () {
        var text = this.texts[this.textIndex];
        this.labelArea.text = text;
        this.textAll = true;
        this.charIndex = text.length;
    },

    clearText: function () {
        this.labelArea.text = '';
    },

    nextText: function () {
        this.clearText();
        if (this.texts.length <= ++this.textIndex) {
            this.textIndex = 0;
        }
        this.charIndex = 0;
        this.addChar();
    },

    addChar: function () {
        this.labelArea.text += this.getChar();
    },

    getChar: function () {
        var text = this.texts[this.textIndex];
        if (text.length <= this.charIndex) {
            this.textAll = true;
            return '';
        } else {
            this.textAll = false;
            return text[this.charIndex++];
        }
    }
});

phina.define('Utyuujin', {
    superClass: 'DisplayElement',

    init: function () {
        this.superInit();
        this.face = TriangleShape({
            fill: 'gray',
            radius: 60,
        }).addChildTo(this);

        this.face.rotation = 180;

        this.leftEye = CircleShape({
            fill: 'yellow',
            radius: 10,
        }).addChildTo(this)
            .setPosition(-20, 0);

        this.rightEye = CircleShape({
            fill: 'yellow',
            radius: 10,
        }).addChildTo(this)
            .setPosition(20, 0);

        this.leftEye.scale.y = this.rightEye.scale.y = 2;
        this.leftEye.rotation = -20;
        this.rightEye.rotation = 20;

    }
});

phina.main(function () {
    GameApp({
        startLabel: 'main',
    }).run();

});  