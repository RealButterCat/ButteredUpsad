/**
 * Dialog Manager
 * Handles NPC dialogs and quest interactions.
 */

class DialogManager {
    constructor() {
        // DOM elements
        this.dialogBox = document.getElementById('dialog-box');
        this.dialogText = document.getElementById('dialog-text');
        this.dialogOptions = document.getElementById('dialog-options');
        
        // State
        this.isActive = false;
        this.currentNPC = null;
        this.currentDialog = null;
        
        // Typing effect state
        this.typingSpeed = 30; // ms per character
        this.typingTimer = null;
        this.fullText = '';
        this.currentCharIndex = 0;
        
        // Bind methods
        this.handleShowDialog = this.handleShowDialog.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.handleOptionClick = this.handleOptionClick.bind(this);
        
        // Set up event listeners
        document.addEventListener('show-dialog', (event) => {
            if (event.detail) {
                this.handleShowDialog(event.detail);
            }
        });
        
        // Close dialog when clicking outside
        document.addEventListener('click', (event) => {
            if (this.isActive && this.dialogBox && !this.dialogBox.contains(event.target)) {
                this.hideDialog();
            }
        });
        
        // Close dialog with ESC key
        document.addEventListener('keydown', (event) => {
            if (this.isActive && event.key === 'Escape') {
                this.hideDialog();
            }
        });
    }
    
    /**
     * Handle showing dialog
     */
    handleShowDialog(data) {
        if (!data || !data.npc) return;
        
        this.currentNPC = data.npc;
        
        // Get the dialog from NPC
        const dialogIndex = data.dialogIndex || 0;
        const dialog = this.currentNPC.getDialog(dialogIndex);
        
        if (dialog) {
            this.showDialog(dialog);
        }
    }
    
    /**
     * Show dialog with specified content
     */
    showDialog(dialog) {
        if (!this.dialogBox || !this.dialogText || !this.dialogOptions) return;
        
        // Store current dialog
        this.currentDialog = dialog;
        
        // Show dialog box
        this.dialogBox.classList.remove('hidden');
        this.isActive = true;
        
        // Start typing effect for text
        this.startTypingEffect(dialog.text);
        
        // Clear options
        this.dialogOptions.innerHTML = '';
        
        // Add response options
        if (dialog.options && dialog.options.length > 0) {
            dialog.options.forEach(option => {
                const optionButton = document.createElement('button');
                optionButton.textContent = option.text;
                optionButton.dataset.responseIndex = option.responseIndex;
                optionButton.addEventListener('click', this.handleOptionClick);
                
                this.dialogOptions.appendChild(optionButton);
            });
        } else {
            // Add a default "Close" option if no options provided
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.dataset.responseIndex = -1;
            closeButton.addEventListener('click', this.handleOptionClick);
            
            this.dialogOptions.appendChild(closeButton);
        }
    }
    
    /**
     * Show a custom dialog not defined in the NPC
     */
    showCustomDialog(npc, dialog) {
        if (!npc || !dialog) return;
        
        this.currentNPC = npc;
        this.showDialog(dialog);
    }
    
    /**
     * Hide the dialog box
     */
    hideDialog() {
        if (!this.dialogBox) return;
        
        // Hide dialog box
        this.dialogBox.classList.add('hidden');
        this.isActive = false;
        
        // Reset state
        this.currentNPC = null;
        this.currentDialog = null;
        
        // Clear typing effect
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
            this.typingTimer = null;
        }
    }
    
    /**
     * Handle dialog option click
     */
    handleOptionClick(event) {
        const button = event.currentTarget;
        const responseIndex = parseInt(button.dataset.responseIndex, 10);
        
        // Close dialog if responseIndex is negative
        if (responseIndex < 0) {
            this.hideDialog();
            return;
        }
        
        // Show next dialog if NPC is available
        if (this.currentNPC) {
            this.currentNPC.setCurrentDialog(responseIndex);
            
            const nextDialog = this.currentNPC.getDialog(responseIndex);
            
            if (nextDialog) {
                this.showDialog(nextDialog);
            } else {
                this.hideDialog();
            }
        }
    }
    
    /**
     * Start typing effect for dialog text
     */
    startTypingEffect(text) {
        if (!this.dialogText) return;
        
        // Reset typing state
        this.fullText = text;
        this.currentCharIndex = 0;
        this.dialogText.textContent = '';
        
        // Clear any existing timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // Start typing
        this.typeNextCharacter();
    }
    
    /**
     * Type the next character in the dialog text
     */
    typeNextCharacter() {
        if (!this.dialogText) return;
        
        // If typing is complete
        if (this.currentCharIndex >= this.fullText.length) {
            return;
        }
        
        // Add next character
        this.dialogText.textContent += this.fullText.charAt(this.currentCharIndex);
        this.currentCharIndex++;
        
        // Schedule next character
        this.typingTimer = setTimeout(() => {
            this.typeNextCharacter();
        }, this.typingSpeed);
    }
    
    /**
     * Skip typing effect and show full text
     */
    completeTyping() {
        if (!this.dialogText) return;
        
        // Clear timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
            this.typingTimer = null;
        }
        
        // Show full text
        this.dialogText.textContent = this.fullText;
        this.currentCharIndex = this.fullText.length;
    }
    
    /**
     * Check if dialog is currently active
     */
    isDialogActive() {
        return this.isActive;
    }
}
