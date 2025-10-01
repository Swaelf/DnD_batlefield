# Affected Files - Properties Panel Refactor

## Session Changes (Current)

### Files Modified
1. `src/components/Properties/TokenProperties.tsx` - **NEEDS DECOMPOSITION**
   - Removed tooltip functionality
   - Added HP visual indicator with color-coded progress bar
   - Added borders to all input components
   - Added padding to root container
   - Fixed CSS variable usage (replaced vars with hex colors)
   - Added data-testid attributes

2. `src/components/Canvas/MapCanvas.tsx`
   - Removed TokenHPTooltip import and usage
   - Removed tooltip state and handlers

3. `src/components/Properties/PropertiesPanel.tsx`
   - Added data-testid to all Panel variants
   - Made PanelBody scrollable with custom scrollbar

4. `src/components/ui/Panel.tsx`
   - Changed base display to flex for proper scrolling

5. `src/index.css`
   - Added custom scrollbar styles for .custom-scrollbar class

### Files Created (Previous Session)
6. `src/components/Properties/RotationControl.tsx`
7. `src/components/Properties/MultiSelectProperties.tsx`
8. `src/components/Properties/StaticObjectProperties.tsx`
9. `src/components/Properties/StaticObjectPropertiesEditor.tsx`
10. `src/components/Properties/index.ts`

### Other Modified Files
11. `src/App.tsx`
12. `src/components/Properties/BaseProperties.tsx`
13. `src/components/Selection/AdvancedSelectionManager.tsx`
14. `src/components/StaticObject/StaticObjectRenderer.tsx`
15. `src/components/ui/RotationIndicator.tsx`
16. `src/hooks/useKeyboardShortcuts.ts`

## Files Ready to Commit
All files EXCEPT `src/components/Properties/TokenProperties.tsx` which needs decomposition.

## TokenProperties.tsx Decomposition Needed

### Current Structure (398 lines)
The file has clear sections marked by comments that should be extracted:

1. **Token Information Section** (lines 22-191)
   - Name input
   - Size and Shape selectors
   - Color picker
   - Show Label checkbox
   - Label Position selector

2. **HP Management Section** (lines 200-391)
   - Visual HP Indicator with progress bar
   - Show HP Ring checkbox
   - Current and Max HP inputs with +/- buttons
   - Temporary HP input
   - Quick Actions buttons (damage/heal shortcuts)

### Proposed Component Decomposition

#### New Components to Create:
1. `TokenInfoSection.tsx` - Token basic information
   - Name input
   - Size selector
   - Shape selector (circle/square buttons)
   - Color picker

2. `TokenLabelSettings.tsx` - Label configuration
   - Show Label checkbox
   - Label Position selector

3. `TokenHPIndicator.tsx` - Visual HP display
   - Linear progress bar with color coding
   - HP count text with color

4. `TokenHPControls.tsx` - HP management
   - Current HP input with +/- buttons
   - Max HP input
   - Temporary HP input
   - Show HP Ring checkbox

5. `TokenQuickActions.tsx` - Quick HP adjustment buttons
   - Damage buttons (-5)
   - Heal buttons (+5)
   - Full heal button
   - Knock out button

#### Benefits:
- Each component under 100 lines
- Clear separation of concerns
- Easier to test in isolation
- Reusable components
- Better maintainability
