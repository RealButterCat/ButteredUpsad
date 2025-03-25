/**
 * Game Objects
 * Defines various game object types and the manager for them.
 */

/**
 * Base GameObject class
 */
class GameObject {
    constructor(x, y, width, height, type) {
        this.id = Math.random().toString(36).substr(2, 9); // Unique ID
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type || 'generic';
        
        // State
        this.health = 1;
        this.maxHealth = 1;
        this.solid = false;
        this.interactive = true;
        this.visible = true;
        this.destroyed = false;
        
        // DOM element (created by manager when added to the world)
        this.element = null;
    }
    
    /**
     * Update object state
     */
    update(deltaTime) {
        // Base update logic (can be overridden by subclasses)
    }
    
    /**
     * Render object
     */
    render(ctx) {
        if (!this.visible) return;
        
        // Default rendering (can be overridden by subclasses)
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    /**
     * Handle click interaction
     */
    onClick(event) {
        if (!this.interactive) return;
        
        console.log(`Clicked on ${this.type} object (ID: ${this.id})`);
        
        // Default click behavior is to take damage
        if (this.health > 0) {
            this.takeDamage(1);
        }
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        if (!this.interactive) return;
        
        this.health = Math.max(0, this.health - amount);
        
        // Visual feedback
        if (this.element) {
            this.element.classList.add('shake');
            setTimeout(() => {
                this.element.classList.remove('shake');
            }, 200);
            
            // Update visual damage state
            this.updateDamageVisual();
        }
        
        console.log(`${this.type} took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
        
        // Check if destroyed
        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    /**
     * Update visual representation of damage
     */
    updateDamageVisual() {
        if (!this.element) return;
        
        // Remove any existing damage classes
        this.element.classList.remove('damaged-1', 'damaged-2');
        
        // Add appropriate damage class based on health percentage
        const healthPercentage = this.health / this.maxHealth;
        
        if (healthPercentage <= 0.33) {
            this.element.classList.add('damaged-2');
        } else if (healthPercentage <= 0.66) {
            this.element.classList.add('damaged-1');
        }
    }
    
    /**
     * Destroy object
     */
    destroy() {
        if (this.destroyed) return;
        
        this.destroyed = true;
        this.interactive = false;
        this.solid = false;
        
        console.log(`${this.type} destroyed (ID: ${this.id})`);
        
        // Remove DOM element if exists
        if (this.element) {
            // Add destruction animation
            this.element.classList.add('destroying');
            
            // Remove after animation completes
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.element = null;
            }, 500);
        }
    }
    
    /**
     * Serialize object for saving
     */
    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            solid: this.solid,
            interactive: this.interactive,
            visible: this.visible,
            destroyed: this.destroyed
        };
    }
    
    /**
     * Deserialize from saved data
     */
    deserialize(data) {
        Object.assign(this, data);
    }
}

/**
 * Wall object (solid barrier)
 */
class WallObject extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height, 'wall');
        this.solid = true;
        this.health = 3;
        this.maxHealth = 3;
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a border
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

/**
 * Tree object (decorative, breakable)
 */
class TreeObject extends GameObject {
    constructor(x, y) {
        const size = 40;
        super(x, y, size, size, 'tree');
        this.solid = true;
        this.health = 2;
        this.maxHealth = 2;
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        // Draw tree trunk
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(this.x + this.width/3, this.y + this.height/2, this.width/3, this.height/2);
        
        // Draw tree top (circle)
        ctx.fillStyle = '#2ecc71'; // Green
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/3, this.width/2 - 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Collectible object (item that can be picked up)
 */
class CollectibleObject extends GameObject {
    constructor(x, y, itemType) {
        const size = 20;
        super(x, y, size, size, 'collectible');
        this.itemType = itemType || 'coin';
        this.solid = false;
        this.value = 1;
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        // Draw a circle for the collectible
        ctx.fillStyle = '#f1c40f'; // Gold color
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw a subtle glow
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f39c12';
        ctx.fill();
        ctx.restore();
    }
    
    onClick(event) {
        if (!this.interactive || this.destroyed) return;
        
        console.log(`Collected ${this.itemType} (value: ${this.value})`);
        
        // Add to inventory (this will be called by the inventory manager)
        const inventoryEvent = new CustomEvent('collect-item', {
            detail: {
                type: this.itemType,
                value: this.value,
                objectId: this.id
            }
        });
        
        document.dispatchEvent(inventoryEvent);
        
        // Destroy the object
        this.destroy();
    }
}

/**
 * NPC object (non-player character for dialog/quests)
 */
class NPCObject extends GameObject {
    constructor(x, y, name) {
        const size = 30;
        super(x, y, size, size, 'npc');
        this.name = name || 'Unknown NPC';
        this.solid = false;
        
        // Dialogue options stored in JSON format
        this.dialogues = [
            { text: "Hello there! I'm an NPC.", options: [
                { text: "Hello!", responseIndex: 1 },
                { text: "What can you do?", responseIndex: 2 },
                { text: "Goodbye.", responseIndex: -1 }
            ]},
            { text: "Nice to meet you!", options: [
                { text: "What can you do?", responseIndex: 2 },
                { text: "Goodbye.", responseIndex: -1 }
            ]},
            { text: "I can give quests or just chat with you!", options: [
                { text: "Interesting!", responseIndex: 3 },
                { text: "Goodbye.", responseIndex: -1 }
            ]},
            { text: "Remember, you can interact with anything in this world!", options: [
                { text: "I'll try that out. Goodbye!", responseIndex: -1 }
            ]}
        ];
        this.currentDialogIndex = 0;
        
        // Movement properties
        this.moveSpeed = 20 + Math.random() * 30; // pixels per second, random speed
        this.moveDirectionX = 0;
        this.moveDirectionY = 0;
        this.moveTimer = null; // for changing direction
        this.isMoving = false;
        this.isTalking = false; // Pause movement during conversation
        
        // Start wandering behavior
        this.startWandering();
    }
    
    /**
     * Start random wandering behavior
     */
    startWandering() {
        // Set initial random direction
        this.changeDirection();
        
        // Change direction periodically
        this.moveTimer = setInterval(() => {
            if (!this.isTalking) {
                this.changeDirection();
            }
        }, 2000 + Math.random() * 3000); // Change direction every 2-5 seconds
    }
    
    /**
     * Change NPC movement direction randomly
     */
    changeDirection() {
        // Random chance to stop/start moving
        if (Math.random() < 0.2) {
            this.isMoving = false;
            this.moveDirectionX = 0;
            this.moveDirectionY = 0;
            return;
        }
        
        this.isMoving = true;
        
        // Generate random direction vector
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        this.moveDirectionX = Math.cos(angle);
        this.moveDirectionY = Math.sin(angle);
        
        // Normalize to ensure consistent speed in all directions
        const length = Math.sqrt(
            this.moveDirectionX * this.moveDirectionX + 
            this.moveDirectionY * this.moveDirectionY
        );
        
        if (length > 0) {
            this.moveDirectionX /= length;
            this.moveDirectionY /= length;
        }
    }
    
    /**
     * Update NPC state
     */
    update(deltaTime) {
        // Don't move if talking or destroyed
        if (this.isTalking || this.destroyed) return;
        
        // Move in the current direction if moving
        if (this.isMoving) {
            const moveAmount = this.moveSpeed * deltaTime;
            
            // Calculate new position
            const newX = this.x + this.moveDirectionX * moveAmount;
            const newY = this.y + this.moveDirectionY * moveAmount;
            
            // Check boundaries to stay within screen and not block critical paths
            const padding = 20; // padding to stay away from edges
            const minX = padding;
            const minY = padding;
            const maxX = window.innerWidth - this.width - padding;
            const maxY = window.innerHeight - this.height - padding;
            
            // Apply position with boundary checks
            if (newX >= minX && newX <= maxX) {
                this.x = newX;
            } else {
                // Hit boundary, reverse direction on x-axis
                this.moveDirectionX *= -1;
            }
            
            if (newY >= minY && newY <= maxY) {
                this.y = newY;
            } else {
                // Hit boundary, reverse direction on y-axis
                this.moveDirectionY *= -1;
            }
            
            // Update DOM element position if it exists
            if (this.element) {
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            }
        }
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        // Draw NPC as a triangle
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw name above NPC
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width/2, this.y - 5);
    }
    
    onClick(event) {
        if (!this.interactive || this.destroyed) return;
        
        console.log(`Talking to NPC: ${this.name}`);
        
        // Set talking state to pause movement
        this.setTalking(true);
        
        // Trigger dialog event
        const dialogEvent = new CustomEvent('show-dialog', {
            detail: {
                npc: this,
                dialogIndex: this.currentDialogIndex
            }
        });
        
        document.dispatchEvent(dialogEvent);
    }
    
    /**
     * Set talking state to pause/resume wandering
     */
    setTalking(isTalking) {
        this.isTalking = isTalking;
    }
    
    getDialog(index) {
        if (index >= 0 && index < this.dialogues.length) {
            return this.dialogues[index];
        }
        return null;
    }
    
    setCurrentDialog(index) {
        this.currentDialogIndex = index;
        
        // Resume wandering if dialog ends (index is negative)
        if (index < 0) {
            this.setTalking(false);
        }
    }
    
    /**
     * Clean up resources when destroyed
     */
    destroy() {
        // Clear the wandering timer
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
            this.moveTimer = null;
        }
        
        // Call parent destroy method
        super.destroy();
    }
    
    /**
     * Enhanced serialization including wandering state
     */
    serialize() {
        const data = super.serialize();
        return {
            ...data,
            name: this.name,
            dialogues: this.dialogues,
            currentDialogIndex: this.currentDialogIndex,
            moveSpeed: this.moveSpeed,
            isMoving: this.isMoving
        };
    }
    
    /**
     * Enhanced deserialization
     */
    deserialize(data) {
        super.deserialize(data);
        
        // Restore NPC-specific properties
        this.name = data.name || this.name;
        this.dialogues = data.dialogues || this.dialogues;
        this.currentDialogIndex = data.currentDialogIndex || 0;
        this.moveSpeed = data.moveSpeed || (20 + Math.random() * 30);
        
        // Reset movement state and restart wandering
        this.isMoving = data.isMoving !== undefined ? data.isMoving : true;
        
        // Start wandering again if no timer exists
        if (!this.moveTimer) {
            this.startWandering();
        }
    }
}

/**
 * Game Object Manager
 * Handles creation, updating, and rendering of all game objects
 */
class GameObjectManager {
    constructor() {
        this.objects = [];
        this.container = document.getElementById('game-container');
    }
    
    /**
     * Update all objects
     */
    update(deltaTime) {
        // Update all non-destroyed objects
        this.objects.forEach(obj => {
            if (!obj.destroyed) {
                obj.update(deltaTime);
            }
        });
        
        // Remove destroyed objects
        this.objects = this.objects.filter(obj => !obj.destroyed);
    }
    
    /**
     * Render all objects
     */
    render(ctx) {
        // Render all visible objects
        this.objects.forEach(obj => {
            if (obj.visible && !obj.destroyed) {
                obj.render(ctx);
            }
        });
    }
    
    /**
     * Add a new object to the world
     */
    addObject(object) {
        this.objects.push(object);
        
        // Create DOM element for the object
        this.createDOMElement(object);
        
        return object;
    }
    
    /**
     * Create DOM element for an object
     */
    createDOMElement(object) {
        // Skip if already has element or container not found
        if (object.element || !this.container) return;
        
        // Create element
        const element = document.createElement('div');
        element.className = `game-object ${object.type}`;
        element.dataset.id = object.id;
        
        // Set position and size
        element.style.left = `${object.x}px`;
        element.style.top = `${object.y}px`;
        element.style.width = `${object.width}px`;
        element.style.height = `${object.height}px`;
        
        // Add class for interactive objects
        if (object.interactive) {
            element.classList.add('interactable');
        }
        
        // Add class for solid objects
        if (object.solid) {
            element.classList.add('solid');
        }
        
        // Set initial damage visual if needed
        if (object.health < object.maxHealth) {
            const healthPercentage = object.health / object.maxHealth;
            
            if (healthPercentage <= 0.33) {
                element.classList.add('damaged-2');
            } else if (healthPercentage <= 0.66) {
                element.classList.add('damaged-1');
            }
        }
        
        // Add click handler
        element.addEventListener('click', (event) => {
            object.onClick(event);
        });
        
        // Store reference to element
        object.element = element;
        
        // Add to container
        this.container.appendChild(element);
    }
    
    /**
     * Find object by ID
     */
    getObjectById(id) {
        return this.objects.find(obj => obj.id === id);
    }
    
    /**
     * Find objects at pixel coordinates
     */
    getObjectsAt(x, y) {
        return this.objects.filter(obj => {
            return !obj.destroyed &&
                   x >= obj.x && x <= obj.x + obj.width &&
                   y >= obj.y && y <= obj.y + obj.height;
        });
    }
    
    /**
     * Spawn random objects around the world
     */
    spawnRandomObjects(count = 10) {
        const objectTypes = ['wall', 'tree', 'collectible', 'npc'];
        const npcNames = ['Guide', 'Trader', 'Explorer', 'Wizard', 'Blacksmith'];
        
        for (let i = 0; i < count; i++) {
            const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
            const x = Math.random() * (window.innerWidth - 50);
            const y = Math.random() * (window.innerHeight - 50);
            
            let object;
            
            switch (type) {
                case 'wall':
                    const width = 30 + Math.random() * 70;
                    const height = 30 + Math.random() * 70;
                    object = new WallObject(x, y, width, height);
                    break;
                    
                case 'tree':
                    object = new TreeObject(x, y);
                    break;
                    
                case 'collectible':
                    object = new CollectibleObject(x, y, 'coin');
                    break;
                    
                case 'npc':
                    const name = npcNames[Math.floor(Math.random() * npcNames.length)];
                    object = new NPCObject(x, y, name);
                    break;
                    
                default:
                    object = new GameObject(x, y, 30, 30, type);
            }
            
            this.addObject(object);
        }
    }
    
    /**
     * Remove all objects
     */
    clearAllObjects() {
        // Destroy all objects
        this.objects.forEach(obj => {
            obj.destroy();
        });
        
        // Clear array
        this.objects = [];
    }
    
    /**
     * Serialize all objects for saving
     */
    serialize() {
        return this.objects.map(obj => {
            const data = obj.serialize();
            data.className = obj.constructor.name;
            return data;
        });
    }
    
    /**
     * Deserialize objects from saved data
     */
    deserialize(data) {
        if (!data || !Array.isArray(data)) return;
        
        // Clear existing objects
        this.clearAllObjects();
        
        // Create objects from saved data
        data.forEach(objData => {
            if (objData.destroyed) return; // Skip destroyed objects
            
            let object;
            
            // Create appropriate object type
            switch (objData.className) {
                case 'WallObject':
                    object = new WallObject(objData.x, objData.y, objData.width, objData.height);
                    break;
                    
                case 'TreeObject':
                    object = new TreeObject(objData.x, objData.y);
                    break;
                    
                case 'CollectibleObject':
                    object = new CollectibleObject(objData.x, objData.y, objData.itemType);
                    break;
                    
                case 'NPCObject':
                    object = new NPCObject(objData.x, objData.y, objData.name);
                    break;
                    
                default:
                    object = new GameObject(objData.x, objData.y, objData.width, objData.height, objData.type);
            }
            
            // Copy saved properties
            object.deserialize(objData);
            
            // Add to world
            this.addObject(object);
        });
    }
}