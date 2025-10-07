# Logger Utility

## Overview

The logger utility provides conditional logging based on environment and categories. By default, **all logs are disabled** in both development and production to keep the console clean.

## Features

- **Environment-aware**: Full logging in development, errors/warnings only in production
- **Category-based**: Filter logs by category (sync, animation, store, canvas, general)
- **Disabled by default**: Clean console out of the box
- **Runtime control**: Enable/disable categories from browser console

## Usage

### Basic Logging

```typescript
import { logger } from '@/utils/logger'

// These will only log if the category is enabled
logger.debug('sync', 'Message', data)
logger.info('animation', 'Animation started', config)
logger.warn('store', 'Deprecated method used')
logger.error('canvas', 'Failed to render', error)
```

### Enabling Logging

By default, all logs are **disabled**. To enable logging, use the browser console:

```javascript
// Enable specific category
__logger.enable('sync')
__logger.enable('animation')

// Enable all categories
__logger.enableAll()

// Disable specific category
__logger.disable('sync')

// Disable all categories
__logger.disableAll()
```

### Categories

- `sync`: Viewer mode synchronization and BroadcastChannel
- `animation`: Spell animations, token movement, effects
- `store`: Zustand store updates and state changes
- `canvas`: Konva canvas rendering and interactions
- `general`: Miscellaneous application logs

## Code Configuration

To enable categories permanently (for debugging), edit `logger.ts`:

```typescript
const enabledCategories: Set<LogCategory> = new Set([
  'sync',      // Enable sync logs
  'animation', // Enable animation logs
  // Add categories you want enabled by default
])
```

## Migration from console.log

**Before:**
```typescript
console.log('[SyncManager] Broadcasted HEARTBEAT')
console.log('[mapStore.cleanupExpiredSpells] Called:', data)
```

**After:**
```typescript
logger.debug('sync', 'Broadcasted HEARTBEAT')
logger.debug('store', 'cleanupExpiredSpells called', data)
```

## Benefits

1. **Clean Console**: No spam in production or development
2. **Selective Debugging**: Enable only what you need
3. **Performance**: Logs are skipped entirely when disabled
4. **Consistent Format**: `[timestamp] [CATEGORY] message`
5. **Easy Toggle**: Enable/disable from browser console without code changes

## Example Session

```javascript
// Open browser console
// Enable sync logs to debug viewer mode
__logger.enable('sync')

// Now you'll see sync-related logs
// [12:34:56] [SYNC] Broadcasted HEARTBEAT
// [12:34:57] [SYNC] ViewerMode: Received sync response

// Disable when done
__logger.disable('sync')
```

## Production Behavior

In production (`import.meta.env.PROD`):
- `logger.debug()` - Never logged
- `logger.info()` - Never logged
- `logger.warn()` - Always logged (warnings are important)
- `logger.error()` - Always logged (errors are critical)
