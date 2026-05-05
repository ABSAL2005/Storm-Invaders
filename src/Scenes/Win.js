class WinScene extends Phaser.Scene {
    constructor() {
        super("winScene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings
    }

    preload() {
        this.load.image("winBg", "assets/PNG/Background/bg_layer1.png");
    }

    create() {
        let my = this.my;

        this.level = this.sound.add("levelChange", { volume: 0.5 });
        this.add.text(this.scale.width / 3 + 55, 250, "YOU WON", { fontSize: "40px", fill: "#eaff00" }).setDepth(1);
        this.add.text(this.scale.width / 3, 350, "Press SPACE to play again", { fontSize: "20px", fill: "#eaff00" }).setDepth(1);
        this.add.text(this.scale.width / 3, 450, "Press V to play credits", { fontSize: "20px", fill: "#eaff00" }).setDepth(1);

        this.input.keyboard.once("keydown-SPACE", () => {
            this.level.play();
            this.time.delayedCall(800, () => {
                this.scene.start("movementScene");
            });
        });

        this.input.keyboard.once("keydown-V", () => {
            this.scene.start("creditsScene");
        });

        my.sprite.background = this.add.sprite(0, 0, "background").setOrigin(0, 0);
        my.sprite.background.setScale(0.4);  // Scale the background to fit the scene
        my.sprite.background.setDepth(-1);  // Ensure the background is behind other elements
        let darkOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000);
        darkOverlay.setAlpha(0.5);
        darkOverlay.setDepth(0); // above sky, below player
    }
}