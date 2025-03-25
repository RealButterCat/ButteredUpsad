/**
 * Quest System
 * Handles quest tracking and completion.
 */

class Quest {
    constructor(id, title, description, type, target, reward) {
        this.id = id || Math.random().toString(36).substring(2, 9);
        this.title = title;
        this.description = description;
        this.type = type; // 'break', 'collect', 'talk', etc.
        this.target = target; // target amount or specific object
        this.reward = reward;
        this.progress = 0;
        this.completed = false;
        this.accepted = false;
    }
    
    /**
     * Update progress on the quest
     */
    updateProgress(amount = 1) {
        if (this.completed || !this.accepted) return false;
        
        this.progress += amount;
        
        // Check for completion
        if (this.progress >= this.target) {
            this.complete();
            return true;
        }
        
        // Quest is still in progress
        return false;
    }
    
    /**
     * Mark the quest as completed
     */
    complete() {
        if (this.completed) return;
        
        this.completed = true;
        this.progress = this.target; // Ensure progress matches target
        
        // Dispatch completion event
        const questCompleteEvent = new CustomEvent('quest-complete', {
            detail: {
                questId: this.id,
                reward: this.reward
            }
        });
        
        document.dispatchEvent(questCompleteEvent);
        console.log(`Quest completed: ${this.title}`);
        
        // Apply quest completion effects
        this.applyCompletionEffects();
    }
    
    /**
     * Apply effects when quest is completed
     */
    applyCompletionEffects() {
        if (!this.reward) return;
        
        // Handle different reward types
        switch (this.reward.type) {
            case 'theme':
                // Change theme color
                document.documentElement.style.setProperty('--theme-color', this.reward.value);
                document.body.style.transition = 'background-color 1s ease';
                document.body.style.backgroundColor = this.getLighterShade(this.reward.value, 0.9);
                break;
                
            case 'header':
                // Change header color
                const header = document.querySelector('header');
                if (header) {
                    header.style.transition = 'background-color 1s ease';
                    header.style.backgroundColor = this.reward.value;
                }
                break;
                
            case 'glow':
                // Add glow effect to player
                const player = document.getElementById('player');
                if (player) {
                    player.style.boxShadow = `0 0 20px ${this.reward.value}`;
                    player.style.transition = 'box-shadow 1s ease';
                }
                break;
                
            case 'item':
                // Give item to player
                if (gameEngine && gameEngine.inventoryManager) {
                    gameEngine.inventoryManager.addItem({
                        type: this.reward.value,
                        value: this.reward.amount || 1
                    });
                }
                break;
                
            default:
                console.log(`Unknown reward type: ${this.reward.type}`);
        }
    }
    
    /**
     * Accept the quest
     */
    accept() {
        this.accepted = true;
        
        // Dispatch quest accepted event
        const questAcceptedEvent = new CustomEvent('quest-accepted', {
            detail: {
                questId: this.id
            }
        });
        
        document.dispatchEvent(questAcceptedEvent);
        console.log(`Quest accepted: ${this.title}`);
    }
    
    /**
     * Decline the quest
     */
    decline() {
        // Quests are optional, so we just log this
        console.log(`Quest declined: ${this.title}`);
    }
    
    /**
     * Calculate a lighter shade of a color for backgrounds
     */
    getLighterShade(hexColor, factor = 0.7) {
        // Remove # if present
        hexColor = hexColor.replace('#', '');
        
        // Parse the color components
        let r = parseInt(hexColor.substr(0, 2), 16);
        let g = parseInt(hexColor.substr(2, 2), 16);
        let b = parseInt(hexColor.substr(4, 2), 16);
        
        // Make it lighter
        r = Math.floor(r + (255 - r) * factor);
        g = Math.floor(g + (255 - g) * factor);
        b = Math.floor(b + (255 - b) * factor);
        
        // Convert back to hex
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Get a formatted string of the quest progress
     */
    getProgressText() {
        return `${this.progress}/${this.target}`;
    }
    
    /**
     * Get a percentage of completion
     */
    getProgressPercentage() {
        return Math.min(100, Math.floor((this.progress / this.target) * 100));
    }
    
    /**
     * Serialize quest data for saving
     */
    serialize() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            type: this.type,
            target: this.target,
            reward: this.reward,
            progress: this.progress,
            completed: this.completed,
            accepted: this.accepted
        };
    }
    
    /**
     * Deserialize quest data from saved state
     */
    deserialize(data) {
        Object.assign(this, data);
    }
}

/**
 * Quest Manager
 * Handles all active quests and their progress
 */
