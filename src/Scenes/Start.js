class MenuScene extends Phaser.Scene {
    constructor() {
        super("menuScene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings
    }

    preload() {
        this.load.image("background", "assets/PNG/Background/bg_layer4.png");
        this.load.image("color", "assets/PNG/Background/bg_layer1.png");
        this.load.audio("menuMusic","assets/Space Music Pack/Space Music Pack/loading.wav");
        this.load.audio("Edeath","assets/kenney_sci-fi-sounds/Audio/explosionCrunch_000.ogg");
        this.load.audio("gameMusic", "assets/Space Music Pack/Space Music Pack/menu.wav");
        this.load.audio("levelChange", "assets/Space Music Pack/Space Music Pack/fx/start-level.wav");
    }

    create() {
        let my = this.my;

        this.level = this.sound.add("levelChange", { volume: 0.5 });
        this.menuMusic = this.sound.add("menuMusic", { loop: true, volume: 0.3 });
        this.menuMusic.play();
        this.add.text(this.scale.width / 3 - 40, 250, "STORM INVADERS", { fontSize: "40px", fill: "#eaff00" }).setDepth(1);
        this.add.text(this.scale.width / 3, 350, "Press SPACE to Start", { fontSize: "20px", fill: "#eaff00" }).setDepth(1);
        this.add.text(this.scale.width / 3, 400, "Press C for Controls", { fontSize: "20px", fill: "#eaff00" }).setDepth(1);

        this.input.keyboard.once("keydown-SPACE", () => {

            this.level.play();
    
            this.time.delayedCall(800, () => {
                this.menuMusic.stop();
                this.scene.start("movementScene");
            });
        });

        this.input.keyboard.once("keydown-C", () => {

            this.time.delayedCall(300, () => {
                this.menuMusic.stop();
                this.scene.start("controlsScene");
            });
        });

        my.sprite.color = this.add.sprite(0, 0, "color").setOrigin(0, 0);
        my.sprite.color.setScale(0.4);
        my.sprite.color.setDepth(-2);
        my.sprite.background = this.add.sprite(0, -40, "background").setOrigin(0, 0);
        my.sprite.background.setScale(0.4);  
        my.sprite.background.setDepth(3); 
        let darkOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000);
        darkOverlay.setAlpha(0.5);
        darkOverlay.setDepth(0); // above sky, below player
    }
}