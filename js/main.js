/**
 * Main Application
 * Initializes the game and handles main interaction.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('ButteredUpsad is loading...');
    
    // Initialize game components when dom is ready
    initGame();
    
    // Add a debug reset button at top left (hidden by default)
    addDebugReset();
    
    // Initialize keyboard controls helper
    window.keyboardControls = new KeyboardControls();
    
    console.log('ButteredUpsad loaded successfully!');
});

/**
 * Initialize the game
 */
function initGame() {
    // Create the game engine instance
    gameEngine = new GameEngine();
    
    // Set up start game button
    const startGameButton = document.getElementById('start-game');
    
    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            toggleGame();
        });
    }
    
    // Add keyboard shortcut (G) to toggle game
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'g' && event.ctrlKey) {
            toggleGame();
        }
        
        // Handle Tab key for inventory (prevent default behavior)
        if (event.key === 'Tab' && gameEngine && gameEngine.isRunning) {
            event.preventDefault();
            
            // Toggle inventory if engine is running
            if (gameEngine.inventoryManager) {
                gameEngine.inventoryManager.toggleInventoryPanel();
            }
        }
        
        // Handle keyboard shortcuts for stats (Ctrl+S)
        if (event.key.toLowerCase() === 's' && event.ctrlKey && gameEngine && gameEngine.isRunning) {
            event.preventDefault();
            const statsEvent = new CustomEvent('toggle-player-stats');
            document.dispatchEvent(statsEvent);
        }
    });
}

/**
 * Toggle game state (start/stop)
 */
function toggleGame() {
    if (!gameEngine) return;
    
    const startGameButton = document.getElementById('start-game');
    
    if (gameEngine.isRunning) {
        // Stop the game
        gameEngine.stop();
        
        if (startGameButton) {
            startGameButton.textContent = 'Start Game';
        }
        
        // Hide keyboard controls helper
        if (window.keyboardControls) {
            window.keyboardControls.hide();
        }
        
        console.log('Game stopped');
    } else {
        // Start the game
        gameEngine.start();
        
        // Spawn some initial objects
        if (gameEngine.objectManager) {
            gameEngine.objectManager.spawnRandomObjects(15);
        }
        
        if (startGameButton) {
            startGameButton.textContent = 'Stop Game';
        }
        
        // Show keyboard controls helper
        if (window.keyboardControls) {
            window.keyboardControls.show();
        }
        
        console.log('Game started');
    }
}

/**
 * Add a debug reset button
 */
function addDebugReset() {
    const resetButton = document.createElement('button');
    resetButton.id = 'debug-reset';
    resetButton.textContent = 'Reset Game';
    resetButton.style.position = 'fixed';
    resetButton.style.left = '10px';
    resetButton.style.top = '10px';
    resetButton.style.zIndex = '9999';
    resetButton.style.backgroundColor = '#e74c3c';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.padding = '5px 10px';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.display = 'none'; // Hidden by default
    
    resetButton.addEventListener('click', () => {
        if (gameEngine) {
            // Add confirmation dialog
            if (confirm('Are you sure you want to reset all game progress? This cannot be undone.')) {
                gameEngine.resetGameState();
            }
        }
    });
    
    document.body.appendChild(resetButton);
    
    // Show reset button with Ctrl+Shift+D
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'd' && event.ctrlKey && event.shiftKey) {
            resetButton.style.display = resetButton.style.display === 'none' ? 'block' : 'none';
        }
    });
}

/**
 * CSS string for game-related styles that need to be added dynamically
 */
const injectGameStyles = () => {
    const styles = `
        /* Game element interactions */
        .game-interactable {
            transition: transform 0.2s, color 0.2s, opacity 0.2s;
            position: relative;
        }
        
        .game-highlight {
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.5);
        }
        
        .game-damaged-1 {
            opacity: 0.8;
            color: #7f8c8d !important;
        }
        
        .game-damaged-2 {
            opacity: 0.5;
            color: #95a5a6 !important;
        }
        
        .game-destroyed {
            opacity: 0.3;
            color: #bdc3c7 !important;
            text-decoration: line-through;
        }
        
        /* Website-wide effects */
        .game-invert {
            filter: invert(1);
            transition: filter 0.5s;
        }
        
        .game-shake {
            animation: website-shake 0.5s ease-in-out;
        }
        
        @keyframes website-shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        /* Special effect for powerful items */
        .special-effect {
            animation: special-pulse 2s ease-in-out;
        }
        
        @keyframes special-pulse {
            0%, 100% { filter: saturate(1); }
            50% { filter: saturate(2) brightness(1.2); }
        }
        
        /* Floating text for collectibles */
        .floating-text {
            position: absolute;
            color: white;
            font-weight: bold;
            pointer-events: none;
            transition: opacity 0.5s, transform 0.5s;
            text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
            z-index: 100;
        }
        
        /* Dragging objects */
        .dragging {
            opacity: 0.7;
            transform: scale(1.1);
            z-index: 100 !important;
        }
        
        /* Game Mode Transition Effects */
        #game-container {
            transition: opacity 0.3s ease-out;
        }
        
        #game-container.hidden {
            opacity: 0;
        }
        
        #game-container.active {
            opacity: 1;
        }
        
        /* Improved hover states for interactable elements */
        .game-interactable:hover {
            cursor: pointer;
        }
        
        .game-mode .game-interactable:hover::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 1px dashed rgba(231, 76, 60, 0.3);
            pointer-events: none;
            z-index: 1;
            animation: border-pulse 1.5s infinite;
        }
        
        @keyframes border-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }
        
        /* Hide focus outlines in game mode */
        .game-mode :focus {
            outline: none !important;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
};

// Inject game styles immediately
injectGameStyles();
