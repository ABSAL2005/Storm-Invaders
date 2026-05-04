class Controls extends Phaser.Scene {
    constructor() {
        super("controlsScene");
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x000000);
        this.menuMusic = this.sound.add("menuMusic", { loop: true, volume: 0.3 });

        // Title
        this.add.text(400, 100, "CONTROLS", {
            fontFamily: "Courier New",
            fontSize: "48px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Controls text
        this.add.text(400, 250,
            "A / D  → Move Left / Right\n" +
            "SPACE → Shoot\n" +
            "S → Speed Boost (15 sec cooldown)\n\n" +
            "Avoid enemies and survive!",
        {
            fontFamily: "Courier New",
            fontSize: "24px",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        // Animated "Press ENTER"
        let pressText = this.add.text(400, 500, "Press ENTER to go back", {
            fontFamily: "Courier New",
            fontSize: "20px",
            color: "#ffff00"
        }).setOrigin(0.5);

        // ✨ Animation (fade in/out)
        this.tweens.add({
            targets: pressText,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Input
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.menuMusic.stop();
            this.scene.start("menuScene"); // go back
        }
    }
}