/**
 * Data Validator
 *
 * Validates data against schemas.
 * Used to ensure data integrity for game data.
 */
const Validator = (function() {
    // Store validation errors
    const _errors = [];

    // Schema definitions
    const _schemas = {};

    /**
     * Initialize the validator
     */
    function init() {
        // Register built-in schemas
        registerSchema('zone', {
            type: 'object',
            required: ['id', 'name', 'width', 'height', 'tiles'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                width: { type: 'number', minimum: 1 },
                height: { type: 'number', minimum: 1 },
                tiles: {
                    type: 'array',
                    items: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                },
                entities: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['type', 'x', 'y'],
                        properties: {
                            type: { type: 'string' },
                            x: { type: 'number' },
                            y: { type: 'number' },
                            properties: { type: 'object' }
                        }
                    }
                },
                teleporters: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['x', 'y', 'targetZone', 'targetX', 'targetY'],
                        properties: {
                            x: { type: 'number' },
                            y: { type: 'number' },
                            targetZone: { type: 'string' },
                            targetX: { type: 'number' },
                            targetY: { type: 'number' }
                        }
                    }
                }
            }
        });

        registerSchema('tile', {
            type: 'object',
            required: ['id', 'name', 'color'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                color: { type: 'string' },
                shape: {
                    type: 'string',
                    enum: ['rectangle', 'circle', 'triangle']
                },
                tags: {
                    type: 'array',
                    items: { type: 'string' }
                },
                properties: { type: 'object' }
            }
        });

        registerSchema('entity', {
            type: 'object',
            required: ['id', 'name', 'components'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                color: { type: 'string' },
                shape: {
                    type: 'string',
                    enum: ['rectangle', 'circle', 'triangle']
                },
                size: { type: 'number' },
                tags: {
                    type: 'array',
                    items: { type: 'string' }
                },
                components: { type: 'object' },
                interactionDirections: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['up', 'right', 'down', 'left']
                    }
                },
                properties: { type: 'object' }
            }
        });

        console.log('Validator initialized with built-in schemas');
    }

    /**
     * Register a schema
     *
     * @param {string} name - Schema name
     * @param {Object} schema - Schema definition
     */
    function registerSchema(name, schema) {
        _schemas[name] = schema;
    }

    /**
     * Get a schema by name
     *
     * @param {string} name - Schema name
     * @returns {Object} Schema definition
     */
    function getSchema(name) {
        return _schemas[name];
    }

    /**
     * Validate data against a schema
     *
     * @param {Object} data - Data to validate
     * @param {string} schemaName - Schema name
     * @returns {boolean} True if valid
     */
    function validate(data, schemaName) {
        // Clear previous errors
        _errors.length = 0;

        const schema = _schemas[schemaName];
        if (!schema) {
            _errors.push(`Schema '${schemaName}' not found`);
            return false;
        }

        try {
            return _validateObject(data, schema, '');
        } catch (error) {
            _errors.push(`Validation error: ${error.message}`);
            return false;
        }
    }

    /**
     * Validate an object against a schema
     *
     * @param {Object} data - Data to validate
     * @param {Object} schema - Schema to validate against
     * @param {string} path - Current property path
     * @returns {boolean} True if valid
     * @private
     */
    function _validateObject(data, schema, path) {
        // Check type
        if (schema.type === 'object' && typeof data !== 'object') {
            _errors.push(`${path || 'Root'} should be an object`);
            return false;
        }

        if (schema.type === 'array' && !Array.isArray(data)) {
            _errors.push(`${path || 'Root'} should be an array`);
            return false;
        }

        if (schema.type === 'string' && typeof data !== 'string') {
            _errors.push(`${path || 'Root'} should be a string`);
            return false;
        }

        if (schema.type === 'number' && typeof data !== 'number') {
            _errors.push(`${path || 'Root'} should be a number`);
            return false;
        }

        if (schema.type === 'boolean' && typeof data !== 'boolean') {
            _errors.push(`${path || 'Root'} should be a boolean`);
            return false;
        }

        // Additional validations based on type
        if (schema.type === 'string' && schema.enum) {
            if (!schema.enum.includes(data)) {
                _errors.push(`${path || 'Root'} should be one of: ${schema.enum.join(', ')}`);
                return false;
            }
        }

        if (schema.type === 'number') {
            if (schema.minimum !== undefined && data < schema.minimum) {
                _errors.push(`${path || 'Root'} should be at least ${schema.minimum}`);
                return false;
            }

            if (schema.maximum !== undefined && data > schema.maximum) {
                _errors.push(`${path || 'Root'} should be at most ${schema.maximum}`);
                return false;
            }
        }

        // Object-specific validations
        if (schema.type === 'object') {
            // Check required properties
            if (schema.required) {
                for (const prop of schema.required) {
                    if (data[prop] === undefined) {
                        _errors.push(`${path ? path + '.' + prop : prop} is required`);
                        return false;
                    }
                }
            }

            // Validate properties
            if (schema.properties) {
                for (const prop in schema.properties) {
                    if (data[prop] !== undefined) {
                        const propPath = path ? path + '.' + prop : prop;
                        const propSchema = schema.properties[prop];

                        const valid = _validateObject(data[prop], propSchema, propPath);
                        if (!valid) return false;
                    }
                }
            }
        }

        // Array-specific validations
        if (schema.type === 'array' && schema.items) {
            for (let i = 0; i < data.length; i++) {
                const itemPath = path ? path + '[' + i + ']' : '[' + i + ']';
                const valid = _validateObject(data[i], schema.items, itemPath);
                if (!valid) return false;
            }
        }

        return true;
    }

    /**
     * Get validation errors
     *
     * @returns {Array} Array of error messages
     */
    function getErrors() {
        return [..._errors];
    }

    // Public API
    return {
        init,
        registerSchema,
        getSchema,
        validate,
        getErrors
    };
})();