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
        
        // Game systems
        this.player = null;
        this.world = null;
        this.objectManager = null;
        this.interactionManager = null;
        this.inventoryManager = null;
        this.dialogManager = null;
        this.questManager = null;
        
        // Initialize game container
        this.initializeCanvas();
        
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
        this.questManager = new QuestManager(this);
        
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
        this.gameContainer.classList.remove('active');
        this.gameContainer.classList.add('hidden');
        
        // Stop game loop
        this.isRunning = false;
        
        // Clean up
        this.interactionManager.cleanup();
        
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
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update world objects
        if (this.objectManager) {
            this.objectManager.update(deltaTime);
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
            inventory: this.inventoryManager ? this.inventoryManager.serialize() : null
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
                
                console.log('Game state loaded!');
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
        localStorage.removeItem('butteredUpsad_destroyedObjects');
        localStorage.removeItem('butteredUpsad_questState');
        console.log('Game state reset!');
        
        // Reload the page to start fresh
        window.location.reload();
    }
}

// Global game engine instance
let gameEngine = null;
