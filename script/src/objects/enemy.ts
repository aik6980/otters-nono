module Objects{

    export class Enemy extends Phaser.Sprite{

        constructor(game : Phaser.Game, x: number, y: number){
            super(game, x, y, 'enemy');
        }

        update(){
            
        }
    }
}