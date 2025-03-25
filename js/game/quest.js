/**
 * Quest System
 * Handles player quests, objectives, and rewards.
 */

class QuestManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.quests = {};
        this.activeQuests = [];
        this.completedQuests = [];
        
        // Load saved quest state
        this.loadQuestState();
        
        // Set up quest types
        this.setupQuests();
        
        // Event listeners
        document.addEventListener('object-broken', this.handleObjectBroken.bind(this));
        document.addEventListener('item-collected', this.handleItemCollected.bind(this));
    }
    
    /**
     * Set up available quest types
     */
    setupQuests() {
        // Quest: Break objects
        this.quests.breakObjects = {
            id: 'break_objects',
            title: 'Destructive Tendencies',
            description: 'Break {{target}} objects of any type.',
            startDialog: 'I need someone with destructive tendencies. Can you break {{target}} objects for me?',
            progressDialog: 'You\'ve broken {{current}} out of {{target}} objects. Keep going!',
            completeDialog: 'Impressive destruction! Here\'s your reward.',
            type: 'break',
            target: 10,
            current: 0,
            reward: function(gameEngine) {
                // Change website theme color
                document.body.style.backgroundColor = '#2c3e50';
                document.querySelector('header').style.backgroundColor = '#e74c3c';
                
                // Create a notification
                const notification = document.createElement('div');
                notification.className = 'quest-notification';
                notification.textContent = 'Quest Complete! Website theme changed.';
                document.body.appendChild(notification);
                
                // Remove after 3 seconds
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 500);
                }, 3000);
            }
        };
        
        // Quest: Collect coins
        this.quests.collectCoins = {
            id: 'collect_coins',
            title: 'Treasure Hunter',
            description: 'Collect {{target}} coins around the world.',
            startDialog: 'There are valuable coins scattered around. Can you find {{target}} of them for me?',
            progressDialog: 'You\'ve found {{current}} out of {{target}} coins. Keep searching!',
            completeDialog: 'Well done, treasure hunter! Your reward is ready.',
            type: 'collect',
            itemType: 'coin',
            target: 5,
            current: 0,
            reward: function(gameEngine) {
                // Add special collectible
                const playerX = gameEngine.player.x;
                const playerY = gameEngine.player.y;
                
                const specialItem = new CollectibleObject(
                    playerX + 50, 
                    playerY, 
                    'special'
                );
                specialItem.value = 10;
                gameEngine.objectManager.addObject(specialItem);
                
                // Flash screen gold
                document.body.classList.add('flash-gold');
                setTimeout(() => {
                    document.body.classList.remove('flash-gold');
                }, 1000);
            }
        };
        
        // Quest: Move blocks
        this.quests.moveBlocks = {
            id: 'move_blocks',
            title: 'Rearrangement',
            description: 'Move {{target}} blocks to new positions.',
            startDialog: 'I\'m not happy with the arrangement of blocks around here. Could you move {{target}} of them?',
            progressDialog: 'You\'ve moved {{current}} out of {{target}} blocks. Keep rearranging!',
            completeDialog: 'Perfect! The space looks much better now.',
            type: 'move',
            target: 3,
            current: 0,
            reward: function(gameEngine) {
                // Change nav colors
                const navLinks = document.querySelectorAll('.nav-links a');
                navLinks.forEach(link => {
                    link.style.color = '#f1c40f';
                });
                
                // Add animation to the logo
                const logo = document.querySelector('.logo');
                if (logo) {
                    logo.classList.add('rainbow-text');
                }
            }
        };
    }
    
    /**
     * Start a quest for a player
     */
    startQuest(questId, npc) {
        // Check if quest exists
        if (!this.quests[questId]) {
            console.error(`Quest ${questId} not found`);
            return false;
        }
        
        // Copy quest object to avoid modifying the template
        const quest = JSON.parse(JSON.stringify(this.quests[questId]));
        quest.npc = npc; // Reference to the NPC who gave the quest
        quest.timeStarted = Date.now();
        quest.current = 0;
        
        // Add to active quests
        this.activeQuests.push(quest);
        
        // Save quest state
        this.saveQuestState();
        
        console.log(`Started quest: ${quest.title}`);
        
        // Display quest started notification
        this.showQuestNotification(`New Quest: ${quest.title}`);
        
        return true;
    }
    
    /**
     * Update quest progress
     */
    updateQuestProgress(questType, data) {
        let updated = false;
        
        this.activeQuests.forEach(quest => {
            if (quest.type === questType) {
                // Check for specific quest conditions
                if (questType === 'collect' && data.itemType !== quest.itemType) {
                    return; // Skip if item type doesn't match quest requirements
                }
                
                // Update progress
                quest.current++;
                updated = true;
                
                console.log(`Updated quest progress: ${quest.title} - ${quest.current}/${quest.target}`);
                
                // Check if quest is completed
                if (quest.current >= quest.target) {
                    this.completeQuest(quest);
                }
            }
        });
        
        if (updated) {
            this.saveQuestState();
        }
    }
    
    /**
     * Complete a quest
     */
    completeQuest(quest) {
        // Move from active to completed
        const index = this.activeQuests.findIndex(q => q.id === quest.id);
        if (index !== -1) {
            const completedQuest = this.activeQuests.splice(index, 1)[0];
            completedQuest.timeCompleted = Date.now();
            this.completedQuests.push(completedQuest);
            
            console.log(`Completed quest: ${completedQuest.title}`);
            
            // Execute reward function
            if (typeof completedQuest.reward === 'function') {
                completedQuest.reward(this.gameEngine);
            }
            
            // Show completion notification
            this.showQuestNotification(`Quest Completed: ${completedQuest.title}`);
            
            // Save quest state
            this.saveQuestState();
            
            // Update NPC dialog if they're the quest giver
            if (completedQuest.npc && typeof completedQuest.npc.updateDialogAfterQuest === 'function') {
                completedQuest.npc.updateDialogAfterQuest(completedQuest.id);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if player has an active quest
     */
    hasActiveQuest(questId) {
        return this.activeQuests.some(quest => quest.id === questId);
    }
    
    /**
     * Check if player has completed a quest
     */
    hasCompletedQuest(questId) {
        return this.completedQuests.some(quest => quest.id === questId);
    }
    
    /**
     * Get quest by ID (either active or completed)
     */
    getQuest(questId) {
        const active = this.activeQuests.find(quest => quest.id === questId);
        if (active) return active;
        
        const completed = this.completedQuests.find(quest => quest.id === questId);
        if (completed) return completed;
        
        return null;
    }
    
    /**
     * Handle an object being broken (for break quests)
     */
    handleObjectBroken(event) {
        if (!event.detail) return;
        
        this.updateQuestProgress('break', event.detail);
    }
    
    /**
     * Handle an item being collected (for collection quests)
     */
    handleItemCollected(event) {
        if (!event.detail) return;
        
        this.updateQuestProgress('collect', event.detail);
    }
    
    /**
     * Handle an object being moved (for movement quests)
     */
    handleObjectMoved(event) {
        if (!event.detail) return;
        
        this.updateQuestProgress('move', event.detail);
    }
    
    /**
     * Show quest notification
     */
    showQuestNotification(text) {
        const notification = document.createElement('div');
        notification.className = 'quest-notification';
        notification.textContent = text;
        document.body.appendChild(notification);
        
        // Animate and remove
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    /**
     * Save quest state to localStorage
     */
    saveQuestState() {
        const questState = {
            activeQuests: this.activeQuests.map(quest => {
                // Don't save reward function or NPC reference
                const { reward, npc, ...questData } = quest;
                return questData;
            }),
            completedQuests: this.completedQuests.map(quest => {
                // Don't save reward function or NPC reference
                const { reward, npc, ...questData } = quest;
                return questData;
            })
        };
        
        localStorage.setItem('butteredUpsad_questState', JSON.stringify(questState));
    }
    
    /**
     * Load quest state from localStorage
     */
    loadQuestState() {
        const savedState = localStorage.getItem('butteredUpsad_questState');
        
        if (savedState) {
            try {
                const questState = JSON.parse(savedState);
                
                // Restore active quests (without reward functions)
                this.activeQuests = questState.activeQuests || [];
                
                // Restore completed quests (without reward functions)
                this.completedQuests = questState.completedQuests || [];
                
                console.log(`Loaded quest state: ${this.activeQuests.length} active, ${this.completedQuests.length} completed`);
            } catch (error) {
                console.error('Error loading quest state:', error);
            }
        }
    }
}
