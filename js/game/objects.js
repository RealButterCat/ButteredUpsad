/**
 * Game Objects
 * Defines various game object types and the manager for them.
 */

class GameObject {
    // ... [Previous GameObject code remains unchanged]
}

class WallObject extends GameObject {
    // ... [Previous WallObject code remains unchanged]
}

class TreeObject extends GameObject {
    // ... [Previous TreeObject code remains unchanged]
}

class CollectibleObject extends GameObject {
    // ... [Previous CollectibleObject code remains unchanged]
}

/**
 * NPC object (non-player character for dialog/quests)
 */
class NPCObject extends GameObject {
    constructor(x, y, name) {
        const size = 30;
        super(x, y, size, size, 'npc');
        this.name = name || 'Unknown NPC';
        this.solid = false;
        
        // Quest-related properties
        this.hasQuest = true;
        this.currentQuest = null;
        this.questCompleted = false;
        
        // Available quests for this NPC
        this.availableQuests = [
            {
                id: 'break_blocks',
                title: 'Block Breaker',
                description: 'Break 10 blocks on the website.',
                target: 10,
                progress: 0,
                reward: () => {
                    // Change website theme color
                    document.documentElement.style.setProperty('--theme-color', '#' + Math.floor(Math.random()*16777215).toString(16));
                    return 'Changed the website theme!';
                }
            },
            {
                id: 'collect_coins',
                title: 'Coin Collector',
                description: 'Collect 5 coins from around the website.',
                target: 5,
                progress: 0,
                reward: () => {
                    // Add special visual effect
                    document.body.classList.add('quest-complete-effect');
                    setTimeout(() => document.body.classList.remove('quest-complete-effect'), 3000);
                    return 'Added a special visual effect!';
                }
            }
        ];

        // Dialog system with quest integration
        this.dialogues = [
            { 
                text: `Hello there! I'm ${this.name}. Would you like a quest?`,
                options: [
                    { text: "Yes, give me a quest!", responseIndex: 1 },
                    { text: "No thanks.", responseIndex: -1 }
                ]
            },
            {
                text: "Great! Here's what you can do...",
                options: [
                    { text: "Break 10 blocks", responseIndex: 2 },
                    { text: "Collect 5 coins", responseIndex: 3 }
                ]
            }
        ];

        // Add quest-specific dialogs
        this.questDialogs = {
            'break_blocks': {
                text: "Break 10 blocks anywhere on the website. Come back when you're done!",
                options: [{ text: "I'll do it!", responseIndex: -1 }]
            },
            'collect_coins': {
                text: "Find and collect 5 coins scattered around. Return to me after!",
                options: [{ text: "On it!", responseIndex: -1 }]
            }
        };

        this.currentDialogIndex = 0;

        // Create speech bubble
        this.createSpeechBubble();
    }

    /**
     * Create speech bubble element
     */
    createSpeechBubble() {
        this.speechBubble = document.createElement('div');
        this.speechBubble.className = 'npc-speech-bubble hidden';
        this.speechBubble.textContent = 'Click to talk!';
        
        if (this.element) {
            this.element.appendChild(this.speechBubble);
        }
    }

    /**
     * Update quest progress
     */
    updateQuestProgress(questId, amount = 1) {
        if (!this.currentQuest || this.currentQuest.id !== questId) return;

        this.currentQuest.progress += amount;
        console.log(`Quest progress: ${this.currentQuest.progress}/${this.currentQuest.target}`);

        // Check for quest completion
        if (this.currentQuest.progress >= this.currentQuest.target) {
            this.completeQuest();
        }
    }

    /**
     * Complete current quest
     */
    completeQuest() {
        if (!this.currentQuest) return;

        // Execute reward function
        const rewardMessage = this.currentQuest.reward();
        
        // Update quest state
        this.questCompleted = true;
        
        // Show completion dialog
        const completionDialog = {
            text: `Excellent work! ${rewardMessage}`,
            options: [{ text: "Thanks!", responseIndex: -1 }]
        };

        // Trigger dialog update
        const dialogEvent = new CustomEvent('show-dialog', {
            detail: {
                npc: this,
                dialog: completionDialog
            }
        });
        document.dispatchEvent(dialogEvent);

        // Reset current quest
        this.currentQuest = null;
    }

    /**
     * Accept a new quest
     */
    acceptQuest(questId) {
        const quest = this.availableQuests.find(q => q.id === questId);
        if (quest) {
            this.currentQuest = {...quest, progress: 0};
            console.log(`Accepted quest: ${quest.title}`);
        }
    }

    /**
     * Override base render method
     */
    render(ctx) {
        if (!this.visible) return;

        // Draw NPC as a triangle
        ctx.fillStyle = this.questCompleted ? '#27ae60' : '#3498db';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Draw name above NPC
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width/2, this.y - 5);

        // Draw quest indicator if has active quest
        if (this.currentQuest) {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(this.x + this.width - 5, this.y + 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Override base onClick method
     */
    onClick(event) {
        if (!this.interactive || this.destroyed) return;

        // Show appropriate dialog based on quest state
        let dialog;
        if (this.currentQuest) {
            dialog = {
                text: `Current progress: ${this.currentQuest.progress}/${this.currentQuest.target}`,
                options: [{ text: "I'll keep working on it!", responseIndex: -1 }]
            };
        } else if (this.questCompleted) {
            dialog = {
                text: "Thanks for completing my quest!",
                options: [{ text: "You're welcome!", responseIndex: -1 }]
            };
        } else {
            dialog = this.dialogues[this.currentDialogIndex];
        }

        // Trigger dialog event
        const dialogEvent = new CustomEvent('show-dialog', {
            detail: {
                npc: this,
                dialog: dialog
            }
        });
        document.dispatchEvent(dialogEvent);
    }
}

class GameObjectManager {
    // ... [Previous GameObjectManager code remains unchanged]
}
