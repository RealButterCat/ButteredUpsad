/**
 * Game Engine
 * Handles core game functionality, rendering, and loop.
 */

class GameEngine {
    constructor() {
        // Game state
        this.isRunning = false;
        this.lastTimestamp = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // ms
        this.lastFpsUpdate = 0;
        this.fps = 0;
        this.gameContainer = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // Game systems
        this.player = null;
        this.world = null;
        this.objectManager = null;
        this.interactionManager = null;
        this.inventoryManager = null;
        this.dialogManager = null;
        this.questManager = null;
        this.uiManager = null;
        
        // Game state variables
        this.score = 0;
        this.gameTime = 0; // seconds
        
        // Initialize game container
        if (this.canvas) {
            this.initializeCanvas();
        }
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Event listeners
        window.addEventListener('resize', this.handleResize);
    }
    
    /**
     * Start the game
     */
    start() {
        if (this.isRunning) return;
        
        console.log('Starting game engine...');
        
        // Set up game systems in order
        this.player = new Player(
            window.innerWidth / 2, 
            window.innerHeight / 2
        );
        
        this.world = new World();
        this.objectManager = new GameObjectManager();
        this.interactionManager = new InteractionManager(this);
        this.inventoryManager = new InventoryManager();
        this.dialogManager = new DialogManager();
        
        // Set the quest manager if not already set
        if (!this.questManager) {
            this.questManager = new QuestManager();
        }
        
        // Load saved game state if exists
        this.loadGameState();
        
        // Show game container
        if (this.gameContainer) {
            this.gameContainer.classList.remove('hidden');
            this.gameContainer.classList.add('active');
        }
        
        // Reset timing variables
        this.lastTimestamp = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.lastTimestamp;
        
        // Start game loop
        this.isRunning = true;
        requestAnimationFrame(this.gameLoop);
        
        // Initialize interactions
        if (this.interactionManager) {
            this.interactionManager.initialize();
        }
        
        // Show welcome notification
        if (this.uiManager) {
            this.uiManager.showNotification('Welcome to ButteredUpsad!', 'info');
        }
        
        console.log('Game engine started!');
    }
    
    /**
     * Stop the game
     */
    stop() {
        if (!this.isRunning) return;
        
        console.log('Stopping game engine...');
        
        // Save current game state
        this.saveGameState();
        
        // Hide game container
        if (this.gameContainer) {
            this.gameContainer.classList.remove('active');
            this.gameContainer.classList.add('hidden');
        }
        
        // Stop game loop
        this.isRunning = false;
        
        // Clean up
        if (this.interactionManager) {
            this.interactionManager.cleanup();
        }
        
        console.log('Game engine stopped!');
    }
    
    /**
     * Game loop
     */
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time (time since last frame in seconds)
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        
        // Update game time
        this.gameTime += deltaTime;
        
        // Limit delta time to avoid large jumps
        const cappedDeltaTime = Math.min(deltaTime, 0.1);
        
        // Clear canvas
        this.clearCanvas();
        
        // Update game state
        this.update(cappedDeltaTime);
        
        // Render game objects
        this.render();
        
        // Update FPS counter
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            this.lastFpsUpdate = timestamp;
            this.frameCount = 0;
            
