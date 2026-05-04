class Movement extends Phaser.Scene {
    constructor() {
        super("movementScene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings

        this.bodyX = 400;
        this.bodyY = 550;

        this.leftKey = null;
        this.rightKey = null;
        this.spaceKey = null;
        this.SKey = null;
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        // Assets from assets folder
        this.load.image("cloud", "assets/PNG/Enemies/cloud.png");
        this.load.image("flyer", "assets/PNG/Enemies/flyMan_jump.png");
        this.load.image("lightning", "assets/PNG/Particles/lighting_yellow.png");
        this.load.image("lightningBlue", "assets/PNG/Particles/lighting_blue.png");
        this.load.image("Sky", "assets/PNG/Background/bg_layer1.png");
        this.load.image("BackCloud", "assets/PNG/Background/bg_layer2.png");
        this.load.image("UFO", "assets/Aliens/PNG/shipGreen_manned.png");
        this.load.image("alien", "assets/Alien_Sprites/alienGreen.png");
        this.load.image("Laser", "assets/Aliens/PNG/laserGreen1.png");
        this.load.image("Ring", "assets/Aliens/PNG/laserGreen3.png");
        this.load.image("Explosion", "assets/Aliens/PNG/laserGreen_burst.png");
        this.load.image("Score3", "assets/PNG/HUD/coin_gold.png");
        this.load.image("Score2", "assets/PNG/HUD/coin_silver.png");
        this.load.image("Score1", "assets/PNG/HUD/coin_bronze.png");
        this.load.image("Life", "assets/PNG/Items/carrot_gold.png");
        this.load.image("powerup", "assets/PNG/Items/powerup_wings.png");
        this.load.audio("laserSound", "assets/kenney_sci-fi-sounds/Audio/laserLarge_000.ogg");
        this.load.audio("pBullet", "assets/dragon-studio-lightning-spell-386163.mp3");
        this.load.audio("sQueue", "assets/Space Music Pack/Space Music Pack/fx/scream.wav");    



        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Storm Invaders</h2>'    
    }

    spawnAlienWave(rows, cols) {
        let my = this.my;

        let startX = 80;
        let startY = 120;
        let spacingX = 80;
        let spacingY = 60;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let cloud = this.add.sprite(0, 0, "cloud").setScale(0.3);
                let alienSprite = this.add.sprite(-2, -30, "alien").setScale(0.6);

                // create container at world position
                let alien = this.add.container(
                startX + col * spacingX,
                startY + row * spacingY,
                [alienSprite, cloud]
                );

                alien.setScale(0.6);
                alien.setSize(60, 60); // give the container an explicit hitbox size
                my.sprite.alienGroup.add(alien);
            }
        }
    }

    spawnDivingEnemy() {
        let my = this.my;

        // pick random spawn side
        let side = Phaser.Math.Between(0, 2);

        let startX, startY;

        if (side === 0) { 
            startX = Phaser.Math.Between(50, this.scale.width - 50);
            startY = -50;
        } else if (side === 1) { 
            startX = -50;
            startY = Phaser.Math.Between(50, 200);
        } else { 
            startX = this.scale.width + 50;
            startY = Phaser.Math.Between(50, 200);
        }

        // bottom target (dives toward player area)
        let endX = Phaser.Math.Between(50, this.scale.width - 50);
        let endY = this.scale.height + 50;

        // curved arc control point
        let controlX = Phaser.Math.Between(0, this.scale.width);
        let controlY = Phaser.Math.Between(150, 350);

        let curve = new Phaser.Curves.QuadraticBezier(
            new Phaser.Math.Vector2(startX, startY),
            new Phaser.Math.Vector2(controlX, controlY),
            new Phaser.Math.Vector2(endX, endY)
        );

        // flyer enemy
        let enemy = this.add.follower(curve, startX, startY, "flyer");

        enemy.setScale(0.3);
        enemy.setDepth(1);

        // optional: if sprite is sideways or upside down
        enemy.setRotation(Phaser.Math.Between(-0.2, 0.2));

        this.my.sprite.flyerGroup.add(enemy);

        enemy.startFollow({
            duration: Phaser.Math.Between(2000, 4000),
            ease: "Sine.easeIn",
            repeat: 0,
            rotateToPath: true
        });

        return enemy;
    }

    startFlyerSpawning() {
        this.flyerSpawnEvent = this.time.addEvent({
            delay: 1500, // spawn every 1.5 seconds
            loop: true,
            callback: () => {

                // stop spawning once 3 are killed
                if (this.flyersKilled >= this.maxFlyers) {
                    this.flyerSpawnEvent.remove();
                    return;
                }

                this.spawnDivingEnemy();
            }
        });
    }

    spawnWave() {
        let rows = 2 + this.wave;          // more rows over time
        let cols = 6 + Math.min(this.wave, 6); // cap width so it doesn't break screen

        this.spawnAlienWave(rows, cols);

        this.formationLeft = 80;
        this.formationRight = 80 + (cols - 1) * 80;

        this.waveActive = true;

        console.log("Wave:", this.wave);

        if (this.wave === 1 || this.wave === 3) {
            let ufo = this.add.sprite(0, 50, "UFO");
            ufo.setScale(0.5);
            this.my.sprite.UFOGroup.add(ufo);
            ufo.direction = 1;
            ufo.speed = 100;
        }

        this.flyersKilled = 0;

        if (this.wave >= 2) {
            this.startFlyerSpawning();
        }

    }

    spawnExplosion(x, y, scale = 0.5) {
        let explosion = this.add.sprite(x, y, "Explosion");
        explosion.setScale(0.2);
        explosion.setAlpha(1);

        this.tweens.add({
            targets: explosion,
            scale: scale * 1.5,
            alpha: 0,
            angle: Phaser.Math.Between(-30, 30), // slight randomness
            duration: 300,
            onComplete: () => explosion.destroy()
        });
    }

    create() {    
        let my = this.my;   // create an alias to this.my for readability
        this.initGame();

        my.sprite.cloud = this.add.sprite(this.bodyX, this.bodyY, "cloud");
        my.sprite.cloud.setScale(0.3);  // scale down the cloud sprite
        my.sprite.cloud.flipY = true;   // flip the cloud sprite vertically

        my.sprite.sky = this.add.sprite(400, 300, "Sky");
        // set background to be behind the cloud
        my.sprite.sky.setDepth(-2);
        let darkOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000);
        darkOverlay.setAlpha(0.5);
        darkOverlay.setDepth(-1); // above sky, below player

        my.sprite.backCloud = this.add.sprite(400, 100, "BackCloud");
        my.sprite.backCloud.flipY = true;   // flip the back cloud sprite vertically
        my.sprite.backCloud.setDepth(-1); // in front of sky, above player
        let darkCloudOver = this.add.rectangle(400, 300, 800, 600, 0x003000);
        darkCloudOver.setAlpha(0.5);
        darkCloudOver.setDepth(-1); // above sky, below player

        my.sprite.lightningGroup = this.add.group();
        my.sprite.UFOGroup = this.add.group();
        my.sprite.alienGroup = this.add.group();
        my.sprite.lightningEnemyGroup = this.add.group();
        my.sprite.ufoLaserGroup = this.add.group();
        my.sprite.flyerGroup = this.add.group();

        this.spawnWave();

        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.scoreText = this.add.text(40, 12, "Score: 0", {
            fontFamily: "Courier New",
            fontSize: "bold 20px",
            fill: "#000000"
        });

        this.livesText = this.add.text(5, 550, "Lives:", {
            fontFamily: "Courier New",
            fontSize: "bold 20px",
            fill: "#000000"
        });

        this.livesIcons = [];

        for (let i = 0; i < this.lives; i++) {
            let icon = this.add.sprite(20 + i * 30, 580, "Life");
            icon.setScale(0.3);
            this.livesIcons.push(icon);
        }

        this.coinIcon = this.add.sprite(20, 20, "Score1");
        this.coinIcon.setScale(0.5);
        this.powerUp = this.add.sprite(770, 570, "powerup");
        this.powerUp.setScale(0.7);
        this.powerUp.visible = true;

        // Audio
        this.Edeath = this.sound.add("Edeath", { volume: 0.5 });
        this.gameMusic = this.sound.add("gameMusic", { loop: true, volume: 0.8});
        this.gameMusic.play();
        this.laserSound = this.sound.add("laserSound", {volume: 0.5, rate: 0.5});
        this.pBullet = this.sound.add("pBullet", {volume: 0.5});
        this.eBullet = this.sound.add("pBullet", {volume: 0.5, detune: 100});
        this.sQueue = this.sound.add("sQueue", { volume: 0.6, rate: 1.5 });
    }

    update() {
        if (this.gameOver) {
            return;
        }

        let my = this.my;   // create an alias to this.my for readability

        // shoot lightning upwards from body when space key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (my.sprite.lightningGroup.getLength() < 3) { // limit to 3 lightning bolts on screen
                let lightning = this.add.sprite(
                my.sprite.cloud.x,
                my.sprite.cloud.y - 25,
                "lightning"
                );

                lightning.setScale(0.3);
                this.sound.play("pBullet", { volume: 0.3});
                my.sprite.lightningGroup.add(lightning);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.sKey) && this.cooldown == true) {
            this.cooldown = false;
            this.powerUp.visible = false;
            this.playerSpeed = 240; // double speed
            this.time.delayedCall(4000, () => {
                this.playerSpeed = 120;
                console.log("Cooldown started");
                this.time.delayedCall(15000, () => {
                    this.cooldown = true;
                    this.powerUp.visible = true;
                    console.log("Cooldown ended, speed boost ready");
                });
            });
        }

        if (!this.cooldown) {
            my.sprite.cloud.setTint(0x777777);
        } else {
            my.sprite.cloud.clearTint();
        }

        this.invFrames();
        this.playerMovement();
        this.enemyMovement();
        this.alienBullets();
        this.ufoBullet();
        this.collisionCheck();

        if (
            this.my.sprite.alienGroup.getLength() === 0 &&
            this.my.sprite.UFOGroup.getLength() === 0 &&
            (
                this.wave < 2 || 
                this.flyersKilled >= this.maxFlyers
            )
        ) {
            this.waveActive = false;
        }

        this.checkWaveClear();
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    invFrames() {
        let my = this.my;   // create an alias to this.my for readability

        if (this.invincible) {
            this.invincibleTimer -= this.game.loop.delta;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
            // Flash the player to signal invincibility
            my.sprite.cloud.setAlpha(Math.floor(this.invincibleTimer / 150) % 2 === 0 ? 0.3 : 1);
        } else {
            my.sprite.cloud.setAlpha(1);
        }
    }

    updateCoin() {
        if (this.score >= 15000) {
            this.coinIcon.setTexture("Score3");
        }
        else if (this.score >= 7500) {
            this.coinIcon.setTexture("Score2");
        }
        else {
            this.coinIcon.setTexture("Score1");
        }
    }

    playerMovement() {
        let my = this.my;   // create an alias to this.my for readability

        // Add code in update() to move the player avatar left on "A" and right on "D". Be sure to use pixel velocities expressed in pixels/second and delta scaling for fps-scaled movement! 
        if (this.leftKey.isDown) {
            my.sprite.cloud.x -= this.playerSpeed * this.game.loop.delta / 1000;  // move left at player speed pixels/second
        }
        else if (this.rightKey.isDown) {
            my.sprite.cloud.x += this.playerSpeed * this.game.loop.delta / 1000;  // move right at player speed pixels/second
        }

        // Keep player within screen bounds
        let halfWidth = my.sprite.cloud.displayWidth / 2;
        if (my.sprite.cloud.x < halfWidth) {
            my.sprite.cloud.x = halfWidth;
        }
        else if (my.sprite.cloud.x > this.scale.width - halfWidth) {
            my.sprite.cloud.x = this.scale.width - halfWidth;
        }
    }

    enemyMovement() {
        let my = this.my;

        // Move ALL aliens left/right
        for (let alien of my.sprite.alienGroup.getChildren()) {
            alien.x += this.enemyDirection * 20 * this.game.loop.delta / 1000;
        }

        // ✅ Recalculate formation bounds from REAL positions (fixes bug)
        let aliens = my.sprite.alienGroup.getChildren();

        if (aliens.length > 0) {
            this.formationLeft = Math.min(...aliens.map(a => a.x));
            this.formationRight = Math.max(...aliens.map(a => a.x));
        }

        // ✅ Edge detection (ONLY triggers once per side)
        if (this.formationRight > this.scale.width - 50 && this.enemyDirection === 1) {
            this.enemyDirection = -1;

            for (let alien of aliens) {
                alien.y += 5;
            }
        }
        else if (this.formationLeft < 50 && this.enemyDirection === -1) {
            this.enemyDirection = 1;

            for (let alien of aliens) {
                alien.y += 5;
            }
        }


        // Move UFOs across the top of the screen
        for (let ufo of my.sprite.UFOGroup.getChildren()) {
            ufo.x += ufo.direction * ufo.speed * this.game.loop.delta / 1000;

            // bounce at edges
            if (ufo.x > this.scale.width - 50) {
                ufo.x = this.scale.width - 50;
                ufo.direction = -1;
            }
            else if (ufo.x < 50) {
                ufo.x = 50;
                ufo.direction = 1;
            }
        }
    }

    checkWaveClear() {
        if (!this.waveActive && !this.waitingForNextWave) {

            this.waitingForNextWave = true;

            if (this.wave < 3) {
                let nextWaveText = this.add.text(this.scale.width / 3 + 130, 300, "Next Wave...", { fontSize: "32px", fill: "#e5ff00" })
                    .setDepth(10)
                    .setOrigin(0.5);

                this.time.delayedCall(1500, () => {
                    nextWaveText.destroy();
                });

                this.time.delayedCall(2000, () => {  // 2 second delay
                    this.wave += 1;
                    this.spawnWave();
                    this.waitingForNextWave = false;
                });
            } else {
                this.time.delayedCall(2000, () => {
                    this.gameMusic.stop();
                    this.scene.start("winScene");
                });
            }
        }
    }

    alienBullets() {
        let my = this.my;   // create an alias to this.my for readability

        // randomly fire from aliens
        if (Math.random() < 0.01) {   // 1% chance per frame
            let aliens = my.sprite.alienGroup.getChildren();

            if (aliens.length > 0) {
                let shooter = Phaser.Utils.Array.GetRandom(aliens);

                let bullet = this.add.sprite(
                shooter.x,
                shooter.y + 20,
                "lightningBlue"
                );

                bullet.setScale(0.3);
                my.sprite.lightningEnemyGroup.add(bullet);
                this.sound.play("pBullet", { volume: 0.5, detune: 1200});            }
        }
    }

    ufoBullet() {
        let my = this.my;   // create an alias to this.my for readability

        if (Math.random() < 0.005) {
            let ufos = my.sprite.UFOGroup.getChildren();

            if (ufos.length > 0) {
                let shooter = Phaser.Utils.Array.GetRandom(ufos);

                // prevent spam queueing from same UFO
                if (shooter.isCharging) return;

                shooter.isCharging = true;

                // play warning sound
                this.sQueue.play();

                // delay before firing
                this.time.delayedCall(800, () => {

                    if (!shooter.active) return;

                    let laser = this.add.sprite(shooter.x, shooter.y + 20, "Laser");

                    laser.owner = shooter;
                    laser.setOrigin(0.5, 0);
                    laser.displayHeight = this.scale.height - shooter.y;

                    my.sprite.ufoLaserGroup.add(laser);

                    shooter.isCharging = false;

                    // remove laser after time
                    this.time.delayedCall(500, () => {
                        if (laser.active) laser.destroy();
                    });

                });
            }
        }
        for (let laser of my.sprite.ufoLaserGroup.getChildren()) {

            // if UFO is dead erase laser immediately
            if (!laser.owner.active) {
                laser.destroy();
                continue;
            }
            if (!laser.active) continue;

            if (laser.owner && laser.owner.active) {
                laser.x = laser.owner.x;
                laser.y = laser.owner.y + 20;
            }

            let player = my.sprite.cloud;

            if (!player.active) continue;

            // MANUAL HITBOX
            let beamWidth = 40;
            this.laserSound.play();

            let withinX = Math.abs(player.x - laser.x) < beamWidth;
            let belowUFO = player.y > laser.y;
        }
    }

    collisionCheck() {
        let my = this.my;   // create an alias to this.my for readability

        // Player and alien bullet collision check
        for (let bullet of my.sprite.lightningEnemyGroup.getChildren()) {
            bullet.y += 300 * this.game.loop.delta / 1000;

            if (bullet.y > this.scale.height) {
                bullet.destroy();
            }

            if (!bullet.active || !my.sprite.cloud.active) continue;

            if (this.collides(my.sprite.cloud, bullet)  && !this.invincible) {
                bullet.destroy();

                this.lives -= 1;

                // remove one icon visually
                if (this.livesIcons.length > 0) {
                    let icon = this.livesIcons.pop();
                    icon.destroy();
                }

                this.invincible = true;
                this.invincibleTimer = 2000;

                if (this.lives <= 0) {
                    this.gameOver = true;
                    console.log("GAME OVER");
                    this.gameMusic.stop();
                    this.scene.start("restartScene")
                }
            }
        }
        
        // Player and UFO laser collision check
        for (let laser of my.sprite.ufoLaserGroup.getChildren()) {
            if (!laser.active || !my.sprite.cloud.active) continue;

            let player = my.sprite.cloud;

            let beamWidth = 40;
            let withinX = Math.abs(player.x - laser.x) < beamWidth;
            let belowUFO = player.y > laser.y;

            if (withinX && belowUFO && !this.invincible) {

                this.lives -= 1;

                if (this.livesIcons.length > 0) {
                    let icon = this.livesIcons.pop();
                    icon.destroy();
                }

                    this.invincible = true;
                    this.invincibleTimer = 2000; // 2 seconds of invincibility

                if (this.lives <= 0) {
                    this.gameOver = true;
                    console.log("GAME OVER");
                    this.gameMusic.stop();
                    this.scene.start("restartScene");
                }
            }
        }

        // Player and diving flyer collision check
        for (let flyer of my.sprite.flyerGroup.getChildren()) {

            if (!flyer.active || !my.sprite.cloud.active) continue;

            if (this.collides(my.sprite.cloud, flyer) && !this.invincible) {

                this.spawnExplosion(flyer.x, flyer.y, 0.7);
                this.Edeath.play();

                flyer.destroy();

                this.flyersKilled++; // count kills

                this.lives -= 1;

                if (this.livesIcons.length > 0) {
                    let icon = this.livesIcons.pop();
                    icon.destroy();
                }

                this.invincible = true;
                this.invincibleTimer = 2000;

                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.gameMusic.stop();
                    this.scene.start("restartScene");
                }
            }
        }
        
        // UFO and Alien and Flyer with player bullet collision check
        for (let lightning of my.sprite.lightningGroup.getChildren()) {
            lightning.y -= 600 * this.game.loop.delta / 1000;

            if (lightning.y < 0) {
                lightning.destroy();
            }

            for (let alien of my.sprite.alienGroup.getChildren()) {

                // skip if already destroyed
                if (!lightning.active || !alien.active) continue;

                if (this.collides(alien, lightning)) {
                    this.spawnExplosion(alien.x, alien.y, 0.5);
                    this.Edeath.play();

                    lightning.destroy();
                    alien.destroy();

                    this.score += 100;
                    this.scoreText.setText("Score: " + this.score);

                    this.updateCoin();
                }
            }

            for (let ufo of my.sprite.UFOGroup.getChildren()) {

                // skip if already destroyed
                if (!lightning.active || !ufo.active) continue;

                if (this.collides(ufo, lightning)) {
                    this.spawnExplosion(ufo.x, ufo.y, 0.7);
                    this.Edeath.play();

                    lightning.destroy();
                    ufo.destroy();

                    this.score += 1000;
                    this.scoreText.setText("Score: " + this.score);

                    this.updateCoin();
                }
            }

            for (let flyer of my.sprite.flyerGroup.getChildren()) {

                // skip if already destroyed
                if (!lightning.active || !flyer.active) continue;

                if (this.collides(flyer, lightning)) {
                    this.spawnExplosion(flyer.x, flyer.y, 0.5);
                    this.Edeath.play();

                    this.flyersKilled++; // count kills

                    lightning.destroy();
                    flyer.destroy();

                    this.score += 300;
                    this.scoreText.setText("Score: " + this.score);

                    this.updateCoin();
                }
            }
        }
    }

    initGame() {
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.playerSpeed = 120;
        this.enemyDirection = 1; // 1 = right, -1 = left
        this.cooldown = true;
        this.flyersKilled = 0;
        this.maxFlyers = 5;

        this.waveActive = true;
        this.waitingForNextWave = false;
        this.gameOver = false;
        this.invincible = false;
        this.invincibleTimer = 0;
    }
}