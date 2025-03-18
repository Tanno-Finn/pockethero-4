/**
 * Game Controller
 *
 * Central controller that initializes and manages the game.
 * Coordinates between different systems and handles the game lifecycle.
 */
const Game = (function() {
    // Default configuration
    const DEFAULT_CONFIG = {
        canvasId: 'game-canvas',
        width: 800,
        height: 600,
        gridCellSize: 32,
        debug: false,
        startZone: 'zone_1',
        dataPath: 'data/'
    };

    // Game states
    const GAME_STATES = {
        LOADING: 'loading',
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver'
    };

    // Private properties
    let _config = { ...DEFAULT_CONFIG };
    let _initialized = false;
    let _debugElement = null;
    let _loadingPromise = null;
    let _player = null;
    let _tileTypes = {};
    let _entityTypes = {};

    /**
     * Initialize the game
     *
     * @param {Object} config - Configuration object
     */
    function init(config = {}) {
        // Merge config with defaults
        _config = { ...DEFAULT_CONFIG, ...config };

        // Initialize state manager
        StateManager.init({
            gameState: GAME_STATES.LOADING,
            debug: _config.debug,
            canvas: {
                width: _config.width,
                height: _config.height
            },
            grid: {
                cellSize: _config.gridCellSize
            },
            player: {
                position: { x: 0, y: 0 }
            },
            stats: {
                fps: 0,
                entityCount: 0
            }
        });

        // Initialize systems
        Renderer.init(_config.canvasId, _config.width, _config.height);
        InputManager.init();
        Grid.init({ cellSize: _config.gridCellSize });
        Camera.init({
            width: _config.width,
            height: _config.height
        });
        EntityManager.init();
        Validator.init();
        DataLoader.init({ basePath: _config.dataPath });
        InteractionManager.init();

        // Setup debug display if enabled
        if (_config.debug) {
            _setupDebugDisplay();
        }

        // Load game data
        _loadingPromise = _loadGameData();

        // Mark as initialized
        _initialized = true;

        // Publish initialization event
        Events.publish(Events.EVENTS.GAME_INIT, { config: _config });

        console.log('Game initialized with config:', _config);
    }

    /**
     * Start the game
     */
    async function start() {
        if (!_initialized) {
            console.error('Game not initialized. Call Game.init() first.');
            return;
        }

        // Wait for data to load if still loading
        if (_loadingPromise) {
            try {
                await _loadingPromise;
            } catch (error) {
                console.error('Failed to load game data:', error);
                return;
            }
        }

        // Create game world
        _createGameWorld();

        // Set up camera to follow player
        if (_player) {
            Camera.setTarget(_player);

            // Set camera bounds based on current zone dimensions
            const worldDims = Grid.getWorldDimensions();
            Camera.setBounds({
                minX: 0,
                minY: 0,
                maxX: worldDims.width,
                maxY: worldDims.height
            });
        }

        // Set game state to playing
        StateManager.set('gameState', GAME_STATES.PLAYING);

        // Start the game loop
        GameLoop.start(_update, _render);

        // Publish start event
        Events.publish(Events.EVENTS.GAME_START);

        console.log('Game started');
    }

    /**
     * Load game data
     *
     * @returns {Promise} Promise that resolves when data is loaded
     * @private
     */
    async function _loadGameData() {
        console.log('Loading game data...');

        try {
            // Load tile types
            const tileData = await DataLoader.loadJSON('tiles/basic-tiles.json');
            _tileTypes = {};

            for (const tile of tileData.tiles) {
                _tileTypes[tile.id] = tile;
            }

            console.log('Loaded tile types:', Object.keys(_tileTypes).length);

            // Load entity types
            const entityData = await DataLoader.loadJSON('entities/basic-entities.json');
            _entityTypes = {};

            for (const entity of entityData.entities) {
                _entityTypes[entity.id] = entity;

                // Register as entity template
                EntityManager.registerTemplate(entity.id, entity);
            }

            console.log('Loaded entity types:', Object.keys(_entityTypes).length);

            // Load zones
            const zone1Data = await DataLoader.loadJSON('zones/zone1.json');
            const zone2Data = await DataLoader.loadJSON('zones/zone2.json');

            console.log('Loaded zones:', [zone1Data.id, zone2Data.id]);

            // Store loaded data in state
            StateManager.set('data', {
                tiles: _tileTypes,
                entities: _entityTypes,
                zones: {
                    [zone1Data.id]: zone1Data,
                    [zone2Data.id]: zone2Data
                }
            });

            console.log('Game data loading complete');
        } catch (error) {
            console.error('Error loading game data:', error);
            throw error;
        }
    }

    /**
     * Create the game world
     *
     * @private
     */
    function _createGameWorld() {
        // Get game data from state
        const data = StateManager.get('data');

        if (!data) {
            console.error('No game data available');
            return;
        }

        // Get starting zone
        const startZone = data.zones[_config.startZone];

        if (!startZone) {
            console.error(`Starting zone '${_config.startZone}' not found`);
            return;
        }

        // Create the zones
        for (const zoneId in data.zones) {
            const zoneData = data.zones[zoneId];
            _createZone(zoneData);
        }

        // Set current zone
        Grid.setCurrentZone(_config.startZone);

        console.log('Game world created');
    }

    /**
     * Create a zone
     *
     * @param {Object} zoneData - Zone data
     * @private
     */
    function _createZone(zoneData) {
        // Create the zone
        const zone = Grid.createZone(zoneData.id, {
            width: zoneData.width,
            height: zoneData.height
        });

        // Create tile entities
        for (let y = 0; y < zoneData.height; y++) {
            for (let x = 0; x < zoneData.width; x++) {
                const tileId = zoneData.tiles[y][x];
                const tileType = _tileTypes[tileId];

                if (!tileType) {
                    console.error(`Tile type '${tileId}' not found`);
                    continue;
                }

                // Create tile entity
                const tile = EntityManager.createEntity('tile', {
                    gridX: x,
                    gridY: y,
                    layer: Grid.LAYERS.GROUND,
                    zoneId: zoneData.id,
                    tags: tileType.tags || []
                });

                // Add tile component
                tile.addComponent('tile', {
                    type: tileId,
                    color: tileType.color,
                    shape: tileType.shape,
                    walkable: tileType.tags ? tileType.tags.includes('walkable') : true,
                    propertyTags: tileType.tags || []
                });

                // Register tile on grid
                Grid.registerEntity(tile, x, y, Grid.LAYERS.GROUND, zoneData.id);
            }
        }

        // Create entities
        for (const entityData of zoneData.entities) {
            const entityType = _entityTypes[entityData.type];

            if (!entityType) {
                console.error(`Entity type '${entityData.type}' not found`);
                continue;
            }

            // Create entity from template
            const entity = EntityManager.createEntityFromTemplate(entityData.type, {
                gridX: entityData.x,
                gridY: entityData.y,
                layer: Grid.LAYERS.ACTOR,
                zoneId: zoneData.id,
                properties: entityData.properties || {}
            });

            // Register entity on grid
            Grid.registerEntity(
                entity,
                entityData.x,
                entityData.y,
                entity.layer,
                zoneData.id
            );

            // Store player entity reference
            if (entityData.type === 'player') {
                _player = entity;
            }
        }

        console.log(`Created zone '${zoneData.id}' with ${zoneData.width}x${zoneData.height} tiles`);
    }

    /**
     * Update function called by the game loop
     *
     * @param {number} deltaTime - Time since last update in seconds
     * @private
     */
    function _update(deltaTime) {
        // Skip updates if not playing
        if (StateManager.get('gameState') !== GAME_STATES.PLAYING) {
            return;
        }

        // Update FPS counter
        const fps = Math.round(1 / deltaTime);
        StateManager.set('stats.fps', fps);

        // Update camera
        Camera.update(deltaTime);

        // Update entities
        EntityManager.updateAll(deltaTime);

        // Update entity count
        StateManager.set('stats.entityCount', Object.keys(EntityManager.getAllEntities()).length);

        // Update debug display if enabled
        if (_config.debug) {
            _updateDebugDisplay();
        }
    }

    /**
     * Render function called by the game loop
     *
     * @param {number} deltaTime - Time since last render in seconds
     * @private
     */
    function _render(deltaTime) {
        // Always render, even when paused
        Renderer.clear();

        // Apply camera transformations
        Camera.apply();

        // Render entities
        EntityManager.renderAll();

        // Revert camera transformations
        Camera.revert();

        // Render UI elements
        _renderUI();
    }

    /**
     * Render UI elements
     *
     * @private
     */
    function _renderUI() {
        // Render pause screen if paused
        if (StateManager.get('gameState') === GAME_STATES.PAUSED) {
            Renderer.drawText('PAUSED', _config.width / 2, _config.height / 2, {
                font: 'bold 32px Arial',
                color: 'white',
                textAlign: 'center',
                textBaseline: 'middle'
            });
        }

        // Render game over screen if game over
        if (StateManager.get('gameState') === GAME_STATES.GAME_OVER) {
            Renderer.drawText('GAME OVER', _config.width / 2, _config.height / 2, {
                font: 'bold 32px Arial',
                color: 'white',
                textAlign: 'center',
                textBaseline: 'middle'
            });
        }

        // Render loading screen if loading
        if (StateManager.get('gameState') === GAME_STATES.LOADING) {
            Renderer.drawText('LOADING...', _config.width / 2, _config.height / 2, {
                font: 'bold 32px Arial',
                color: 'white',
                textAlign: 'center',
                textBaseline: 'middle'
            });
        }
    }

    /**
     * Pause the game
     */
    function pause() {
        if (StateManager.get('gameState') === GAME_STATES.PLAYING) {
            StateManager.set('gameState', GAME_STATES.PAUSED);
            GameLoop.pause();

            // Publish pause event
            Events.publish(Events.EVENTS.GAME_PAUSE);

            console.log('Game paused');
        }
    }

    /**
     * Resume the game
     */
    function resume() {
        if (StateManager.get('gameState') === GAME_STATES.PAUSED) {
            StateManager.set('gameState', GAME_STATES.PLAYING);
            GameLoop.resume();

            // Publish resume event
            Events.publish(Events.EVENTS.GAME_RESUME);

            console.log('Game resumed');
        }
    }

    /**
     * End the game
     */
    function gameOver() {
        StateManager.set('gameState', GAME_STATES.GAME_OVER);

        // Publish game over event
        Events.publish(Events.EVENTS.GAME_OVER);

        console.log('Game over');
    }

    /**
     * Setup debug display
     *
     * @private
     */
    function _setupDebugDisplay() {
        // Create debug element if it doesn't exist
        if (!_debugElement) {
            _debugElement = document.createElement('div');
            _debugElement.className = 'debug-info';
            document.body.appendChild(_debugElement);
        }
    }

    /**
     * Update debug display
     *
     * @private
     */
    function _updateDebugDisplay() {
        if (!_debugElement) return;

        const stats = StateManager.get('stats');
        const currentZone = Grid.getCurrentZone();
        const playerPos = _player ? {
            grid: { x: _player.gridX, y: _player.gridY },
            world: _player.position
        } : { grid: { x: 0, y: 0 }, world: { x: 0, y: 0 } };

        _debugElement.innerHTML = `
            FPS: ${stats.fps}<br>
            State: ${StateManager.get('gameState')}<br>
            Zone: ${Grid.getCurrentZoneId()} (${currentZone.width}x${currentZone.height})<br>
            Player: ${Math.round(playerPos.grid.x)},${Math.round(playerPos.grid.y)} (${Math.round(playerPos.world.x)},${Math.round(playerPos.world.y)})<br>
            Entities: ${stats.entityCount}
        `;
    }

    /**
     * Get current game state
     *
     * @returns {string} Current game state
     */
    function getGameState() {
        return StateManager.get('gameState');
    }

    /**
     * Get current configuration
     *
     * @returns {Object} Current configuration
     */
    function getConfig() {
        return { ..._config };
    }

    /**
     * Get player entity
     *
     * @returns {Object} Player entity
     */
    function getPlayer() {
        return _player;
    }

    // Public API
    return {
        // Constants
        STATES: GAME_STATES,

        // Methods
        init,
        start,
        pause,
        resume,
        gameOver,
        getGameState,
        getConfig,
        getPlayer
    };
})();