class QuestManager {
    constructor() {
        this.quests = {};
        this.activeQuestIds = [];
        
        // Bind methods
        this.handleQuestAccepted = this.handleQuestAccepted.bind(this);
        this.handleQuestCompleted = this.handleQuestCompleted.bind(this);
        this.handleBlockBreak = this.handleBlockBreak.bind(this);
        this.handleItemCollect = this.handleItemCollect.bind(this);
        
        // Set up event listeners
        document.addEventListener('quest-accepted', this.handleQuestAccepted);
        document.addEventListener('quest-complete', this.handleQuestCompleted);
        document.addEventListener('block-broken', this.handleBlockBreak);
        document.addEventListener('collect-item', this.handleItemCollect);
    }
    
    /**
     * Add a new quest
     */
    addQuest(quest) {
        if (!quest.id) {
            quest.id = Math.random().toString(36).substring(2, 9);
        }
        
        this.quests[quest.id] = quest;
        return quest.id;
    }
    
    /**
     * Get a quest by ID
     */
    getQuest(questId) {
        return this.quests[questId];
    }
    
    /**
     * Handle quest acceptance
     */
    handleQuestAccepted(event) {
        const questId = event.detail.questId;
        if (questId && this.quests[questId]) {
            this.activeQuestIds.push(questId);
        }
    }
    
    /**
     * Handle quest completion
     */
    handleQuestCompleted(event) {
        const questId = event.detail.questId;
        
        // Remove from active quests
        this.activeQuestIds = this.activeQuestIds.filter(id => id !== questId);
        
        // Handle rewards if needed
        const reward = event.detail.reward;
        if (reward) {
            console.log(`Quest reward: ${reward.type} - ${reward.value}`);
        }
    }
    
    /**
     * Handle block breaking event for quests
     */
    handleBlockBreak(event) {
        // Update progress for block-breaking quests
        this.activeQuestIds.forEach(questId => {
            const quest = this.quests[questId];
            if (quest && quest.type === 'break' && !quest.completed) {
                quest.updateProgress(1);
            }
        });
    }
    
    /**
     * Handle item collection event for quests
     */
    handleItemCollect(event) {
        if (!event.detail) return;
        
        const itemType = event.detail.type;
        
        // Update progress for collection quests
        this.activeQuestIds.forEach(questId => {
            const quest = this.quests[questId];
            if (quest && quest.type === 'collect' && quest.target === itemType && !quest.completed) {
                quest.updateProgress(1);
            }
        });
    }
    
    /**
     * Create a predefined quest
     */
    createPredefinedQuest(type) {
        let quest;
        
        switch (type) {
            case 'break-blocks':
                quest = new Quest(
                    null,
                    "Block Breaker",
                    "Break 10 blocks to change the website's theme color.",
                    'break',
                    10,
                    { type: 'theme', value: '#8e44ad' }
                );
                break;
                
            case 'collect-coins':
                quest = new Quest(
                    null,
                    "Coin Collector",
                    "Collect 5 coins to change the header color.",
                    'collect',
                    5,
                    { type: 'header', value: '#2ecc71' }
                );
                break;
                
            case 'player-steps':
                quest = new Quest(
                    null,
                    "Explorer",
                    "Take 100 steps to receive a special glow effect.",
                    'steps',
                    100,
                    { type: 'glow', value: '#f39c12' }
                );
                break;
                
            default:
                quest = new Quest(
                    null,
                    "Mystery Quest",
                    "Complete this quest for a special reward.",
                    'misc',
                    1,
                    { type: 'item', value: 'special', amount: 1 }
                );
        }
        
        // Add the quest to the manager
        this.addQuest(quest);
        return quest;
    }
    
    /**
     * Serialize all quests for saving
     */
    serialize() {
        const questData = {};
        Object.keys(this.quests).forEach(questId => {
            questData[questId] = this.quests[questId].serialize();
        });
        
        return {
            quests: questData,
            activeQuestIds: this.activeQuestIds
        };
    }
    
    /**
     * Deserialize quests from saved state
     */
    deserialize(data) {
        if (!data) return;
        
        // Clear existing quests
        this.quests = {};
        this.activeQuestIds = [];
        
        // Restore quests
        if (data.quests) {
            Object.keys(data.quests).forEach(questId => {
                const quest = new Quest();
                quest.deserialize(data.quests[questId]);
                this.quests[questId] = quest;
            });
        }
        
        // Restore active quest IDs
        if (data.activeQuestIds) {
            this.activeQuestIds = data.activeQuestIds;
        }
    }
}
