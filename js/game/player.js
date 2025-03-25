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
        
        // Movement physics
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.maxSpeed = 350; // Maximum speed in pixels per second
        this.accelerationRate = 1500; // Pixels per second squared
        this.friction = 0.85; // Friction coefficient (0-1 where 1 = no friction)
        
        // Player state
        this.health = 100;
        this.maxHealth = 100;
        this.level = 1;
        this.experience = 0;
        this.nextLevelXP = 100;
        
        // Movement trail effect
        this.trailTimer = 0;
        this.trailInterval = 0.1; // Time between trail particles in seconds
        
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
        // Set acceleration based on input
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        
        // Handle movement input and apply acceleration
        if (this.keys.up) this.acceleration.y -= this.accelerationRate;
        if (this.keys.down) this.acceleration.y += this.accelerationRate;
        if (this.keys.left) this.acceleration.x -= this.accelerationRate;
        if (this.keys.right) this.acceleration.x += this.accelerationRate;
        
        // Normalize diagonal acceleration
        if (this.acceleration.x !== 0 && this.acceleration.y !== 0) {
            const length = Math.sqrt(this.acceleration.x * this.acceleration.x + this.acceleration.y * this.acceleration.y);
            this.acceleration.x = (this.acceleration.x / length) * this.accelerationRate;
            this.acceleration.y = (this.acceleration.y / length) * this.accelerationRate;
        }
        
        // Apply acceleration to velocity
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Cap velocity to max speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
        
        // Stop small movements (prevents sliding forever)
        if (Math.abs(this.velocity.x) < 5) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 5) this.velocity.y = 0;
        
        // Store previous position for collision resolution
        const prevX = this.x;
        const prevY = this.y;
        
        // Apply velocity to position (move X and Y separately for better collision handling)
        this.x += this.velocity.x * deltaTime;
        
        // Check for collisions on X axis
        if (gameEngine && gameEngine.objectManager) {
            const collidingObjectsX = this.getCollidingObjects();
            
            if (collidingObjectsX.length > 0) {
                // Revert X position and stop X velocity
                this.x = prevX;
                this.velocity.x = 0;
            }
        }
        
        // Now move Y and check collisions
        this.y += this.velocity.y * deltaTime;
        
        // Check for collisions on Y axis
        if (gameEngine && gameEngine.objectManager) {
            const collidingObjectsY = this.getCollidingObjects();
            
            if (collidingObjectsY.length > 0) {
                // Revert Y position and stop Y velocity
                this.y = prevY;
                this.velocity.y = 0;
            }
        }
        
        // Keep player within bounds
        this.enforceBoundaries();
        
        // Update DOM element position and appearance
        this.updateElementPosition();
        this.updateElementAppearance(speed);
        
        // Create movement trail when moving fast
        this.updateMovementTrail(deltaTime, speed);
    }
    
    /**
     * Update the player's visual appearance based on speed
     */
    updateElementAppearance(speed) {
        if (!this.element) return;
        
        // Remove existing movement classes
        this.element.classList.remove('moving-fast', 'moving-slow');
        
        // Add class based on current speed
        if (speed > this.maxSpeed * 0.7) {
            this.element.classList.add('moving-fast');
        } else if (speed > this.maxSpeed * 0.3) {
            this.element.classList.add('moving-slow');
        }
    }
    
    /**
     * Create and update movement trail particles
     */
    updateMovementTrail(deltaTime, speed) {
        // Only create trail particles when moving fast enough
        if (speed < this.maxSpeed * 0.5) return;
        
        // Update timer
        this.trailTimer += deltaTime;
        
        // Create new trail particle at interval
        if (this.trailTimer >= this.trailInterval) {
            this.trailTimer = 0;
            
            if (gameEngine && gameEngine.gameContainer) {
                // Create trail particle DOM element
                const trail = document.createElement('div');
                trail.className = 'movement-trail';
                trail.style.left = `${this.x + this.width/2 - 5}px`;
                trail.style.top = `${this.y + this.height/2 - 5}px`;
                
                // Add to game container
                gameEngine.gameContainer.appendChild(trail);
                
                // Remove after animation is done
                setTimeout(() => {
                    if (trail.parentNode) {
                        trail.parentNode.removeChild(trail);
                    }
                }, 600);
            }
        }
    }
    
    /**
     * Keep player within screen boundaries
     */
    enforceBoundaries() {
        if (this.x < 0) {
            this.x = 0;
            this.velocity.x = 0;
        } else if (this.x > window.innerWidth - this.width) {
            this.x = window.innerWidth - this.width;
            this.velocity.x = 0;
        }
        
        if (this.y < 0) {
            this.y = 0;
            this.velocity.y = 0;
        } else if (this.y > window.innerHeight - this.height) {
            this.y = window.innerHeight - this.height;
            this.velocity.y = 0;
        }
    }
    
    /**
     * Get all objects currently colliding with the player
     */
    getCollidingObjects() {
        if (!gameEngine || !gameEngine.objectManager) return [];
        
        return gameEngine.objectManager.objects.filter(obj => {
            return obj.solid && !obj.destroyed && this.collidesWith(obj);
        });
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
        
        // Draw player using canvas - standard is a circle
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow effect
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.restore();
        
        // Optional: Draw direction indicator if moving
        if (Math.abs(this.velocity.x) > 5 || Math.abs(this.velocity.y) > 5) {
            const dir = Math.atan2(this.velocity.y, this.velocity.x);
            const indicatorLength = 15;
            
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
            ctx.lineTo(
                this.x + this.width/2 + Math.cos(dir) * indicatorLength,
                this.y + this.height/2 + Math.sin(dir) * indicatorLength
            );
            ctx.stroke();
        }
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
            velocity: this.velocity,
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
        this.velocity = data.velocity || { x: 0, y: 0 };
        this.health = data.health || this.health;
        this.maxHealth = data.maxHealth || this.maxHealth;
        this.level = data.level || this.level;
        this.experience = data.experience || this.experience;
        this.nextLevelXP = data.nextLevelXP || this.nextLevelXP;
        
        // Update DOM element position
        this.updateElementPosition();
    }
}
