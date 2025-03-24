/**
 * Main Application
 * Initializes the game and handles main interaction.
 */

// Global game engine instance for easy access from all modules
let gameEngine = null;

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
            startGameButton.classList.remove('active');
        }
    } else {
        // Disable button during startup
        if (startGameButton) {
            startGameButton.disabled = true;
        }
        
        // Start the game
        try {
            gameEngine.start();
            
            // Spawn some initial objects
            if (gameEngine.objectManager) {
                gameEngine.objectManager.spawnRandomObjects(15);
            }
            
            // Update button state
            if (startGameButton) {
                startGameButton.textContent = 'Stop Game';
                startGameButton.classList.add('active');
                startGameButton.disabled = false;
            }
        } catch (err) {
            console.error('Error starting game:', err);
            
            // Re-enable button
            if (startGameButton) {
                startGameButton.disabled = false;
            }
        }
    }
}

// Make toggleGame globally available to fix button references
window.toggleGame = toggleGame;

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
    // Create game engine
    gameEngine = new GameEngine();
    
    // Create UI manager
    const uiManager = new UIManager();
    
    // Add reference to UI manager
    gameEngine.uiManager = uiManager;
    
    // Set up quest manager
    gameEngine.questManager = new QuestManager();
    
    // Set up start game button
    const startGameButton = document.getElementById('start-game');
    
    if (startGameButton) {
        // Add click handler
        startGameButton.addEventListener('click', function(event) {
            // Prevent default behavior
            event.preventDefault();
            
            // Toggle game
            toggleGame();
        });
    }
    
    // Add keyboard shortcut (G) to toggle game
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'g' && event.ctrlKey) {
            toggleGame();
        }
    });
    
    // Handle page section changes for quest tracking
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const sectionId = link.getAttribute('href');
            if (sectionId && sectionId.startsWith('#') && gameEngine && gameEngine.questManager) {
                gameEngine.questManager.updateVisitQuests(sectionId.substring(1));
            }
        });
    });
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
            // First confirm with user
            if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
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
        
        /* Player animations */
        .invulnerable {
            animation: invulnerable-flash 0.5s infinite alternate;
        }
        
        @keyframes invulnerable-flash {
            from { opacity: 1; }
            to { opacity: 0.5; }
        }
        
        .level-up {
            animation: level-up-glow 1s ease-in-out;
        }
        
        @keyframes level-up-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(231, 76, 60, 0.5); }
            50% { box-shadow: 0 0 30px rgba(46, 204, 113, 0.8); }
        }
        
        .damaged {
            animation: damaged-flash 0.2s;
        }
        
        @keyframes damaged-flash {
            0%, 100% { background-color: #e74c3c; }
            50% { background-color: #e67e22; }
        }
        
        .dead {
            animation: dead-spin 1s ease-in-out;
            opacity: 0.5;
        }
        
        @keyframes dead-spin {
            0% { transform: rotate(0) scale(1); }
            100% { transform: rotate(720deg) scale(0); }
        }
        
        /* Object interactions */
        .interacting {
            animation: interacting-pulse 0.3s ease-in-out;
        }
        
        @keyframes interacting-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        /* Start game button in active state */
        #start-game.active {
            background-color: #c0392b;
        }
        
        /* Start game button hover state */
        #start-game:hover {
            background-color: #c0392b;
            cursor: pointer;
        }
        
        /* Game container visibility fix */
        #game-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 5 !important;
            pointer-events: none !important;
        }
        
        #game-container.active {
            pointer-events: all !important;
            background-color: rgba(0, 0, 0, 0.1) !important;
        }
        
        #game-canvas {
            width: 100% !important;
            height: 100% !important;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
};

// Inject game styles immediately
injectGameStyles();
