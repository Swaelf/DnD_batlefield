# Next Decomposition Targets

## Priority Queue

Based on file size analysis, these components should be considered for decomposition:

### 1. LayerManagementPanel.tsx (429 lines) - **HIGHEST PRIORITY**
**Complexity**: Very High
**Reason**: Largest component in Properties directory, likely has multiple concerns

**Potential sections to extract:**
- Layer list rendering
- Layer controls (visibility, lock, opacity)
- Layer reordering/drag-drop
- Layer creation/deletion
- Layer effects/blend modes

**Estimated sub-components**: 4-6

---

### 2. RotationControl.tsx (397 lines) - **HIGH PRIORITY**
**Complexity**: High
**Reason**: Nearly as large as original TokenProperties

**Potential sections to extract:**
- Rotation input controls
- Visual rotation indicator
- Rotation presets/snapping
- Rotation animation controls

**Estimated sub-components**: 3-4

---

### 3. ShapeStylePanel.tsx (332 lines) - **MEDIUM PRIORITY**
**Complexity**: Medium-High
**Reason**: Style management can be complex

**Potential sections to extract:**
- Fill style controls
- Stroke/border controls
- Shadow/effects controls
- Style presets/templates

**Estimated sub-components**: 3-4

---

### 4. StaticObjectProperties.tsx (289 lines) - **MEDIUM PRIORITY**
**Complexity**: Medium
**Reason**: Static object configuration

**Potential sections to extract:**
- Object type selection
- Position/transform controls
- Object-specific properties
- Preview/thumbnail

**Estimated sub-components**: 3-4

---

## Decomposition Guidelines (Learned from TokenProperties)

### When to Decompose:
- Component > 250 lines
- Multiple distinct UI sections (marked by comments)
- Mixed concerns (display + logic + controls)
- Reusable sub-sections

### How to Decompose:
1. Identify sections marked by `{/* Comment */}` blocks
2. Each section should have single responsibility
3. Extract to separate file with descriptive name
4. Keep sub-components < 150 lines
5. Update barrel exports in index.ts

### Component Naming Pattern:
- Main component: `[Feature]Properties.tsx`
- Sub-components: `[Feature][Section].tsx`
  - Example: `TokenInfoSection`, `TokenHPControls`

### Benefits Checklist:
- [ ] Smaller, focused files (< 150 lines each)
- [ ] Clear separation of concerns
- [ ] Easier to test in isolation
- [ ] Reusable components
- [ ] Better maintainability
- [ ] Improved developer experience

---

## Recommended Next Action

**Start with LayerManagementPanel.tsx** (429 lines)

This component is the largest and likely has the most complex logic. Decomposing it will:
1. Improve code organization significantly
2. Make layer management easier to maintain
3. Enable better testing of individual layer features
4. Set pattern for other large components

**Estimated Time**: 2-3 hours
**Estimated New Components**: 4-6 files
**Target Main Component Size**: < 100 lines
