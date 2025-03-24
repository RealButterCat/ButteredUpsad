/**
 * Player
 * Handles player movement, collision, and interactions.
 */

class Player {
    constructor(x, y) {
        // Position
        this.x = x || 100;
        this.y = y || 100;
        this.width = 30;
        this.height = 30;
        
        // Movement
        this.speed = 200; // pixels per second
        this.moveX = 0;
        this.moveY = 0;
        
        // Player state
        this.health = 100;
        this.maxHealth = 100;
        this.level = 1;
        this.experience = 0;
        this.nextLevelXP = 100;
        
        // DOM element
        this.element = document.getElementById('player');
        if (this.element) {
            this.updateElementPosition();
        }
        
        // Input handling
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Set up event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }
    
    /**
     * Update player state
     */
    update(deltaTime) {
        // Reset movement vector
        this.moveX = 0;
        this.moveY = 0;
        
        // Handle movement input
        if (this.keys.up) this.moveY -= 1;
        if (this.keys.down) this.moveY += 1;
        if (this.keys.left) this.moveX -= 1;
        if (this.keys.right) this.moveX += 1;
        
        // Normalize diagonal movement
        if (this.moveX !== 0 && this.moveY !== 0) {
            const length = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY);
            this.moveX /= length;
            this.moveY /= length;
        }
        
        // Apply movement
        this.x += this.moveX * this.speed * deltaTime;
        this.y += this.moveY * this.speed * deltaTime;
        
        // Keep player within bounds
        this.x = Math.max(0, Math.min(window.innerWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(window.innerHeight - this.height, this.y));
        
        // Update DOM element position
        this.updateElementPosition();
    }
    
    /**
     * Render player
     */
    render(ctx) {
        // Draw player shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2 + 5, this.width/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player using canvas
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow effect (optional, for canvas)
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.restore();
    }
    
    /**
     * Update the DOM element position
     */
    updateElementPosition() {
        if (this.element) {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
    }
    
    /**
     * Handle keydown events
     */
    handleKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                break;
        }
    }
    
    /**
     * Handle keyup events
     */
    handleKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
        }
    }
    
    /**
     * Check collision with another object
     */
    collidesWith(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
        );
    }
    
    /**
     * Gain experience
     */
    gainExperience(amount) {
        this.experience += amount;
        
        // Check for level up
        if (this.experience >= this.nextLevelXP) {
            this.levelUp();
        }
        
        console.log(`Gained ${amount} XP. Total: ${this.experience}/${this.nextLevelXP}`);
    }
    
    /**
     * Level up player
     */
    levelUp() {
        this.level++;
        this.experience -= this.nextLevelXP;
        this.nextLevelXP = Math.floor(this.nextLevelXP * 1.5);
        this.maxHealth += 10;
        this.health = this.maxHealth;
        
        console.log(`Level up! Now level ${this.level}`);
        
        // Flash player element for visual feedback
        if (this.element) {
            this.element.classList.add('level-up');
            setTimeout(() => {
                this.element.classList.remove('level-up');
            }, 1000);
        }
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Flash player element for visual feedback
        if (this.element) {
            this.element.classList.add('damaged');
            setTimeout(() => {
                this.element.classList.remove('damaged');
            }, 200);
        }
        
        console.log(`Took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
        
        // Check if player died
        if (this.health <= 0) {
            console.log('Player died!');
            // Handle player death
        }
    }
    
    /**
     * Heal player
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        console.log(`Healed ${amount}. Health: ${this.health}/${this.maxHealth}`);
    }
    
    /**
     * Serialize player state for saving
     */
    serialize() {
        return {
            x: this.x,
            y: this.y,
            health: this.health,
            maxHealth: this.maxHealth,
            level: this.level,
            experience: this.experience,
            nextLevelXP: this.nextLevelXP
        };
    }
    
    /**
     * Deserialize player state from saved data
     */
    deserialize(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.health = data.health || this.health;
        this.maxHealth = data.maxHealth || this.maxHealth;
        this.level = data.level || this.level;
        this.experience = data.experience || this.experience;
        this.nextLevelXP = data.nextLevelXP || this.nextLevelXP;
        
        // Update DOM element position
        this.updateElementPosition();
    }
}
