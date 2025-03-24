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
        this.isInvulnerable = false;
        this.invulnerableTime = 1000; // ms
        
        // DOM element
        this.element = document.getElementById('player');
        this.healthBar = this.element ? this.element.querySelector('.health-bar') : null;
        
        if (this.element) {
            this.updateElementPosition();
            this.updateHealthBar();
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
        const newX = this.x + this.moveX * this.speed * deltaTime;
        const newY = this.y + this.moveY * this.speed * deltaTime;
        
        // Check for collision with world objects
        if (gameEngine && gameEngine.objectManager) {
            const objects = gameEngine.objectManager.objects;
            
            // Check X movement
            let canMoveX = true;
            let playerRect = { 
                x: newX, 
                y: this.y, 
                width: this.width, 
                height: this.height 
            };
            
            for (let obj of objects) {
                if (obj.solid && !obj.destroyed && this.collidesWith(playerRect, obj)) {
                    canMoveX = false;
                    break;
                }
            }
            
            // Check Y movement
            let canMoveY = true;
            playerRect = { 
                x: this.x, 
                y: newY, 
                width: this.width, 
                height: this.height 
            };
            
            for (let obj of objects) {
                if (obj.solid && !obj.destroyed && this.collidesWith(playerRect, obj)) {
                    canMoveY = false;
                    break;
                }
            }
            
            // Apply valid movements
            if (canMoveX) {
                this.x = newX;
            }
            
            if (canMoveY) {
                this.y = newY;
            }
        } else {
            // No collision detection available, move freely
            this.x = newX;
            this.y = newY;
        }
        
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
        const fillColor = this.isInvulnerable ? '#e67e22' : '#e74c3c';
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow effect (optional, for canvas)
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.restore();
        
        // Draw level indicator
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.level.toString(), this.x + this.width/2, this.y + this.height/2);
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
     * Update health bar visuals
     */
    updateHealthBar() {
        if (this.healthBar) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            this.healthBar.style.width = `${healthPercent}%`;
            
            // Change color based on health
            if (healthPercent < 25) {
                this.healthBar.style.backgroundColor = '#e74c3c';
            } else if (healthPercent < 50) {
                this.healthBar.style.backgroundColor = '#f39c12';
            } else {
                this.healthBar.style.backgroundColor = '#2ecc71';
            }
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
            // Add hotkeys for inventory, quests, etc.
            case 'i':
                if (gameEngine && gameEngine.inventoryManager) {
                    gameEngine.inventoryManager.toggleInventoryPanel();
                }
                break;
            case 'q':
                if (gameEngine && gameEngine.questManager) {
                    gameEngine.questManager.toggleQuestsPanel();
                }
                break;
            case ' ': // Spacebar for interaction
                this.interactWithNearbyObjects();
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
     * Interact with nearby objects (used with spacebar)
     */
    interactWithNearbyObjects() {
        if (!gameEngine || !gameEngine.objectManager) return;
        
        const interactionRadius = 50; // pixels
        const objects = gameEngine.objectManager.objects;
        
        // Find nearest interactable object
        let nearestObject = null;
        let nearestDistance = interactionRadius;
        
        for (let obj of objects) {
            if (!obj.interactive || obj.destroyed) continue;
            
            // Calculate distance between player center and object center
            const playerCenterX = this.x + this.width / 2;
            const playerCenterY = this.y + this.height / 2;
            const objCenterX = obj.x + obj.width / 2;
            const objCenterY = obj.y + obj.height / 2;
            
            const dx = playerCenterX - objCenterX;
            const dy = playerCenterY - objCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestObject = obj;
            }
        }
        
        // Interact with nearest object
        if (nearestObject) {
            // Add visual feedback for interaction
            if (nearestObject.element) {
                nearestObject.element.classList.add('interacting');
                setTimeout(() => {
                    nearestObject.element.classList.remove('interacting');
                }, 300);
            }
            
            // Trigger interaction
            nearestObject.onClick({ clientX: nearestObject.x, clientY: nearestObject.y });
            
            // Notify player
            if (gameEngine.uiManager) {
                gameEngine.uiManager.showNotification(`Interacting with ${nearestObject.type}`, 'info');
            }
        }
    }
    
    /**
     * Check collision with another object
     */
    collidesWith(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
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
        
        // Show floating text
        if (gameEngine && gameEngine.uiManager) {
            gameEngine.uiManager.showFloatingText(`+${amount} XP`, this.x + this.width/2, this.y - 20, '#f39c12');
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
        
        // Update health bar
        this.updateHealthBar();
        
        // Add level up visual effect
        if (this.element) {
            this.element.classList.add('level-up');
            setTimeout(() => {
                this.element.classList.remove('level-up');
            }, 1000);
        }
        
        // Show notification
        if (gameEngine && gameEngine.uiManager) {
            gameEngine.uiManager.showNotification(`Level Up! You are now level ${this.level}`, 'success');
            gameEngine.uiManager.showFloatingText(`LEVEL UP!`, this.x + this.width/2, this.y - 30, '#2ecc71');
        }
        
        console.log(`Level up! Now level ${this.level}`);
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        // Check if player is invulnerable
        if (this.isInvulnerable) return;
        
        this.health = Math.max(0, this.health - amount);
        
        // Update health bar
        this.updateHealthBar();
        
        // Flash player element for visual feedback
        if (this.element) {
            this.element.classList.add('damaged');
            setTimeout(() => {
                this.element.classList.remove('damaged');
            }, 200);
        }
        
        // Show damage indicator
        if (gameEngine && gameEngine.uiManager) {
            gameEngine.uiManager.showFloatingText(`-${amount}`, this.x + this.width/2, this.y - 15, '#e74c3c');
        }
        
        // Trigger brief invulnerability
        this.setInvulnerable(this.invulnerableTime);
        
        console.log(`Took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
        
        // Check if player died
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Make player invulnerable for specified time
     */
    setInvulnerable(time) {
        this.isInvulnerable = true;
        
        // Add visual indicator
        if (this.element) {
            this.element.classList.add('invulnerable');
        }
        
        // Clear any existing timer
        if (this.invulnerableTimer) {
            clearTimeout(this.invulnerableTimer);
        }
        
        // Set new timer
        this.invulnerableTimer = setTimeout(() => {
            this.isInvulnerable = false;
            if (this.element) {
                this.element.classList.remove('invulnerable');
            }
        }, time);
    }
    
    /**
     * Player death
     */
    die() {
        console.log('Player died!');
        
        // Visual effect
        if (this.element) {
            this.element.classList.add('dead');
        }
        
        // Notify game engine
        if (gameEngine) {
            // Show death message
            if (gameEngine.uiManager) {
                gameEngine.uiManager.showNotification('You died! Respawning...', 'error');
            }
            
            // Respawn after delay
            setTimeout(() => {
                this.respawn();
            }, 2000);
        }
    }
    
    /**
     * Respawn player
     */
    respawn() {
        // Reset health
        this.health = this.maxHealth;
        this.updateHealthBar();
        
        // Move to random safe location
        if (gameEngine && gameEngine.world) {
            // Find safe spot
            let safeX = Math.random() * (window.innerWidth - this.width);
            let safeY = Math.random() * (window.innerHeight - this.height);
            
            // Center of screen is always safe
            const centerX = window.innerWidth / 2 - this.width / 2;
            const centerY = window.innerHeight / 2 - this.height / 2;
            
            this.x = centerX;
            this.y = centerY;
            this.updateElementPosition();
        }
        
        // Remove visual effects
        if (this.element) {
            this.element.classList.remove('dead');
        }
        
        // Brief invulnerability
        this.setInvulnerable(3000);
        
        // Notify
        if (gameEngine && gameEngine.uiManager) {
            gameEngine.uiManager.showNotification('Respawned!', 'info');
        }
    }
    
    /**
     * Heal player
     */
    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const actualHealAmount = this.health - oldHealth;
        
        // Update health bar
        this.updateHealthBar();
        
        // Visual feedback
        if (gameEngine && gameEngine.uiManager && actualHealAmount > 0) {
            gameEngine.uiManager.showFloatingText(`+${actualHealAmount}`, this.x + this.width/2, this.y - 15, '#2ecc71');
        }
        
        console.log(`Healed ${actualHealAmount}. Health: ${this.health}/${this.maxHealth}`);
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
        
        // Update health bar
        this.updateHealthBar();
    }
}
