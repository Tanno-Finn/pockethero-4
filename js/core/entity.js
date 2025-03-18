/**
 * Entity System
 *
 * Provides entity creation, management, and component-based functionality.
 * Entities are game objects with components that define their behavior.
 */
const EntityManager = (function() {
    // Collection of all entities
    const _entities = {};

    // Collection of entity templates
    const _templates = {};

    // Collection of component types
    const _componentTypes = {};

    /**
     * Initialize the entity manager
     */
    function init() {
        console.log('Entity Manager initialized');
    }

    /**
     * Create a new entity
     *
     * @param {string} type - Entity type
     * @param {Object} config - Entity configuration
     * @returns {Object} Created entity
     */
    function createEntity(type, config = {}) {
        // Generate unique id
        const id = config.id || Helpers.generateId('entity-');

        // Create base entity
        const entity = {
            id,
            type,
            tags: config.tags || [],
            active: true,
            components: {},
            position: config.position || { x: 0, y: 0 },
            zIndex: config.zIndex || 0,

            // Grid properties
            gridX: config.gridX || 0,
            gridY: config.gridY || 0,
            layer: config.layer || Grid.LAYERS.ACTOR,
            zoneId: config.zoneId || Grid.getCurrentZoneId(),

            // Component methods
            addComponent,
            removeComponent,
            getComponent,
            hasComponent,

            // Tag methods
            addTag,
            removeTag,
            hasTag,

            // Update and render methods
            update,
            render
        };

        // Add to entities collection
        _entities[id] = entity;

        // Add components from config
        if (config.components) {
            for (const compType in config.components) {
                const compConfig = config.components[compType];
                addComponent.call(entity, compType, compConfig);
            }
        }

        // Publish entity spawn event
        Events.publish(Events.EVENTS.ENTITY_SPAWN, { entity });

        return entity;
    }

    /**
     * Create an entity from a template
     *
     * @param {string} templateId - Template ID
     * @param {Object} overrides - Configuration overrides
     * @returns {Object} Created entity
     */
    function createEntityFromTemplate(templateId, overrides = {}) {
        if (!_templates[templateId]) {
            console.error(`Template '${templateId}' does not exist`);
            return null;
        }

        // Clone template and merge with overrides
        const config = Helpers.deepClone(_templates[templateId]);

        // Merge overrides
        for (const key in overrides) {
            if (key === 'components') {
                // Merge components separately
                config.components = config.components || {};

                for (const compType in overrides.components) {
                    if (!config.components[compType]) {
                        config.components[compType] = overrides.components[compType];
                    } else {
                        config.components[compType] = {
                            ...config.components[compType],
                            ...overrides.components[compType]
                        };
                    }
                }
            } else if (key === 'tags') {
                // Merge tags
                config.tags = [...(config.tags || []), ...overrides.tags];
            } else {
                // Override other properties
                config[key] = overrides[key];
            }
        }

        return createEntity(config.type, config);
    }

    /**
     * Register an entity template
     *
     * @param {string} templateId - Template ID
     * @param {Object} template - Template configuration
     */
    function registerTemplate(templateId, template) {
        _templates[templateId] = Helpers.deepClone(template);
        console.log(`Registered entity template '${templateId}'`);
    }

    /**
     * Register a component type
     *
     * @param {string} type - Component type
     * @param {Object} implementation - Component implementation
     */
    function registerComponent(type, implementation) {
        _componentTypes[type] = implementation;
        console.log(`Registered component type '${type}'`);
    }

    /**
     * Get a component implementation
     *
     * @param {string} type - Component type
     * @returns {Object} Component implementation
     */
    function getComponentImplementation(type) {
        return _componentTypes[type];
    }

    /**
     * Destroy an entity
     *
     * @param {string|Object} entityOrId - Entity or entity ID
     * @returns {boolean} Success
     */
    function destroyEntity(entityOrId) {
        const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
        const entity = _entities[id];

        if (!entity) {
            console.error(`Entity with ID '${id}' does not exist`);
            return false;
        }

        // Remove from grid if registered
        if (entity.zoneId) {
            Grid.unregisterEntity(entity);
        }

        // Publish entity destroy event
        Events.publish(Events.EVENTS.ENTITY_DESTROY, { entity });

        // Delete entity
        delete _entities[id];

        return true;
    }

    /**
     * Get an entity by ID
     *
     * @param {string} id - Entity ID
     * @returns {Object} Entity object or null
     */
    function getEntity(id) {
        return _entities[id] || null;
    }

    /**
     * Get all entities
     *
     * @returns {Object} Object containing all entities indexed by ID
     */
    function getAllEntities() {
        return { ..._entities };
    }

    /**
     * Find entities by type
     *
     * @param {string} type - Entity type
     * @returns {Array} Array of entities
     */
    function findEntitiesByType(type) {
        return Object.values(_entities).filter(entity => entity.type === type);
    }

    /**
     * Find entities by tag
     *
     * @param {string} tag - Tag to search for
     * @returns {Array} Array of entities
     */
    function findEntitiesByTag(tag) {
        return Object.values(_entities).filter(entity =>
            entity.tags && entity.tags.includes(tag)
        );
    }

    /**
     * Update all entities
     *
     * @param {number} deltaTime - Time since last update in seconds
     */
    function updateAll(deltaTime) {
        for (const id in _entities) {
            const entity = _entities[id];

            if (entity.active) {
                entity.update(deltaTime);
            }
        }
    }

    /**
     * Render all entities
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    function renderAll() {
        // Sort entities by zIndex for proper layering
        const sortedEntities = Object.values(_entities)
            .filter(entity => entity.active)
            .sort((a, b) => a.zIndex - b.zIndex);

        // Render each entity
        for (const entity of sortedEntities) {
            entity.render();
        }
    }

    // Entity instance methods

    /**
     * Add a component to the entity
     *
     * @param {string} type - Component type
     * @param {Object} config - Component configuration
     * @returns {Object} Created component
     * @this Entity
     */
    function addComponent(type, config = {}) {
        const implementation = _componentTypes[type];

        if (!implementation) {
            console.error(`Component type '${type}' is not registered`);
            return null;
        }

        // Create component
        const component = Object.create(implementation);

        // Initialize component
        if (component.init) {
            component.init(this, config);
        }

        // Store component
        this.components[type] = component;

        return component;
    }

    /**
     * Remove a component from the entity
     *
     * @param {string} type - Component type
     * @returns {boolean} Success
     * @this Entity
     */
    function removeComponent(type) {
        if (!this.components[type]) {
            return false;
        }

        // Call component cleanup if available
        if (this.components[type].cleanup) {
            this.components[type].cleanup(this);
        }

        // Remove component
        delete this.components[type];

        return true;
    }

    /**
     * Get a component from the entity
     *
     * @param {string} type - Component type
     * @returns {Object} Component or null
     * @this Entity
     */
    function getComponent(type) {
        return this.components[type] || null;
    }

    /**
     * Check if the entity has a component
     *
     * @param {string} type - Component type
     * @returns {boolean} True if entity has component
     * @this Entity
     */
    function hasComponent(type) {
        return !!this.components[type];
    }

    /**
     * Add a tag to the entity
     *
     * @param {string} tag - Tag to add
     * @returns {boolean} Success
     * @this Entity
     */
    function addTag(tag) {
        if (!this.tags) {
            this.tags = [];
        }

        if (this.tags.includes(tag)) {
            return false;
        }

        this.tags.push(tag);
        return true;
    }

    /**
     * Remove a tag from the entity
     *
     * @param {string} tag - Tag to remove
     * @returns {boolean} Success
     * @this Entity
     */
    function removeTag(tag) {
        if (!this.tags) {
            return false;
        }

        const index = this.tags.indexOf(tag);
        if (index === -1) {
            return false;
        }

        this.tags.splice(index, 1);
        return true;
    }

    /**
     * Check if the entity has a tag
     *
     * @param {string} tag - Tag to check
     * @returns {boolean} True if entity has tag
     * @this Entity
     */
    function hasTag(tag) {
        return this.tags && this.tags.includes(tag);
    }

    /**
     * Update the entity
     *
     * @param {number} deltaTime - Time since last update in seconds
     * @this Entity
     */
    function update(deltaTime) {
        // Update all components
        for (const type in this.components) {
            const component = this.components[type];

            if (component.update) {
                component.update(this, deltaTime);
            }
        }
    }

    /**
     * Render the entity
     *
     * @this Entity
     */
    function render() {
        // Check if the entity is on screen before rendering
        if (!Camera.isRectVisible(
            this.position.x - Grid.getCellSize() / 2,
            this.position.y - Grid.getCellSize() / 2,
            Grid.getCellSize(),
            Grid.getCellSize()
        )) {
            return;
        }

        // Let components handle rendering
        for (const type in this.components) {
            const component = this.components[type];

            if (component.render) {
                component.render(this);
            }
        }
    }

    // Public API
    return {
        init,
        createEntity,
        createEntityFromTemplate,
        registerTemplate,
        registerComponent,
        getComponentImplementation,
        destroyEntity,
        getEntity,
        getAllEntities,
        findEntitiesByType,
        findEntitiesByTag,
        updateAll,
        renderAll
    };
})();