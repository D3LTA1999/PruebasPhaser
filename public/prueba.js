const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0}
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};
const game = new Phaser.Game(config);

function preload(){
  this.load.image("tiles","assets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map","assets/mundofeliz.json");

}

function create(){
const map = this.make.tilemap({key:"map"});
const tileset=map.addTilesetImage("tuxmon-sample-32px-extruded","tiles");

const world= map.createStaticLayer("World",tileset,0,0);
const grass= map.createStaticLayer("Grass",tileset,0,0);
}

function update(){

}
