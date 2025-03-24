/**
 * Quest Manager
 * Handles quest tracking, progress and rewards.
 */

class QuestManager {
    constructor() {
        this.quests = [];
        this.activeQuests = [];
        this.completedQuests = [];
        this.questPanel = document.getElementById('quests-panel');
        this.questToggle = document.getElementById('quests-toggle');
        this.questList = document.getElementById('quest-list');
        this.isPanelVisible = false;
        
        // Bind methods
        this.toggleQuestsPanel = this.toggleQuestsPanel.bind(this);
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize quest system
     */
    initialize() {
        console.log('Initializing quest manager');
        
        // Set up quest toggle button
        if (this.questToggle) {
            this.questToggle.addEventListener('click', this.toggleQuestsPanel);
        }
        
        // Define available quests
        this.defineQuests();
        
        // Add some starting quests
        this.activateQuest('explore');
    }
    
    /**
     * Define all available quests
     */
    defineQuests() {
        this.quests = [
            {
                id: 'explore',
                title: 'Explore the Website',
                description: 'Move around and discover different parts of the website.',
                type: 'exploration',
                objectives: [
                    {
                        description: 'Visit different sections',
                        type: 'visit',
                        target: 'sections',
                        required: 3,
                        progress: 0,
                        completed: false
                    }
                ],
                reward: {
                    xp: 50,
                    items: [
                        { type: 'coin', value: 5, name: 'Gold Coins' }
                    ]
                },
                active: false,
                completed: false,
                isHidden: false
            },
            {
                id: 'collect-coins',
                title: 'Coin Collector',
                description: 'Collect coins scattered throughout the website.',
                type: 'collection',
                objectives: [
                    {
                        description: 'Collect coins',
                        type: 'collect',
                        target: 'coin',
                        required: 5,
                        progress: 0,
                        completed: false
                    }
                ],
                reward: {
                    xp: 100,
                    items: [
                        { type: 'special', value: 1, name: 'Magic Star' }
                    ]
                },
                active: false,
                completed: false,
                isHidden: false
            },
            {
                id: 'break-objects',
                title: 'Destructive Tendencies',
                description: 'Break various objects in the environment.',
                type: 'destruction',
                objectives: [
                    {
                        description: 'Break objects',
                        type: 'break',
                        target: 'any',
                        required: 10,
                        progress: 0,
                        completed: false
                    }
                ],
                reward: {
                    xp: 75,
                    items: [
                        { type: 'potion', value: 2, name: 'Health Potion' }
                    ]
                },
                active: false,
                completed: false,
                isHidden: false
            },
            {
                id: 'talk-to-npcs',
                title: 'Social Butterfly',
                description: 'Talk to all the NPCs in the world.',
                type: 'interaction',
                objectives: [
                    {
                        description: 'Talk to NPCs',
                        type: 'talk',
                        target: 'npc',
                        required: 3,
                        progress: 0,
                        completed: false
                    }
                ],
                reward: {
                    xp: 120,
                    items: [
                        { type: 'key', value: 1, name: 'Master Key' }
                    ]
                },
                active: false,
                completed: false,
                isHidden: false
            }
        ];
    }
    
    /**
     * Toggle quest panel visibility
     */
    toggleQuestsPanel() {
        if (!this.questPanel) return;
        
        this.isPanelVisible = !this.isPanelVisible;
        
        if (this.isPanelVisible) {
            this.showQuestsPanel();
        } else {
            this.hideQuestsPanel();
        }
    }
    
    /**
     * Show quests panel
     */
    showQuestsPanel() {
        if (!this.questPanel) return;
        
        this.questPanel.classList.remove('hidden');
        this.questPanel.classList.add('visible');
        this.isPanelVisible = true;
        
        // Refresh quests display
        this.refreshQuestsUI();
    }
    
    /**
     * Hide quests panel
     */
    hideQuestsPanel() {
        if (!this.questPanel) return;
        
        this.questPanel.classList.remove('visible');
        this.questPanel.classList.add('hidden');
        this.isPanelVisible = false;
    }
    
    /**
     * Activate a quest by ID
     */
    activateQuest(questId) {
        // Find the quest
        const quest = this.quests.find(q => q.id === questId);
        
        if (!quest) {
            console.error(`Quest with ID ${questId} not found`);
            return false;
        }
        
        // Check if quest is already active or completed
        if (quest.active || quest.completed) {
            console.log(`Quest "${quest.title}" is already active or completed`);
            return false;
        }
        
        // Activate the quest
        quest.active = true;
        this.activeQuests.push(quest);
        
        // Show notification
        if (gameEngine && gameEngine.uiManager) {
            gameEngine.uiManager.showNotification(`New Quest: ${quest.title}`, 'info');
        }
        
        // Update quests UI
        this.refreshQuestsUI();
        this.updateQuestCounter();
        
        console.log(`Activated quest: ${quest.title}`);
        return true;
    }
    
    /**
     * Complete a quest by ID
     */
    completeQuest(questId) {
        // Find the quest
        const quest = this.quests.find(q => q.id === questId);
        
        if (!quest) {
            console.error(`Quest with ID ${questId} not found`);
            return false;
        }
        
        // Check if quest is active and all objectives are completed
        if (!quest.active || !this.areAllObjectivesComplete(quest)) {
            console.log(`Quest "${quest.title}" cannot be completed yet`);
            return false;
        }
        
        // Complete the quest
        quest.active = false;
        quest.completed = true;
        
        // Move from active to completed
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
        this.completedQuests.push(quest);
        
        // Award rewards
        this.awardQuestRewards(quest);
        
        // Show notification
        if (gameEngine && gameEngine.uiManager) {
            gameEngine.uiManager.showNotification(`Quest Completed: ${quest.title}`, 'success');
        }
        
        // Update quests UI
        this.refreshQuestsUI();
        this.updateQuestCounter();
        
        console.log(`Completed quest: ${quest.title}`);
        return true;
    }
    
    /**
     * Check if all objectives for a quest are complete
     */
    areAllObjectivesComplete(quest) {
        return quest.objectives.every(obj => obj.completed);
    }
    
    /**
     * Award quest rewards to the player
     */
    awardQuestRewards(quest) {
        if (!quest.reward) return;
        
        // Award XP
        if (quest.reward.xp && gameEngine && gameEngine.player) {
            gameEngine.player.gainExperience(quest.reward.xp);
        }
        
        // Award items
        if (quest.reward.items && gameEngine && gameEngine.inventoryManager) {
            quest.reward.items.forEach(item => {
                gameEngine.inventoryManager.addItem(item);
            });
        }
    }
    
    /**
     * Update quest progress based on an action
     */
    updateQuestProgress(action, targetType, amount = 1) {
        // Check all active quests
        this.activeQuests.forEach(quest => {
            quest.objectives.forEach(objective => {
                // Skip if objective is already completed
                if (objective.completed) return;
                
                // Check if this action matches the objective
                if (objective.type === action && 
                    (objective.target === targetType || objective.target === 'any')) {
                    
                    // Update progress
                    objective.progress += amount;
                    
                    // Check if objective is now complete
                    if (objective.progress >= objective.required) {
                        objective.completed = true;
                        objective.progress = objective.required; // Cap progress
                        
                        // Show notification
                        if (gameEngine && gameEngine.uiManager) {
                            gameEngine.uiManager.showNotification(`Objective Completed: ${objective.description}`, 'success');
                        }
                        
                        // Check if quest is now complete
                        if (this.areAllObjectivesComplete(quest)) {
                            this.completeQuest(quest.id);
                        }
                    } else {
                        // Show progress update notification
                        if (gameEngine && gameEngine.uiManager) {
                            gameEngine.uiManager.showNotification(
                                `Quest Progress: ${objective.progress}/${objective.required} ${objective.description}`, 
                                'info'
                            );
                        }
                    }
                    
                    // Update UI
                    this.refreshQuestsUI();
                }
            });
        });
    }
    
    /**
     * Update item collection quests when items are picked up
     */
    updateItemCollectionQuests(itemType, amount = 1) {
        this.updateQuestProgress('collect', itemType, amount);
    }
    
    /**
     * Update NPC talk quests when talking to NPCs
     */
    updateNPCTalkQuests(npcType) {
        this.updateQuestProgress('talk', npcType || 'npc', 1);
    }
    
    /**
     * Update break object quests when objects are destroyed
     */
    updateBreakQuests(objectType) {
        this.updateQuestProgress('break', objectType || 'any', 1);
    }
    
    /**
     * Update visit section quests when player enters a new section
     */
    updateVisitQuests(sectionName) {
        this.updateQuestProgress('visit', 'sections', 1);
    }
    
    /**
     * Get active quest by ID
     */
    getActiveQuest(questId) {
        return this.activeQuests.find(q => q.id === questId);
    }
    
    /**
     * Get all active quests
     */
    getAllActiveQuests() {
        return this.activeQuests;
    }
    
    /**
     * Get all completed quests
     */
    getAllCompletedQuests() {
        return this.completedQuests;
    }
    
    /**
     * Get quests by type
     */
    getQuestsByType(type) {
        return this.quests.filter(q => q.type === type);
    }
    
    /**
     * Update counter on the quest toggle button
     */
    updateQuestCounter() {
        if (!this.questToggle) return;
        
        // Set the counter to number of active quests
        this.questToggle.setAttribute('data-count', this.activeQuests.length.toString());
    }
    
    /**
     * Refresh the quests UI
     */
    refreshQuestsUI() {
        if (!this.questList) return;
        
        // Clear the quest list
        this.questList.innerHTML = '';
        
        // Add active quests
        if (this.activeQuests.length > 0) {
            // Sort by progress (most complete first)
            const sortedQuests = [...this.activeQuests].sort((a, b) => {
                const aProgress = this.calculateQuestProgress(a);
                const bProgress = this.calculateQuestProgress(b);
                return bProgress - aProgress;
            });
            
            sortedQuests.forEach(quest => {
                const questElement = this.createQuestElement(quest);
                this.questList.appendChild(questElement);
            });
        } else {
            // Show message if no active quests
            const noQuestsMessage = document.createElement('div');
            noQuestsMessage.className = 'no-quests-message';
            noQuestsMessage.textContent = 'No active quests. Talk to NPCs to get started!';
            this.questList.appendChild(noQuestsMessage);
        }
        
        // Add completed quests (collapsed by default)
        if (this.completedQuests.length > 0) {
            const completedHeader = document.createElement('h4');
            completedHeader.className = 'completed-header';
            completedHeader.textContent = `Completed Quests (${this.completedQuests.length})`;
            this.questList.appendChild(completedHeader);
            
            const completedContainer = document.createElement('div');
            completedContainer.className = 'completed-quests-container collapsed';
            
            this.completedQuests.forEach(quest => {
                const questElement = this.createQuestElement(quest, true);
                completedContainer.appendChild(questElement);
            });
            
            this.questList.appendChild(completedContainer);
            
            // Add toggle functionality to completed header
            completedHeader.addEventListener('click', () => {
                completedContainer.classList.toggle('collapsed');
            });
        }
    }
    
    /**
     * Create a quest element for the UI
     */
    createQuestElement(quest, isCompleted = false) {
        const questElement = document.createElement('div');
        questElement.className = `quest-item${isCompleted ? ' completed' : ''}`;
        questElement.dataset.questId = quest.id;
        
        // Title
        const titleElement = document.createElement('div');
        titleElement.className = 'quest-title';
        titleElement.textContent = quest.title;
        questElement.appendChild(titleElement);
        
        // Description
        const descElement = document.createElement('div');
        descElement.className = 'quest-description';
        descElement.textContent = quest.description;
        questElement.appendChild(descElement);
        
        // Objectives (for active quests)
        if (!isCompleted) {
            quest.objectives.forEach(objective => {
                const objElement = document.createElement('div');
                objElement.className = `quest-objective${objective.completed ? ' completed' : ''}`;
                objElement.textContent = `${objective.description}: ${objective.progress}/${objective.required}`;
                questElement.appendChild(objElement);
            });
            
            // Progress bar
            const progressElement = document.createElement('div');
            progressElement.className = 'quest-progress-bar';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'quest-progress-fill';
            progressFill.style.width = `${this.calculateQuestProgress(quest)}%`;
            
            progressElement.appendChild(progressFill);
            questElement.appendChild(progressElement);
        } else {
            // For completed quests, show rewards
            if (quest.reward) {
                const rewardElement = document.createElement('div');
                rewardElement.className = 'quest-reward';
                
                let rewardText = `Rewards: ${quest.reward.xp} XP`;
                
                if (quest.reward.items && quest.reward.items.length > 0) {
                    rewardText += `, ${quest.reward.items.map(item => item.name).join(', ')}`;
                }
                
                rewardElement.textContent = rewardText;
                questElement.appendChild(rewardElement);
            }
        }
        
        return questElement;
    }
    
    /**
     * Calculate overall progress percentage for a quest
     */
    calculateQuestProgress(quest) {
        if (!quest.objectives || quest.objectives.length === 0) return 0;
        
        let totalRequired = 0;
        let totalProgress = 0;
        
        quest.objectives.forEach(objective => {
            totalRequired += objective.required;
            totalProgress += Math.min(objective.progress, objective.required);
        });
        
        return totalRequired > 0 ? (totalProgress / totalRequired) * 100 : 0;
    }
    
    /**
     * Serialize quests for saving
     */
    serialize() {
        return {
            activeQuests: this.activeQuests.map(q => q.id),
            completedQuests: this.completedQuests.map(q => q.id),
            questProgress: this.quests.map(quest => ({
                id: quest.id,
                active: quest.active,
                completed: quest.completed,
                objectives: quest.objectives.map(obj => ({
                    progress: obj.progress,
                    completed: obj.completed
                }))
            }))
        };
    }
    
    /**
     * Deserialize quests from saved data
     */
    deserialize(data) {
        if (!data) return;
        
        // Reset quests to default state
        this.defineQuests();
        this.activeQuests = [];
        this.completedQuests = [];
        
        // Restore quest progress
        if (data.questProgress && Array.isArray(data.questProgress)) {
            data.questProgress.forEach(savedQuest => {
                const quest = this.quests.find(q => q.id === savedQuest.id);
                
                if (quest) {
                    quest.active = savedQuest.active;
                    quest.completed = savedQuest.completed;
                    
                    // Restore objectives progress
                    if (savedQuest.objectives && Array.isArray(savedQuest.objectives)) {
                        savedQuest.objectives.forEach((savedObj, index) => {
                            if (quest.objectives[index]) {
                                quest.objectives[index].progress = savedObj.progress;
                                quest.objectives[index].completed = savedObj.completed;
                            }
                        });
                    }
                    
                    // Add to appropriate list
                    if (quest.active) {
                        this.activeQuests.push(quest);
                    } else if (quest.completed) {
                        this.completedQuests.push(quest);
                    }
                }
            });
        }
        
        // Update UI
        this.refreshQuestsUI();
        this.updateQuestCounter();
    }
}