            // Optionally display FPS
            // console.log(`FPS: ${this.fps}`);
        }
        
        // Schedule next frame
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update world objects
        if (this.objectManager) {
            this.objectManager.update(deltaTime);
        }
        
        // Check for collisions between player and game objects
        this.checkCollisions();
        
        // Update game time-based events
        this.updateTimedEvents(deltaTime);
    }
    
    /**
     * Check for collisions between player and game objects
     */
    checkCollisions() {
        if (!this.player || !this.objectManager) return;
        
        // Get all objects
        const objects = this.objectManager.objects;
        
        for (const obj of objects) {
            // Skip destroyed objects
            if (obj.destroyed) continue;
            
            // Check for collectibles (automatic collection on contact)
            if (obj.type === 'collectible' && this.player.collidesWith(obj)) {
                // Collect item
                const itemData = {
                    type: obj.itemType || 'coin',
                    value: obj.value || 1,
                    x: obj.x,
                    y: obj.y
                };
                
                // Create collectible event
                const collectEvent = new CustomEvent('collect-item', {
                    detail: itemData
                });
                
                document.dispatchEvent(collectEvent);
                
                // Destroy the object
                obj.destroy();
            }
            
            // Check for harmful objects
            if (obj.harmful && this.player.collidesWith(obj) && !this.player.isInvulnerable) {
                this.player.takeDamage(obj.damage || 1);
            }
        }
    }
    
    /**
     * Update events based on game time
     */
    updateTimedEvents(deltaTime) {
        // Check for periodic events based on game time
        
        // Example: Spawn a collectible every 10 seconds
        if (Math.floor(this.gameTime) % 10 === 0 && Math.floor(this.gameTime) !== Math.floor(this.gameTime - deltaTime)) {
            if (this.objectManager) {
                this.spawnRandomCollectible();
            }
        }
    }
    
    /**
     * Spawn a random collectible
     */
    spawnRandomCollectible() {
        if (!this.objectManager) return;
        
        // Find a clear space
        let x, y;
        let tries = 0;
        const maxTries = 10;
        let validPosition = false;
        
        while (!validPosition && tries < maxTries) {
            x = Math.random() * (window.innerWidth - 50) + 25;
            y = Math.random() * (window.innerHeight - 50) + 25;
            
            // Check if position is clear of other objects
            validPosition = !this.objectManager.objects.some(obj => {
                const dx = obj.x - x;
                const dy = obj.y - y;
                const minDistance = 50; // Minimum distance from other objects
                return Math.sqrt(dx * dx + dy * dy) < minDistance;
            });
            
            tries++;
        }
        
        if (validPosition) {
            // Create a collectible
            const collectible = new CollectibleObject(x, y, 'coin');
            this.objectManager.addObject(collectible);
            
            // Notify player if UI manager exists
            if (this.uiManager) {
                this.uiManager.showFloatingText('New collectible!', x, y - 20, '#f1c40f');
            }
        }
    }
    
    /**
     * Render game objects
     */
    render() {
        if (!this.ctx) return;
        
        // Render world
        if (this.world) {
            this.world.render(this.ctx);
        }
        
        // Render game objects
        if (this.objectManager) {
            this.objectManager.render(this.ctx);
        }
        
        // Render player
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Render debug info if needed
        this.renderDebugInfo();
    }
    
    /**
     * Render debug information
     */
    renderDebugInfo() {
        if (!this.ctx) return;
        
        // Show FPS and object count in debug mode
        const showDebug = true; // Can be toggled
        
        if (showDebug) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(10, 10, 150, 60);
            
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            
            this.ctx.fillText(`FPS: ${this.fps}`, 20, 20);
            this.ctx.fillText(`Objects: ${this.objectManager ? this.objectManager.objects.length : 0}`, 20, 40);
            this.ctx.fillText(`Game Time: ${Math.floor(this.gameTime)}s`, 20, 60);
            
            this.ctx.restore();
        }
    }
    
    /**
     * Initialize canvas
     */
    initializeCanvas() {
        this.handleResize();
    }
    
    /**
     * Clear canvas
     */
    clearCanvas() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.canvas) return;
        
        // Get device pixel ratio for better canvas clarity
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size based on CSS size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale canvas to match CSS size
        this.ctx.scale(dpr, dpr);
        
        // Fix CSS size
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        
        // Update world if initialized
        if (this.world && this.world.handleResize) {
            this.world.handleResize();
        }
    }
    
    /**
     * Save game state to localStorage
     */
    saveGameState() {
        // Create game state object
        const gameState = {
            version: 1, // For future compatibility
            timestamp: Date.now(),
            gameTime: this.gameTime,
            score: this.score,
            player: this.player ? this.player.serialize() : null,
            world: this.world ? this.world.serialize() : null,
            objects: this.objectManager ? this.objectManager.serialize() : null,
            inventory: this.inventoryManager ? this.inventoryManager.serialize() : null,
            quests: this.questManager ? this.questManager.serialize() : null
        };
        
        // Save to localStorage
        try {
            localStorage.setItem('butteredUpsad_gameState', JSON.stringify(gameState));
            console.log('Game state saved!');
            
            // Show notification if UI manager exists
            if (this.uiManager) {
                this.uiManager.showNotification('Game state saved', 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Error saving game state:', error);
            
            // Show error notification if UI manager exists
            if (this.uiManager) {
                this.uiManager.showNotification('Failed to save game state', 'error');
            }
            
            return false;
        }
    }
    
    /**
     * Load game state from localStorage
     */
    loadGameState() {
        const savedState = localStorage.getItem('butteredUpsad_gameState');
        
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                
                // Check version for compatibility
                if (!gameState.version || gameState.version < 1) {
                    console.warn('Game state is from an older version, may not load correctly');
                }
                
                // Restore game state
                this.gameTime = gameState.gameTime || 0;
                this.score = gameState.score || 0;
                
                // Load player state
                if (gameState.player && this.player) {
                    this.player.deserialize(gameState.player);
                }
                
                // Load world state
                if (gameState.world && this.world) {
                    this.world.deserialize(gameState.world);
                }
                
                // Load objects state
                if (gameState.objects && this.objectManager) {
                    this.objectManager.deserialize(gameState.objects);
                }
                
                // Load inventory state
                if (gameState.inventory && this.inventoryManager) {
                    this.inventoryManager.deserialize(gameState.inventory);
                }
                
                // Load quests state
                if (gameState.quests && this.questManager) {
                    this.questManager.deserialize(gameState.quests);
                }
                
                console.log('Game state loaded!');
                
                // Show notification if UI manager exists
                if (this.uiManager) {
                    this.uiManager.showNotification('Game state loaded', 'success');
                }
                
                return true;
            } catch (error) {
                console.error('Error loading game state:', error);
                
                // Show error notification if UI manager exists
                if (this.uiManager) {
                    this.uiManager.showNotification('Failed to load game state', 'error');
                }
                
                return false;
            }
        }
        
        return false; // No saved state
    }
    
    /**
     * Reset game state
     */
    resetGameState() {
        localStorage.removeItem('butteredUpsad_gameState');
        console.log('Game state reset!');
        
        // Show notification if UI manager exists
        if (this.uiManager) {
            this.uiManager.showNotification('Game state reset', 'warning');
        }
        
        // Stop the game if it's running
        if (this.isRunning) {
            this.stop();
        }
        
        // Reload the page to start fresh
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    /**
     * Add score points
     */
    addScore(points) {
        this.score += points;
        
        // Show notification if UI manager exists
        if (this.uiManager) {
            this.uiManager.showNotification(`+${points} points!`, 'success');
        }
        
        console.log(`Added ${points} points. Total score: ${this.score}`);
    }
    
    /**
     * Trigger a special effect on the website
     * @param {string} effectType - Type of effect to trigger
     * @param {number} duration - Duration in milliseconds
     */
    triggerWebsiteEffect(effectType, duration = 2000) {
        switch (effectType) {
            case 'invert':
                document.body.classList.add('game-invert');
                setTimeout(() => {
                    document.body.classList.remove('game-invert');
                }, duration);
                break;
                
            case 'shake':
                document.body.classList.add('game-shake');
                setTimeout(() => {
                    document.body.classList.remove('game-shake');
                }, duration);
                break;
                
            case 'special':
                document.body.classList.add('special-effect');
                setTimeout(() => {
                    document.body.classList.remove('special-effect');
                }, duration);
                break;
                
            default:
                console.warn(`Unknown effect type: ${effectType}`);
        }
    }
    
    /**
     * Register a scheduled event to happen at a specific game time
     * @param {number} time - Game time in seconds when event should trigger
     * @param {Function} callback - Function to call when event triggers
     * @param {boolean} repeat - Whether event should repeat
     * @param {number} interval - Interval in seconds for repeating events
     */
    scheduleEvent(time, callback, repeat = false, interval = 0) {
        if (!this.scheduledEvents) {
            this.scheduledEvents = [];
        }
        
        this.scheduledEvents.push({
            time,
            callback,
            repeat,
            interval,
            lastTriggered: 0
        });
    }
    
    /**
     * Check and trigger scheduled events
     */
    checkScheduledEvents() {
        if (!this.scheduledEvents || this.scheduledEvents.length === 0) return;
        
        const currentTime = this.gameTime;
        
        this.scheduledEvents.forEach(event => {
            // For one-time events
            if (!event.repeat && currentTime >= event.time && event.lastTriggered === 0) {
                event.callback();
                event.lastTriggered = currentTime;
            }
            
            // For repeating events
            if (event.repeat && event.interval > 0) {
                // First execution
                if (event.lastTriggered === 0 && currentTime >= event.time) {
                    event.callback();
                    event.lastTriggered = currentTime;
                } 
                // Subsequent executions
                else if (event.lastTriggered > 0 && currentTime >= event.lastTriggered + event.interval) {
                    event.callback();
                    event.lastTriggered = currentTime;
                }
            }
        });
        
        // Clean up completed one-time events
        this.scheduledEvents = this.scheduledEvents.filter(event => 
            event.repeat || event.lastTriggered === 0
        );
    }
}

// Global game engine instance
let gameEngine = null;
