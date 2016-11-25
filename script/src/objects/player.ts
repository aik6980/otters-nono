module Objects{

    export class Player extends Phaser.Sprite{

        weapon: Phaser.Weapon;

        constructor(game : Phaser.Game, x: number, y: number){
            super(game, x, y, 'player_idle');

            this.anchor.set(0.5);

            this.weapon = this.game.add.weapon(15, 'bullet');
            this.weapon.trackSprite(this, 50, 20);
            this.weapon.fireRate = 150;
            this.weapon.bulletSpeed = 1200;

            this.weapon.onFire.add(function(){
                 this.loadTexture('player_fire');
            }, this);

            this.weapon.onKill.add(function(){
                this.loadTexture('player_idle');
            }, this);
        }

        update(){
        }
    }
}