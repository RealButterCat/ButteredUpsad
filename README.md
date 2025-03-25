# ButteredUpsad

An interactive website RPG with maximal player freedom. This project transforms a seemingly normal website into a game environment where players can interact with any element, break objects, solve puzzles, and create their own adventures.

## Features

- Website-integrated gameplay with hidden game layers
- Universal interaction system (click, drag, attack any element)
- Physics and collision detection
- Persistent world state (changes remain after page refresh)
- Player inventory and progression system
- NPCs with random wandering behavior and dialog system
- Website reactions to gameplay events

## Technologies Used

- HTML5/CSS3 for structure and styling
- JavaScript (ES6+) for interactivity
- Canvas API for game rendering
- Local Storage for saving game state

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser
3. Explore the website, then click the "Start Game" button to activate the game layer
4. Use WASD or arrow keys to move
5. Click on objects to interact with them

## Development Roadmap

This project is being developed in phases:
1. Core Setup - Basic structure and movement
2. Interaction Systems - Physics, collision, and universal interaction
3. RPG Mechanics - Inventory, quests, and NPCs
4. Polish & Expansion - Sound, animations, and possible multiplayer

## NPC AI System

The game features NPCs (Non-Player Characters) with the following behaviors:

- **Random Wandering**: NPCs move around the world randomly, changing direction every few seconds
- **Boundary Detection**: NPCs won't wander off-screen and will reverse direction when hitting boundaries
- **Dialog System**: NPCs pause movement during conversations and resume wandering afterward
- **Dialog Options**: NPCs provide dialog trees with multiple response options stored in JSON format
- **Simple AI**: No complex pathfinding, just simple random movement to keep NPCs dynamic without blocking critical paths

## UI/UX Features

The game incorporates several subtle UI/UX features to enhance the experience:

- **Normal Website Appearance**: The game maintains the look and feel of a normal website until game mode is activated
- **Hidden Mechanics**: Game mechanics remain hidden until explicitly triggered with Ctrl+G or the "Start Game" button
- **Subtle Animations**: Hover effects and transitions provide visual feedback without being intrusive
- **Persistent Preferences**: User settings and game state are saved using localStorage
- **Auto-Save System**: Game progress is automatically saved at regular intervals
- **Game Mode Indicator**: A subtle indicator shows when game mode is active
- **Keyboard Controls Helper**: An unobtrusive controls reference is available in game mode
- **Contextual Tooltips**: Helpful tooltips appear at appropriate moments to guide new players
- **Non-Intrusive UI**: Game UI elements are minimal and fade away when not in use
- **Responsive Transitions**: Smooth transitions between game and normal website modes

## License

MIT
