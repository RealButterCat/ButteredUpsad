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
        this.movable = false; // Whether the object can be pushed
        this.ghost = false;   // Whether the object ignores collisions
        
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
        
        // Save the destroyed state to localStorage
        this.saveDestroyedState();
        
        // Remove DOM element if exists
        if (this.element) {
            // Add destruction animation - scale to 0
            this.element.style.transition = 'transform 0.5s ease-out';
            this.element.style.transform = 'scale(0)';
            
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
     * Check collision with another object using bounding-box
     */
    collidesWith(otherObj) {
        // Ghost objects don't collide
        if (this.ghost || otherObj.ghost) return false;
        
        // Bounding-box collision check with a small padding to prevent "sticking"
        const padding = 1;
        return (
            this.x < otherObj.x + otherObj.width - padding &&
            this.x + this.width - padding > otherObj.x &&
            this.y < otherObj.y + otherObj.height - padding &&
            this.y + this.height - padding > otherObj.y
        );
    }
    
    /**
     * Move object by specified amount, handling collisions
     */
    move(dx, dy, objectManager) {
        // If not movable, do nothing
        if (!this.movable) return false;
        
        // Store original position in case we need to revert
        const originalX = this.x;
        const originalY = this.y;
        
        // Apply movement
        this.x += dx;
        this.y += dy;
        
        // Check for collisions with other objects
        let collided = false;
        if (objectManager) {
            const collidingObjects = objectManager.objects.filter(obj => 
                obj !== this && !obj.destroyed && obj.solid && this.collidesWith(obj)
            );
            
            // Handle collisions
            if (collidingObjects.length > 0) {
                // Try to push movable objects
                const movableObjects = collidingObjects.filter(obj => obj.movable);
                
                if (movableObjects.length > 0) {
                    // Attempt to push each movable object
                    let allPushed = true;
                    
                    movableObjects.forEach(obj => {
                        const pushed = obj.move(dx, dy, objectManager);
                        if (!pushed) allPushed = false;
                    });
                    
                    // If we couldn't push all objects, revert position
                    if (!allPushed) {
                        collided = true;
                    }
                } else {
                    // No movable objects to push, so we collided
                    collided = true;
                }
            }
        }
        
        // Check for world boundaries
        if (this.x < 0 || this.x + this.width > window.innerWidth ||
            this.y < 0 || this.y + this.height > window.innerHeight) {
            collided = true;
        }
        
        // If collision occurred, revert position
        if (collided) {
            this.x = originalX;
            this.y = originalY;
            return false;
        }
        
        // Update DOM element position
        if (this.element) {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
        
        return true;
    }
    
    /**
     * Save destroyed state to localStorage
     */
    saveDestroyedState() {
        // Get existing destroyed objects
        const savedDestroyedObjects = localStorage.getItem('butteredUpsad_destroyedObjects');
        let destroyedObjects = savedDestroyedObjects ? JSON.parse(savedDestroyedObjects) : [];
        
        // Add this object's ID if not already in the list
        if (!destroyedObjects.includes(this.id)) {
            destroyedObjects.push(this.id);
            localStorage.setItem('butteredUpsad_destroyedObjects', JSON.stringify(destroyedObjects));
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
            destroyed: this.destroyed,
            movable: this.movable,
            ghost: this.ghost
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
 * MovableBlock object (can be pushed around)
 */
class MovableBlockObject extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height, 'movable-block');
        this.solid = true;
        this.movable = true;
        this.health = 2;
        this.maxHealth = 2;
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.fillStyle = '#3498db';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a pattern to indicate it's movable
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + 5);
        ctx.lineTo(this.x + this.width - 5, this.y + 5);
        ctx.moveTo(this.x + 5, this.y + this.height - 5);
        ctx.lineTo(this.x + this.width - 5, this.y + this.height - 5);
        ctx.stroke();
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
        this.ghost = true; // Collectibles don't block movement
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
        this.ghost = true; // NPCs don't block movement
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
        
        // Trigger dialog event
        const dialogEvent = new CustomEvent('show-dialog', {
            detail: {
                npc: this,
                dialogIndex: this.currentDialogIndex
            }
        });
        
        document.dispatchEvent(dialogEvent);
    }
    
    getDialog(index) {
        if (index >= 0 && index < this.dialogues.length) {
            return this.dialogues[index];
        }
        return null;
    }
    
    setCurrentDialog(index) {
        this.currentDialogIndex = index;
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
        this.destroyedObjects = this.loadDestroyedObjects();
    }
    
    /**
     * Load destroyed objects from localStorage
     */
    loadDestroyedObjects() {
        const savedDestroyedObjects = localStorage.getItem('butteredUpsad_destroyedObjects');
        return savedDestroyedObjects ? JSON.parse(savedDestroyedObjects) : [];
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
        // Check if this object was previously destroyed
        if (this.destroyedObjects.includes(object.id)) {
            // Don't add this object - it's permanently destroyed
            console.log(`Object ${object.id} was previously destroyed, not adding back.`);
            return null;
        }
        
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
        
        // Add class for movable objects
        if (object.movable) {
            element.classList.add('movable');
        }
        
        // Add class for ghost objects
        if (object.ghost) {
            element.classList.add('ghost');
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
     * Check if a position has any solid objects (collision detection)
     */
    isSolidAt(x, y, width, height, excludeObj = null) {
        // Check for solid objects at this position
        return this.objects.some(obj => {
            if (obj === excludeObj || obj.destroyed || !obj.solid) return false;
            
            // Bounding-box collision check
            return (
                x < obj.x + obj.width &&
                x + width > obj.x &&
                y < obj.y + obj.height &&
                y + height > obj.y
            );
        });
    }
    
    /**
     * Try to move an object to a new position, handling collisions
     */
    tryMoveObject(object, newX, newY) {
        if (!object || object.destroyed) return false;
        
        // Calculate movement amount
        const dx = newX - object.x;
        const dy = newY - object.y;
        
        // Attempt to move the object
        return object.move(dx, dy, this);
    }
    
    /**
     * Spawn random objects around the world
     */
    spawnRandomObjects(count = 10) {
        const objectTypes = ['wall', 'tree', 'collectible', 'npc', 'movable-block'];
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
                
                case 'movable-block':
                    object = new MovableBlockObject(x, y, 40, 40);
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
                
                case 'MovableBlockObject':
                    object = new MovableBlockObject(objData.x, objData.y, objData.width, objData.height);
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
