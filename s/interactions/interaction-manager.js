/**
 * Interaction Manager
 *
 * Manages interactions between entities.
 * Handles dialog display and interaction feedback.
 */
const InteractionManager = (function() {
    // UI elements
    let _dialogElement = null;
    let _dialogVisible = false;
    let _dialogTimeout = null;

    /**
     * Initialize the interaction manager
     */
    function init() {
        // Create dialog element
        _createDialogElement();

        // Subscribe to events
        Events.subscribe(Events.EVENTS.DIALOG_OPEN, _handleDialogOpen);
        Events.subscribe(Events.EVENTS.DIALOG_CLOSE, _handleDialogClose);

        console.log('Interaction Manager initialized');
    }

    /**
     * Create dialog UI element
     *
     * @private
     */
    function _createDialogElement() {
        _dialogElement = document.createElement('div');
        _dialogElement.className = 'dialog';
        _dialogElement.style.display = 'none';

        // Add to UI container
        const uiContainer = document.getElementById('game-ui');
        if (uiContainer) {
            uiContainer.appendChild(_dialogElement);
        } else {
            document.body.appendChild(_dialogElement);
        }

        // Add click event to close dialog
        _dialogElement.addEventListener('click', () => {
            closeDialog();
        });

        // Add press E event to close dialog
        Events.subscribe(Events.EVENTS.KEY_DOWN, (data) => {
            if (data.action === InputManager.ACTIONS.INTERACT && _dialogVisible) {
                closeDialog();
            }
        });
    }

    /**
     * Handle dialog open event
     *
     * @param {Object} data - Dialog data
     * @private
     */
    function _handleDialogOpen(data) {
        showDialog(data.text, data.entity, data.actor);
    }

    /**
     * Handle dialog close event
     *
     * @private
     */
    function _handleDialogClose() {
        closeDialog();
    }

    /**
     * Show a dialog
     *
     * @param {string} text - Dialog text
     * @param {Object} entity - Entity that triggered the dialog
     * @param {Object} actor - Entity that interacted with the trigger
     */
    function showDialog(text, entity, actor) {
        // Clear any existing timeout
        if (_dialogTimeout) {
            clearTimeout(_dialogTimeout);
            _dialogTimeout = null;
        }

        // Set dialog text
        _dialogElement.innerHTML = `<p>${text}</p><small>Press E or click to close</small>`;

        // Show dialog
        _dialogElement.style.display = 'block';
        _dialogVisible = true;

        // Auto-close after a timeout if text is short
        if (text.length < 100) {
            _dialogTimeout = setTimeout(() => {
                closeDialog();
            }, 5000);
        }
    }

    /**
     * Close the dialog
     */
    function closeDialog() {
        // Hide dialog
        _dialogElement.style.display = 'none';
        _dialogVisible = false;

        // Clear any existing timeout
        if (_dialogTimeout) {
            clearTimeout(_dialogTimeout);
            _dialogTimeout = null;
        }

        // Publish dialog close event
        Events.publish(Events.EVENTS.DIALOG_CLOSE);
    }

    /**
     * Check if dialog is visible
     *
     * @returns {boolean} True if dialog is visible
     */
    function isDialogVisible() {
        return _dialogVisible;
    }

    /**
     * Register an interaction type
     *
     * @param {string} type - Interaction type
     * @param {Function} handler - Interaction handler function
     */
    function registerInteractionType(type, handler) {
        Events.subscribe(`interaction:${type}`, handler);
    }

    // Public API
    return {
        init,
        showDialog,
        closeDialog,
        isDialogVisible,
        registerInteractionType
    };
})();