/**
 * Game Engine
 * Handles core game functionality, rendering, and loop.
 */

class GameEngine {
    constructor() {
        // Game state
        this.isRunning = false;
        this.lastTimestamp = 0;
        this.gameContainer = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Player stats
        this.playerStats = {
            blocksBroken: 0,
            stepsTaken: 0,
            itemsCollected: 0,
            itemsDropped: 0,
            itemsUsed: 0,
            coinsUsed: 0,
            keysUsed: 0,
            specialItemsUsed: 0,
            distanceTraveled: 0,
            areaExplored: 0,
            interactionsPerformed: 0
        };
        
        // Game systems
        this.player = null;
        this.world = null;
        this.objectManager = null;
        this.interactionManager = null;
        this.inventoryManager = null;
        this.dialogManager = null;
        
        // Initialize game container
        this.initializeCanvas();
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.updateStats = this.updateStats.bind(this);
        this.logStats = this.logStats.bind(this);
        
        // Event listeners
        window.addEventListener('resize', this.handleResize);
    }
    
    /**
     * Start the game
     */
    start() {
        if (this.isRunning) return;
        
        console.log('Starting game engine...');
        
        // Set up game systems
        this.player = new Player(
            window.innerWidth / 2, 
            window.innerHeight / 2
        );
        
        this.world = new World();
        this.objectManager = new GameObjectManager();
        this.interactionManager = new InteractionManager(this);
        this.inventoryManager = new InventoryManager();
        this.dialogManager = new DialogManager();
        
        // Reset player stats
        this.resetStats();
        
        // Load saved game state if exists
        this.loadGameState();
        
        // Show game container
        this.gameContainer.classList.remove('hidden');
        this.gameContainer.classList.add('active');
        
        // Start game loop
        this.isRunning = true;
        requestAnimationFrame(this.gameLoop);
        
        // Initialize interactions
        this.interactionManager.initialize();
        
        // Set up stat logging interval (every 30 seconds)
        this.statLoggingInterval = setInterval(this.logStats, 30000);
        
        console.log('Game engine started!');
        console.log('Player stats are being tracked and logged to console.');
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
        this.gameContainer.classList.remove('active');
        this.gameContainer.classList.add('hidden');
        
        // Stop game loop
        this.isRunning = false;
        
        // Clean up
        this.interactionManager.cleanup();
        
        // Clear stat logging interval
        if (this.statLoggingInterval) {
            clearInterval(this.statLoggingInterval);
        }
        
        // Log final stats
        this.logStats();
        
        console.log('Game engine stopped!');
    }
    
    /**
     * Game loop
     */
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // Clear canvas
        this.clearCanvas();
        
        // Update game state
        this.update(deltaTime / 1000); // Convert to seconds
        
        // Render game objects
        this.render();
        
        // Schedule next frame
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        // Track previous player position for step detection
        let prevX = 0;
        let prevY = 0;
        
        if (this.player) {
            prevX = this.player.x;
            prevY = this.player.y;
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
            
            // Track steps taken and distance traveled
            if (prevX !== this.player.x || prevY !== this.player.y) {
                const dx = this.player.x - prevX;
                const dy = this.player.y - prevY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Only count as a step if moved more than 5 pixels
                if (distance > 5) {
                    this.playerStats.stepsTaken++;
                    this.playerStats.distanceTraveled += distance;
                }
            }
        }
        
        // Update world objects
        if (this.objectManager) {
            this.objectManager.update(deltaTime);
        }
        
        // Update stats periodically
        this.updateStats(deltaTime);
    }
    
    /**
     * Update player statistics
     */
    updateStats(deltaTime) {
        // Nothing additional to update here, as most stats are updated
        // in their respective interaction points
    }
    
    /**
     * Log player stats to console
     */
    logStats() {
        console.log('--- PLAYER STATS ---');
        Object.entries(this.playerStats).forEach(([stat, value]) => {
            console.log(`${stat}: ${value}`);
        });
        console.log('-------------------');
    }
    
    /**
     * Reset player stats
     */
    resetStats() {
        // Reset all stats to zero
        Object.keys(this.playerStats).forEach(stat => {
            this.playerStats[stat] = 0;
        });
    }
    
    /**
     * Increment a specific player stat
     */
    incrementStat(statName, amount = 1) {
        if (this.playerStats[statName] !== undefined) {
            this.playerStats[statName] += amount;
        } else {
            // Create new stat if it doesn't exist
            this.playerStats[statName] = amount;
        }
    }
    
    /**
     * Render game objects
     */
    render() {
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Save game state to localStorage
     */
    saveGameState() {
        const gameState = {
            player: this.player ? this.player.serialize() : null,
            world: this.world ? this.world.serialize() : null,
            objects: this.objectManager ? this.objectManager.serialize() : null,
            inventory: this.inventoryManager ? this.inventoryManager.serialize() : null,
            playerStats: this.playerStats
        };
        
        localStorage.setItem('butteredUpsad_gameState', JSON.stringify(gameState));
        console.log('Game state saved!');
    }
    
    /**
     * Load game state from localStorage
     */
    loadGameState() {
        const savedState = localStorage.getItem('butteredUpsad_gameState');
        
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                
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
                
                // Load player stats
                if (gameState.playerStats) {
                    this.playerStats = { ...this.playerStats, ...gameState.playerStats };
                }
                
                console.log('Game state loaded!');
                this.logStats(); // Log the loaded stats
            } catch (error) {
                console.error('Error loading game state:', error);
            }
        }
    }
    
    /**
     * Reset game state
     */
    resetGameState() {
        localStorage.removeItem('butteredUpsad_gameState');
        console.log('Game state reset!');
        
        // Reset player stats
        this.resetStats();
        
        // Reload the page to start fresh
        window.location.reload();
    }
}

// Global game engine instance
let gameEngine = null;
