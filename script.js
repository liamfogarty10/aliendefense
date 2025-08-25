// Wait for page to load - multiple approaches for Android
window.addEventListener('load', initGame);
document.addEventListener('DOMContentLoaded', initGame);

let gameInstance = null;

function initGame() {
    if (gameInstance) return; // Prevent double initialization
    console.log('Initializing game...');
    gameInstance = new AlienDefenseGame();
}

// Fallback for Android - try after a short delay too
setTimeout(() => {
    if (!gameInstance) {
        console.log('Fallback initialization...');
        initGame();
    }
}, 500);

class AlienDefenseGame {
    constructor() {
        console.log('Game initializing...');
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        this.difficulty = 'normal';
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.player = {
            x: 0,
            y: 0,
            size: 25,
            speed: 5,
            health: 3,
            maxHealth: 3,
            weapon: 'plasma',
            specialAmmo: 3,
            invulnerable: 0
        };
        
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];
        
        this.score = 0;
        this.wave = 1;
        this.enemiesInWave = 5;
        this.enemiesSpawned = 0;
        this.waveStartTime = 0;
        
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        
        this.difficultySettings = {
            easy: { healthMultiplier: 1.5, speedMultiplier: 0.7, spawnRate: 1.5 },
            normal: { healthMultiplier: 1, speedMultiplier: 1, spawnRate: 1 },
            hard: { healthMultiplier: 0.7, speedMultiplier: 1.3, spawnRate: 0.7 },
            nightmare: { healthMultiplier: 0.5, speedMultiplier: 1.6, spawnRate: 0.5 }
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing game...');
        this.setupEventListeners();
        this.gameLoop();
        console.log('Game initialized successfully');
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.fireSpecialWeapon();
            }
            if (e.key === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mouse and touch events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.gameState === 'playing') {
                this.mouse.down = true;
                this.fireBullet();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });
        
        // Touch events for Android
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing' && e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.touches[0].clientX - rect.left;
                this.mouse.y = e.touches[0].clientY - rect.top;
                this.mouse.down = true;
                this.fireBullet();
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.touches[0].clientX - rect.left;
                this.mouse.y = e.touches[0].clientY - rect.top;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mouse.down = false;
        });
        
        // Button events - using a more direct approach
        setTimeout(() => {
            this.setupButtons();
        }, 100);
    }
    
    setupButtons() {
        // Start button - Android-friendly event handling
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            console.log('Setting up start button...');
            
            // Multiple event types for Android compatibility
            const startHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start button activated!');
                const diffSelect = document.getElementById('difficulty');
                if (diffSelect) {
                    this.difficulty = diffSelect.value;
                }
                this.startGame();
            };
            
            startBtn.addEventListener('click', startHandler);
            startBtn.addEventListener('touchstart', startHandler);
            startBtn.addEventListener('touchend', startHandler);
            startBtn.onclick = startHandler;
        }
        
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            const restartHandler = (e) => {
                e.preventDefault();
                this.startGame();
            };
            restartBtn.addEventListener('click', restartHandler);
            restartBtn.addEventListener('touchstart', restartHandler);
        }
        
        // Resume button
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            const resumeHandler = (e) => {
                e.preventDefault();
                this.togglePause();
            };
            resumeBtn.addEventListener('click', resumeHandler);
            resumeBtn.addEventListener('touchstart', resumeHandler);
        }
        
        // Menu button
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
            const menuHandler = (e) => {
                e.preventDefault();
                this.gameState = 'menu';
                this.showScreen('start-screen');
            };
            menuBtn.addEventListener('click', menuHandler);
            menuBtn.addEventListener('touchstart', menuHandler);
        }
        
        console.log('Buttons set up with Android touch support');
    }
    
    startGame() {
        console.log('Starting game...');
        this.gameState = 'playing';
        this.hideAllScreens();
        
        const settings = this.difficultySettings[this.difficulty];
        this.player.health = Math.floor(3 * settings.healthMultiplier);
        this.player.maxHealth = this.player.health;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.specialAmmo = 3;
        this.player.invulnerable = 0;
        
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];
        
        this.score = 0;
        this.wave = 1;
        this.enemiesInWave = 5;
        this.enemiesSpawned = 0;
        this.waveStartTime = Date.now();
        
        this.updateUI();
        console.log('Game started successfully');
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
            this.render();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updatePowerUps();
        this.updateParticles();
        this.spawnEnemies();
        this.checkCollisions();
        this.checkWaveCompletion();
        
        if (this.player.invulnerable > 0) {
            this.player.invulnerable--;
        }
    }
    
    updatePlayer() {
        let dx = 0;
        let dy = 0;
        
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;
        
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
            
            this.player.x += dx * this.player.speed;
            this.player.y += dy * this.player.speed;
            
            this.player.x = Math.max(this.player.size, Math.min(this.canvas.width - this.player.size, this.player.x));
            this.player.y = Math.max(this.player.size, Math.min(this.canvas.height - this.player.size, this.player.y));
        }
    }
    
    fireBullet() {
        const angle = Math.atan2(this.mouse.y - this.player.y, this.mouse.x - this.player.x);
        const speed = 10;
        
        this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 4,
            damage: 1,
            type: 'normal',
            life: 100
        });
    }
    
    fireSpecialWeapon() {
        if (this.player.specialAmmo <= 0) return;
        
        this.player.specialAmmo--;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 8;
            
            this.bullets.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 6,
                damage: 2,
                type: 'special',
                life: 80
            });
        }
        
        this.updateUI();
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;
            
            return bullet.life > 0 && 
                   bullet.x > -50 && bullet.x < this.canvas.width + 50 &&
                   bullet.y > -50 && bullet.y < this.canvas.height + 50;
        });
    }
    
    spawnEnemies() {
        if (this.enemiesSpawned >= this.enemiesInWave) return;
        
        const timeSinceWaveStart = Date.now() - this.waveStartTime;
        const spawnRate = this.difficultySettings[this.difficulty].spawnRate;
        const spawnInterval = 2000 * spawnRate;
        
        if (timeSinceWaveStart > this.enemiesSpawned * spawnInterval) {
            this.spawnEnemy();
            this.enemiesSpawned++;
        }
    }
    
    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (side) {
            case 0: x = Math.random() * this.canvas.width; y = -50; break;
            case 1: x = this.canvas.width + 50; y = Math.random() * this.canvas.height; break;
            case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 50; break;
            case 3: x = -50; y = Math.random() * this.canvas.height; break;
        }
        
        const types = ['basic', 'fast', 'tank', 'bomber'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const settings = this.difficultySettings[this.difficulty];
        let enemy = {
            x, y, type,
            angle: Math.atan2(this.player.y - y, this.player.x - x),
            size: 15,
            speed: 2 * settings.speedMultiplier,
            health: 1,
            maxHealth: 1,
            value: 10,
            lastShot: 0
        };
        
        switch (type) {
            case 'fast':
                enemy.speed = 4 * settings.speedMultiplier;
                enemy.size = 12;
                enemy.value = 15;
                break;
            case 'tank':
                enemy.health = 3;
                enemy.maxHealth = 3;
                enemy.speed = 1 * settings.speedMultiplier;
                enemy.size = 20;
                enemy.value = 30;
                break;
            case 'bomber':
                enemy.health = 2;
                enemy.maxHealth = 2;
                enemy.speed = 1.5 * settings.speedMultiplier;
                enemy.size = 18;
                enemy.value = 25;
                break;
        }
        
        enemy.health = Math.ceil(enemy.health * (1 + this.wave * 0.2));
        enemy.maxHealth = enemy.health;
        
        this.enemies.push(enemy);
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            enemy.angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
            enemy.x += Math.cos(enemy.angle) * enemy.speed;
            enemy.y += Math.sin(enemy.angle) * enemy.speed;
            
            if (enemy.type === 'bomber' && Date.now() - enemy.lastShot > 2000) {
                this.enemyShoot(enemy);
                enemy.lastShot = Date.now();
            }
        });
    }
    
    enemyShoot(enemy) {
        const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
        const speed = 6;
        
        this.bullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 5,
            damage: 1,
            type: 'enemy',
            life: 100,
            enemy: true
        });
    }
    
    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.life--;
            powerUp.y += powerUp.vy;
            powerUp.rotation += 0.1;
            return powerUp.life > 0;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }
    
    checkCollisions() {
        this.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.enemy) {
                const dist = Math.sqrt((bullet.x - this.player.x) ** 2 + (bullet.y - this.player.y) ** 2);
                if (dist < this.player.size + bullet.size && this.player.invulnerable === 0) {
                    this.playerHit();
                    this.bullets.splice(bulletIndex, 1);
                }
                return;
            }
            
            this.enemies.forEach((enemy, enemyIndex) => {
                const dist = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
                if (dist < enemy.size + bullet.size) {
                    enemy.health -= bullet.damage;
                    this.createExplosion(bullet.x, bullet.y, 'yellow');
                    this.bullets.splice(bulletIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.value;
                        this.createExplosion(enemy.x, enemy.y, 'orange');
                        this.enemies.splice(enemyIndex, 1);
                        
                        if (Math.random() < 0.15) {
                            this.spawnPowerUp(enemy.x, enemy.y);
                        }
                        
                        this.updateUI();
                    }
                }
            });
        });
        
        this.enemies.forEach(enemy => {
            const dist = Math.sqrt((enemy.x - this.player.x) ** 2 + (enemy.y - this.player.y) ** 2);
            if (dist < enemy.size + this.player.size && this.player.invulnerable === 0) {
                this.playerHit();
            }
        });
        
        this.powerUps.forEach((powerUp, index) => {
            const dist = Math.sqrt((powerUp.x - this.player.x) ** 2 + (powerUp.y - this.player.y) ** 2);
            if (dist < powerUp.size + this.player.size) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    playerHit() {
        this.player.health--;
        this.player.invulnerable = 120;
        this.createExplosion(this.player.x, this.player.y, 'red');
        
        if (this.player.health <= 0) {
            this.gameOver();
        }
        
        this.updateUI();
    }
    
    spawnPowerUp(x, y) {
        const types = ['health', 'special', 'shield', 'multishot'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerUps.push({
            x, y,
            vy: 1,
            size: 12,
            type,
            life: 600,
            rotation: 0
        });
    }
    
    collectPowerUp(powerUp) {
        switch (powerUp.type) {
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
                break;
            case 'special':
                this.player.specialAmmo = Math.min(5, this.player.specialAmmo + 2);
                break;
            case 'shield':
                this.player.invulnerable = 300;
                break;
            case 'multishot':
                setTimeout(() => this.multiShot(), 100);
                break;
        }
        this.updateUI();
    }
    
    multiShot() {
        for (let i = 0; i < 5; i++) {
            const angle = Math.atan2(this.mouse.y - this.player.y, this.mouse.x - this.player.x);
            const spread = (i - 2) * 0.3;
            const speed = 10;
            
            this.bullets.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle + spread) * speed,
                vy: Math.sin(angle + spread) * speed,
                size: 4,
                damage: 1,
                type: 'normal',
                life: 100
            });
        }
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
    }
    
    checkWaveCompletion() {
        if (this.enemies.length === 0 && this.enemiesSpawned >= this.enemiesInWave) {
            this.wave++;
            this.enemiesInWave = Math.floor(5 + this.wave * 2.5);
            this.enemiesSpawned = 0;
            this.waveStartTime = Date.now();
            
            this.player.specialAmmo = Math.min(5, this.player.specialAmmo + 1);
            this.score += this.wave * 50;
            
            this.updateUI();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        const finalScore = document.getElementById('final-score');
        const finalWave = document.getElementById('final-wave');
        if (finalScore) finalScore.textContent = this.score;
        if (finalWave) finalWave.textContent = this.wave;
        this.showScreen('game-over-screen');
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pause-screen');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideAllScreens();
        }
    }
    
    updateUI() {
        const scoreEl = document.getElementById('score');
        const waveEl = document.getElementById('wave');
        const livesEl = document.getElementById('lives');
        const ammoEl = document.getElementById('ammo-count');
        const ammoFill = document.getElementById('ammo-fill');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (waveEl) waveEl.textContent = this.wave;
        if (livesEl) livesEl.textContent = this.player.health;
        if (ammoEl) ammoEl.textContent = this.player.specialAmmo;
        
        if (ammoFill) {
            const ammoPercentage = (this.player.specialAmmo / 5) * 100;
            ammoFill.style.width = ammoPercentage + '%';
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawStarfield();
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        this.drawPowerUps();
        this.drawParticles();
    }
    
    drawStarfield() {
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = (i * 137) % this.canvas.width;
            const y = (i * 211) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        
        if (this.player.invulnerable > 0 && Math.floor(this.player.invulnerable / 10) % 2) {
            this.ctx.globalAlpha = 0.5;
        }
        
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.strokeStyle = '#45B7B8';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.player.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#FFA726';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🚀', 0, 8);
        
        this.ctx.restore();
    }
    
    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.save();
            this.ctx.translate(bullet.x, bullet.y);
            
            if (bullet.enemy) {
                this.ctx.fillStyle = '#FF6B6B';
            } else if (bullet.type === 'special') {
                this.ctx.fillStyle = '#4ECDC4';
            } else {
                this.ctx.fillStyle = '#FFE66D';
            }
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, bullet.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
            this.ctx.rotate(enemy.angle);
            
            let color = '#FF6B6B';
            let shape = '👽';
            
            switch (enemy.type) {
                case 'fast':
                    color = '#FF9F43';
                    shape = '🛸';
                    break;
                case 'tank':
                    color = '#8B5A2B';
                    shape = '🚁';
                    break;
                case 'bomber':
                    color = '#6C5CE7';
                    shape = '🛩️';
                    break;
            }
            
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.font = `${enemy.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(shape, 0, enemy.size / 3);
            
            if (enemy.health < enemy.maxHealth) {
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(-enemy.size, -enemy.size - 8, (enemy.health / enemy.maxHealth) * (enemy.size * 2), 4);
            }
            
            this.ctx.restore();
        });
    }
    
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            this.ctx.translate(powerUp.x, powerUp.y);
            this.ctx.rotate(powerUp.rotation);
            
            let color = '#4ECDC4';
            let symbol = '💎';
            
            switch (powerUp.type) {
                case 'health':
                    color = '#00B894';
                    symbol = '❤️';
                    break;
                case 'special':
                    color = '#FDCB6E';
                    symbol = '⚡';
                    break;
                case 'shield':
                    color = '#74B9FF';
                    symbol = '🛡️';
                    break;
                case 'multishot':
                    color = '#FD79A8';
                    symbol = '🎯';
                    break;
            }
            
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, powerUp.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(symbol, 0, 6);
            
            this.ctx.restore();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        }
    }
    
    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.add('hidden');
        });
    }
}