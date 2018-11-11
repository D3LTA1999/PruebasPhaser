const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
const game = new Phaser.Game(config);
let controls;
let player;

function preload() {
    this.load.image("tilesetNameInPhaser", "assets/tilsets/sokoban_tilesheet.png");
    this.load.tilemapTiledJSON("level1", "assets/tilemaps/map.json");
    this.load.spritesheet("dude", "assets/atlas/dude.png", {
        frameWidth: 32,
        frameHeight: 48
    });
}

function create() {
    // Creación de las propiedades gráficas de Juego
    const map = this.make.tilemap({
        key: "level1"
    });
    const tileset = map.addTilesetImage("sokoban_tilesheet", "tilesetNameInPhaser");
    const objetos = map.createStaticLayer("objetos", tileset, 0, 0);
    const bordes = map.createStaticLayer("bordes", tileset, 0, 0);
    const piso = map.createStaticLayer("piso", tileset, 0, 0);
    objetos.setCollisionByProperty({
        collides: true
    });
    bordes.setCollisionByProperty({
        collides: true
    });
    objetos.setDepth(10);
    bordes.setDepth(10);
    const spawnPoint = map.findObject("SpawnPoint", obj => obj.name === "SpawnPoint");
    player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "dude");
    this.physics.add.collider(player, objetos);
    this.physics.add.collider(player, bordes);
    //Establecimiento de la conexión con otros jugadores
    let self = this;
    this.socket = io();
    this.otrosjugadores = new Array();
    this.socket.on('Jugadores_conectados', function(jugadores) {
        for (var i = 0; i < jugadores.length; i++) {
            if (jugadores[i].playerId === self.socket.id) {
                player.x = jugadores[i].x;
                player.y = jugadores[i].x;
            } else {
                let otro = self.physics.add.sprite(jugadores[i].x, jugadores[i].y, "dude");
                self.physics.add.collider(otro, objetos);
                self.physics.add.collider(otro, bordes);
                otro.playerId = jugadores[i].playerId;
                self.otrosjugadores.push(otro);
            }
        }
    });
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{
            key: 'dude',
            frame: 4
        }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', {
            start: 5,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('dude', {
            frame: 4
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('dude', {
            start: 5,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });
    cursors = this.input.keyboard.createCursorKeys();
    const camera = this.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cursors = this.input.keyboard.createCursorKeys();
    this.add.text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
        font: "18px monospace",
        fill: "#000000",
        padding: {
            x: 20,
            y: 10
        },
        backgroundColor: "#ffffff"
    }).setScrollFactor(0).setDepth(30);
    // Debug graphics
    this.input.keyboard.once("keydown_D", event => {
        // Turn on physics debugging to show player's hitbox
        this.physics.world.createDebugGraphic();
        // Create worldLayer collision graphic above the player, but below the help text
        const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
        worldLayer.renderDebug(graphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
    });
    //Métodos de conexión con el servidor
    this.socket.on('nuevojugador', function(jugador) {
        const avatar = self.add.sprite(jugador.x, jugador.y, "dude");;
        avatar.playerId = jugador.playerId;
        self.otrosjugadores.push(avatar);
        console.log(self.otrosjugadores);
    });
    this.socket.on('jugador_movido', function(jugador) {
        for (var i = 0; i < self.otrosjugadores.length; i++) {
            if (self.otrosjugadores[i].playerId === jugador.playerId) {
                self.otrosjugadores[i].x = jugador.x;
                self.otrosjugadores[i].y = jugador.y;
            }
        }
    })
    this.socket.on('disconnect', function(usuario_desconectado) {
        for (var i = 0; i < self.otrosjugadores.length; i++) {
            if (self.otrosjugadores[i].playerId === usuario_desconectado) {
                self.otrosjugadores[i].destroy();
                delete self.otrosjugadores[i];
                self.otrosjugadores.splice(i, 1);
            }
        }
        console.log(self.otrosjugadores);
    });
}

function update(time, delta) {
    player.body.setVelocity(0);
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else if (cursors.up.isDown) {
        player.setVelocityY(-160);
        player.anims.play("up", true);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
        player.anims.play("down", true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
    //Emitir movimientos
    var x = player.x;
    var y = player.y;
    if (player.oldPosition && (x !== player.oldPosition.x || y !== player.oldPosition.y)) {
        this.socket.emit('MovimientoDeJugador', {
            x: player.x,
            y: player.y,
        });
    }
    // save old position data
    player.oldPosition = {
        x: player.x,
        y: player.y,
    };
}