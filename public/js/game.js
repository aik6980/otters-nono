var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SimpleGame;
(function (SimpleGame) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 800, 600, Phaser.AUTO, 'content', null);
            // add states
            this.state.add('game', new State.Game_state);
            this.state.start('game');
        }
        return Game;
    }(Phaser.Game));
    SimpleGame.Game = Game;
})(SimpleGame || (SimpleGame = {}));
window.onload = function () {
    var game = new SimpleGame.Game();
};
var Objects;
(function (Objects) {
    var Enemy = (function (_super) {
        __extends(Enemy, _super);
        function Enemy(game, x, y) {
            _super.call(this, game, x, y, 'enemy');
        }
        Enemy.prototype.update = function () {
        };
        return Enemy;
    }(Phaser.Sprite));
    Objects.Enemy = Enemy;
})(Objects || (Objects = {}));
var Objects;
(function (Objects) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y) {
            _super.call(this, game, x, y, 'player_idle');
            this.anchor.set(0.5);
            this.weapon = this.game.add.weapon(15, 'bullet');
            this.weapon.trackSprite(this, 50, 20);
            this.weapon.fireRate = 150;
            this.weapon.bulletSpeed = 1200;
            this.weapon.onFire.add(function () {
                this.loadTexture('player_fire');
            }, this);
            this.weapon.onKill.add(function () {
                this.loadTexture('player_idle');
            }, this);
        }
        Player.prototype.update = function () {
        };
        return Player;
    }(Phaser.Sprite));
    Objects.Player = Player;
})(Objects || (Objects = {}));
var Objects;
(function (Objects) {
    var Tower = (function (_super) {
        __extends(Tower, _super);
        function Tower(game, x, y) {
            _super.call(this, game, x, y, 'tower');
        }
        Tower.prototype.update = function () {
        };
        return Tower;
    }(Phaser.Sprite));
    Objects.Tower = Tower;
})(Objects || (Objects = {}));
var Objects;
(function (Objects) {
    var Wall = (function (_super) {
        __extends(Wall, _super);
        function Wall(game, x, y) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.tint = Phaser.Color.getColor(0, 0, 64);
        }
        Wall.prototype.update = function () {
        };
        return Wall;
    }(Phaser.Sprite));
    Objects.Wall = Wall;
})(Objects || (Objects = {}));
var State;
(function (State) {
    var Game_state = (function (_super) {
        __extends(Game_state, _super);
        function Game_state() {
            _super.apply(this, arguments);
            this.unit = 64;
            this.starty = 50;
            this.total_score = 0;
        }
        Game_state.prototype.preload = function () {
            // create a bitmap data
            // http://phaser.io/examples/v2/bitmapdata/cached-bitmapdata
            this.bmd_unit_white = this.game.add.bitmapData(this.unit, this.unit);
            this.bmd_unit_white.context.fillStyle = 'rgb(255,255,255)';
            this.bmd_unit_white.context.fillRect(0, 0, 24, 24);
            this.game.cache.addBitmapData('unit_white', this.bmd_unit_white);
            this.game.load.image('bg', 'assets/bg.png');
            this.game.load.image('player_idle', 'assets/player_idle.png');
            this.game.load.image('player_fire', 'assets/player_fire.png');
            this.game.load.image('bullet', 'assets/bullet.png');
            this.game.load.image('enemy', 'assets/enemy.png');
            this.game.load.image('tower', 'assets/tower.png');
            this.game.load.image('fail-img', 'assets/fail-img.png');
            this.game.load.audio('fail', 'assets/fail.ogg');
            this.game.load.audio('bgmusic', 'assets/bgmusic.ogg');
        };
        Game_state.prototype.create = function () {
            this.game.stage.backgroundColor = '#3598db';
            this.cursors = this.game.input.keyboard.createCursorKeys();
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.world.enableBody = true;
            this.game.add.image(0, 0, 'bg');
            this.towers = this.game.add.group();
            this.enemies = this.game.add.group();
            // create player
            var obj = new Objects.Player(this.game, this.game.width * 0.25, this.game.height * 0.25);
            this.game.add.existing(obj);
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            this.player = obj;
            this.fail_img = this.game.add.image(this.game.width / 2, this.game.height / 2, 'fail-img');
            this.fail_img.anchor.set(0.5);
            this.fail_img.visible = false;
            // create towers
            for (var i = 0; i < 4; ++i) {
                var t = new Objects.Tower(this.game, -5, 15 + i * 150);
                this.towers.add(t);
                this.game.physics.enable(t, Phaser.Physics.ARCADE);
            }
            this.spawn_tmr = this.game.time.create(false);
            this.spawn_tmr.loop(2000, this.spawn_enemy, this);
            this.spawn_tmr.start();
            this.bg_music = this.game.sound.play('bgmusic', 0.15, true);
        };
        Game_state.prototype.update = function () {
            // handle input
            if (this.cursors.up.isDown)
                this.player.body.velocity.y = -300;
            else if (this.cursors.down.isDown)
                this.player.body.velocity.y = 300;
            else
                this.player.body.velocity.y = 0;
            if (this.cursors.right.justDown) {
                this.player.weapon.fireAngle = Phaser.ANGLE_RIGHT;
                this.player.weapon.fire();
            }
            this.game.physics.arcade.overlap(this.player.weapon.bullets, this.enemies, this.kill_otter, null, this);
            this.game.physics.arcade.overlap(this.enemies, this.towers, this.on_player_fail, null, this);
            $("#num_otters").text(this.total_score);
        };
        Game_state.prototype.spawn_enemy = function () {
            var num_spawn = this.game.rnd.integerInRange(2, 8);
            for (var i = 0; i < num_spawn; ++i) {
                var obj = new Objects.Enemy(this.game, this.game.width, this.game.height * this.game.rnd.realInRange(0.1, 0.9));
                this.enemies.add(obj);
                this.game.physics.enable(obj, Phaser.Physics.ARCADE);
                obj.body.velocity.x = -this.game.rnd.realInRange(100, 200);
            }
        };
        Game_state.prototype.kill_otter = function (bullet, otter) {
            bullet.kill();
            otter.kill();
            this.total_score++;
        };
        Game_state.prototype.on_player_fail = function (otter, tower) {
            this.enemies.removeAll();
            this.game.sound.play('fail', 0.5);
            this.fail_img.visible = true;
            this.spawn_tmr.pause();
            this.bg_music.pause();
            this.player.weapon.active = false;
            this.game.physics.arcade.isPaused = true;
            this.game.time.events.add(4500, this.on_game_restart, this);
        };
        Game_state.prototype.on_game_restart = function () {
            this.player.weapon.active = true;
            this.game.physics.arcade.isPaused = false;
            this.fail_img.visible = false;
            this.spawn_tmr.resume();
            this.bg_music.resume();
        };
        return Game_state;
    }(Phaser.State));
    State.Game_state = Game_state;
})(State || (State = {}));
//# sourceMappingURL=game.js.map