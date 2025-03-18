# Coding Guidelines

## Communication Guidelines

### Code Changes
- When modifying a file, always provide the complete updated file content
- Do not use truncated code snippets with ellipses (...) or "rest of code remains the same" comments
- Ensure code is ready to be copied and pasted directly into the file system
- When referencing code changes, specify the exact filename and location

### Reporting Progress
- Clearly indicate which TODO items have been addressed
- Update TODO.md by marking completed items and adding new ones as needed
- Document all architectural decisions in DESIGN.md, not in conversation
- Update CHANGELOG.md with all significant changes
- Ensure documentation is complete enough to continue development in a new conversation

### New Data Structures
- When creating new data types, always document the complete schema
- Include examples of valid data structures
- Update appropriate README.md files in data directories
- Implement validation for new data structures

## General Principles
- Keep code simple and readable
- Follow DRY (Don't Repeat Yourself) principles
- Use consistent formatting
- Write modular, reusable code
- Test thoroughly

## Naming Conventions

### Files
- Use camelCase for JavaScript files: `gameEngine.js`
- Use kebab-case for HTML and CSS files: `main-style.css`

### JavaScript
- Use camelCase for variables and functions: `playerScore`, `calculateDistance()`
- Use PascalCase for classes and constructors: `GameEngine`, `SpriteRenderer`
- Use UPPER_SNAKE_CASE for constants: `MAX_PLAYERS`, `DEFAULT_WIDTH`
- Prefix private properties and methods with underscore: `_privateMethod()`

## Code Organization

### Project Structure
```
project-root/
├── index.html              # Main entry point
├── css/                    # All stylesheets
│   ├── main.css            # Core styles
│   └── components/         # Component-specific styles
│       └── [component].css
├── js/                     # JavaScript source files
│   ├── core/               # Core engine components
│   │   ├── game.js         # Main game logic
│   │   ├── state.js        # State management
│   │   └── loop.js         # Game loop
│   ├── components/         # Game component modules
│   │   ├── player.js
│   │   └── [other-components].js
│   ├── utils/              # Utility functions
│   │   ├── math.js
│   │   └── helpers.js
│   ├── rendering/          # Rendering-related code
│   │   ├── renderer.js     # Main rendering engine
│   │   ├── shapes.js       # Canvas shape drawing utilities
│   │   └── effects.js      # Visual effects with canvas
│   ├── input/              # Input handling
│   │   └── input-manager.js
│   └── data/               # Data management
│       ├── loader.js       # Data loading utilities
│       └── validator.js    # JSON validation
├── data/                   # Game data (JSON files)
│   ├── levels/             # Level definitions
│   ├── entities/           # Entity definitions
│   └── config/             # Configuration
├── assets/                 # Future game assets (not used initially)
│   └── fonts/              # Custom fonts (if needed)
# Note: The following folders will be added later when needed:
# ├── images/             # Graphics assets
# │   ├── sprites/
# │   └── ui/
# ├── audio/              # Sound files
# │   ├── music/
# │   └── sfx/
├── tests/                  # Test files
│   ├── core/               # Mirror main structure
│   ├── components/
│   └── test-utils.js
└── docs/                   # Additional documentation
    └── api/                # Generated API docs
```

### File Structure Guidelines
- Each file should have a single responsibility
- Group related functionality in the same file
- Keep files under 300 lines when possible; split larger files by functionality
- Place interface definitions at the top of the file
- Organize imports/requires in a consistent order:
  1. Core/standard libraries
  2. Third-party libraries
  3. Project modules (using relative paths)
- Export only what is necessary from each module

### Code Blocks
- Use two-space indentation
- Place opening braces on the same line as the statement
- Each nested block should be indented by one level
- Keep methods short (preferably under 30 lines)

## Documentation

### Comments
- All files must begin with a file header comment describing its purpose
- Every function, class, and method must have a JSDoc comment
- Use inline comments for complex logic only, prefer self-documenting code
- Comment format:

```javascript
/**
 * Function description
 * 
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 */
function exampleFunction(paramName) {
  // Implementation
}
```

### Class Documentation
- Document the purpose of the class
- Document all public methods and properties
- Document constructor parameters

## Testing

### Test File Organization
- Create test files in a `tests` directory
- Name test files to match the file they test: `gameEngine.js` → `gameEngine.test.js`

### Test Methods
- Use console.assert() for basic tests
- Group related tests together
- Each test should verify a single behavior
- Include comments describing expected behavior
- Example:

```javascript
// Test player movement
function testPlayerMovement() {
  const player = new Player(0, 0);
  player.moveRight(5);
  console.assert(player.x === 5, "Player should move 5 units right");
}
```

### Test Execution
- Include a runTests() function in each test file
- Document how to run tests manually
- Log test results clearly

## Initial Development Approach

### Graphics and Audio
- Initial development will NOT use image sprites or audio files
- Use native Canvas shapes and drawing operations (rectangles, circles, lines, etc.)
- Use color, size, and animation to differentiate game elements
- Structure code to allow for easy replacement with sprite-based graphics later
- Comment placeholder sections where sprite/audio implementation would go in future

### Canvas Best Practices
- Use layers for different game elements when appropriate
- Implement basic collision detection with geometric shapes
- Use transformation matrices for rotations when needed rather than redrawing
- Create utility functions for commonly used shapes and patterns
- Implement simple particle effects with native Canvas operations if needed

## Data Management

### Data-Code Separation
- Game data must be separated from game logic
- Store all game data in JSON files within a dedicated `data/` directory
- Categorize data files by type (e.g., `data/levels/`, `data/entities/`)
- Each type of data should have a consistent schema

### Data Schema Documentation
- Create and maintain schema documentation for each data type
- Document the structure in the file header of each JSON file
- Include a README.md file in each data subdirectory explaining:
  - Purpose of the data type
  - Required and optional fields
  - Data types and constraints
  - Examples of valid data

### Data Loading
- Create utility functions to load and validate data
- Implement error handling for malformed or missing data
- Cache data appropriately to avoid redundant loading

### Schema Example
```javascript
/**
 * Level Data Schema:
 * {
 *   "id": string,           // Unique identifier
 *   "name": string,         // Display name
 *   "width": number,        // Level width in units
 *   "height": number,       // Level height in units
 *   "entities": [           // Array of entities in the level
 *     {
 *       "type": string,     // Entity type (must match an entity definition)
 *       "x": number,        // X position
 *       "y": number,        // Y position
 *       "properties": {}    // Optional entity-specific properties
 *     }
 *   ],
 *   "background": string    // Background color or pattern
 * }
 */
```

## Browser Compatibility

- Test on multiple browsers (at minimum: Chrome, Firefox, Safari)
- Use ES6+ features with caution, document browser requirements
- Include polyfills when necessary for wider compatibility

## Error Handling

- Use try/catch blocks for operations that might fail
- Provide meaningful error messages
- Log errors appropriately
- Fail gracefully when possible

## Version Control

- Make small, focused commits
- Write meaningful commit messages
- Structure commit messages as: "Category: Brief description"
- Example: "Rendering: Fix sprite flicker during animation"