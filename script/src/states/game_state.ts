module State{
    export class Game_state extends Phaser.State{

        unit = 64;
        bmd_unit_white : Phaser.BitmapData;
        
        level : Array<string>;
        starty = 50;

        cursors : Phaser.CursorKeys;

        // groups
        player : Objects.Player;

        towers : Phaser.Group;
        enemies : Phaser.Group;

        fail_img : Phaser.Image;
        bg_music : Phaser.Sound;

        spawn_tmr : Phaser.Timer;

        total_score = 0;

        preload(){
            // create a bitmap data
            // http://phaser.io/examples/v2/bitmapdata/cached-bitmapdata
            this.bmd_unit_white = this.game.add.bitmapData(this.unit, this.unit);
            this.bmd_unit_white.context.fillStyle = 'rgb(255,255,255)';
            this.bmd_unit_white.context.fillRect(0,0,24,24);
            
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
        }

        create(){
            this.game.stage.backgroundColor = '#3598db';
            this.cursors = this.game.input.keyboard.createCursorKeys();

            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.world.enableBody = true;

            this.game.add.image(0,0,'bg');

            this.towers = this.game.add.group();
            this.enemies = this.game.add.group();
            // create player
            var obj = new Objects.Player(this.game, this.game.width * 0.25, this.game.height * 0.25);
            this.game.add.existing(obj);
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            this.player = obj;

            this.fail_img = this.game.add.image(this.game.width/2,this.game.height/2,'fail-img');
            this.fail_img.anchor.set(0.5);
            this.fail_img.visible = false;

            // create towers
            for(var i=0;i<4;++i){
                var t = new Objects.Tower(this.game, -5, 15 + i * 150);
                this.towers.add(t);
                this.game.physics.enable(t, Phaser.Physics.ARCADE);
            }

            this.spawn_tmr = this.game.time.create(false);
            this.spawn_tmr.loop(2000, this.spawn_enemy, this);
            this.spawn_tmr.start();

            this.bg_music = this.game.sound.play('bgmusic', 0.15, true);
        }

         update(){
            // handle input
            if (this.cursors.up.isDown) 
                this.player.body.velocity.y = -300;
            else if (this.cursors.down.isDown) 
                this.player.body.velocity.y = 300;
            else
                this.player.body.velocity.y = 0;

            if (this.cursors.right.justDown){
                this.player.weapon.fireAngle = Phaser.ANGLE_RIGHT;
                this.player.weapon.fire();
            }

            this.game.physics.arcade.overlap(this.player.weapon.bullets, this.enemies, this.kill_otter, null, this);
            this.game.physics.arcade.overlap(this.enemies, this.towers, this.on_player_fail, null, this);

            $("#num_otters").text(this.total_score);
        }

        spawn_enemy(){

            var num_spawn = this.game.rnd.integerInRange(2, 8);

            for(var i=0; i<num_spawn; ++i){                
                var obj = new Objects.Enemy(this.game, this.game.width, this.game.height * this.game.rnd.realInRange(0.1, 0.9));
                this.enemies.add(obj);
                this.game.physics.enable(obj, Phaser.Physics.ARCADE);

                obj.body.velocity.x = -this.game.rnd.realInRange(100,200);
            }
        }

        kill_otter(bullet, otter){
            bullet.kill();
            otter.kill();

            this.total_score++;
        }

        on_player_fail(otter, tower){
            this.enemies.removeAll();
            this.game.sound.play('fail', 0.5);
            this.fail_img.visible = true;
            this.spawn_tmr.pause();
            this.bg_music.pause();

            this.player.weapon.active = false;
            this.game.physics.arcade.isPaused = true;

            this.game.time.events.add(4500, this.on_game_restart, this);
        }

        on_game_restart(){
            this.player.weapon.active = true;
            this.game.physics.arcade.isPaused = false;
            this.fail_img.visible = false;
            this.spawn_tmr.resume();
            this.bg_music.resume();
        }

        /*
        create(){
            this.game.stage.backgroundColor = '#3598db';
            this.cursors = this.game.input.keyboard.createCursorKeys();

            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.world.enableBody = true;

            this.level = [
                'xxxxxxxxxxxxxxxxxxxx',
                'x        !         x',
                'x                  x',
                'x s      o      o  x',
                'x                  x',
                '!    o ! x         x',
                'xxxxxxxxxx!!!xxx!xxx',
            ];

            // create level
            this.walls = this.game.add.group();
            this.coins = this.game.add.group();
            this.enemies = this.game.add.group();

            // create player
            obj = new Objects.Player(this.game, -this.unit, -this.unit);
            this.game.add.existing(obj);
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            obj.body.gravity.y = 300;
            this.player = obj;
            
            for(var i=0; i<this.level.length; ++i){
                for(var j=0; j<this.level[i].length; ++j){

                    var obj = null;
                    if(this.level[i][j] == 's'){
                        this.spawn_point = [5+this.unit*j, this.starty+this.unit*i];
                    }

                    if(this.level[i][j] == 'x'){
                        obj = new Objects.Wall(this.game, 5+this.unit*j, this.starty+this.unit*i);
                        this.walls.add(obj);
                        this.game.physics.enable(obj, Phaser.Physics.ARCADE);
                        obj.body.immovable = true;
                    }

                    if(this.level[i][j] == 'o'){
                        obj = new Objects.Coin(this.game, 5+this.unit*j, this.starty+this.unit*i);
                        this.coins.add(obj);
                        this.game.physics.enable(obj, Phaser.Physics.ARCADE);
                        //obj.body.immovable = true;
                    }

                    if(this.level[i][j] == '!'){
                        obj = new Objects.Enemy(this.game, 5+this.unit*j, this.starty+this.unit*i);
                        this.enemies.add(obj);
                        this.game.physics.enable(obj, Phaser.Physics.ARCADE);
                    }
                }
            }

            this.spawn_player();
        }

        update(){
            this.game.physics.arcade.collide(this.player, this.walls);
            this.game.physics.arcade.overlap(this.player, this.coins, this.take_coin, null, this);
            this.game.physics.arcade.overlap(this.player, this.enemies, this.restart, null, this);

            // handle input
            if (this.cursors.left.isDown) 
                this.player.body.velocity.x = -100;
            else if (this.cursors.right.isDown) 
                this.player.body.velocity.x = 100;
            else 
                this.player.body.velocity.x = 0;

            // Make the player jump if he is touching the ground
            // this.player.body.touching => this flag is reset every frames
            if (this.cursors.up.isDown && this.player.body.touching.down) 
                this.player.body.velocity.y = -125;
        }

        spawn_player(){
            this.player.position.set(this.spawn_point[0], this.spawn_point[1]);
        }

        take_coin( player : Objects.Player, coin : Objects.Coin){
            coin.kill();
        }

        restart(){
            this.spawn_player();
        }
        */
    }
}