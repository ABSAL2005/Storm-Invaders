class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");

        this.enterKey = null;
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x000000);

        // Credits text (start off screen)
        let creditsText = this.add.text(400, 700,
            "CREDITS\n\n" +
            "Game Design & Code:\nAlan Salazar\n\n" +
            "Assets:\nKenney.nl\n\n" +
            "Sound Effects:\nKenney.nl\n\n" +
            "Thanks for playing!",
        {
            fontFamily: "Courier New",
            fontSize: "28px",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        // Scrolling animation
        this.tweens.add({
            targets: creditsText,
            y: -200,
            duration: 8000,
            ease: "Linear"
        });

        // Back text
        let backText = this.add.text(400, 550, "Press ENTER to return", {
            fontFamily: "Courier New",
            fontSize: "20px",
            color: "#ffff00"
        }).setOrigin(0.5);

        // Fade animation
        this.tweens.add({
            targets: backText,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start("menuScene");
        }
    }
}