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
        
        // Show the keyboard controls info
        showKeyboardControlsInfo();
        
        console.log('Game started');
    }
}

/**
 * Show a temporary message with keyboard controls
 */
function showKeyboardControlsInfo() {
    // Create a tooltip for controls
    const tooltip = document.createElement('div');
    tooltip.className = 'controls-tooltip';
    tooltip.innerHTML = `
        <h4>Keyboard Controls</h4>
        <ul>
            <li><kbd>Tab</kbd> - Toggle inventory</li>
            <li><kbd>Ctrl</kbd>+<kbd>S</kbd> - View stats</li>
            <li><kbd>WASD</kbd> or <kbd>↑↓←→</kbd> - Move</li>
            <li><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> - Debug reset</li>
        </ul>
    `;
    
    document.body.appendChild(tooltip);
    
    // Fade in
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 100);
    
    // Fade out and remove after 5 seconds
    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 500);
    }, 5000);
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
            gameEngine.resetGameState();
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
        
        /* Controls tooltip */
        .controls-tooltip {
            position: fixed;
            top: 80px;
            right: 20px;
            background-color: rgba(44, 62, 80, 0.9);
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.5s;
            max-width: 250px;
        }
        
        .controls-tooltip h4 {
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 5px;
        }
        
        .controls-tooltip ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .controls-tooltip li {
            margin-bottom: 8px;
            font-size: 13px;
        }
        
        .controls-tooltip kbd {
            display: inline-block;
            padding: 2px 4px;
            font-family: monospace;
            font-size: 12px;
            color: #f9f9f9;
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
            margin: 0 2px;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
};

// Inject game styles immediately
injectGameStyles();
