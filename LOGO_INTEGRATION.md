# Logo Integration Guide

## Overview
The Cura Hospitals logo (cmhlogo.png) has been integrated into the Doctor Portal application.

## Implementation Details

### Logo Location
- **File**: `public/cmhlogo.png`
- **Path in code**: `/cmhlogo.png` (served from public folder)

### Components Updated

#### 1. LoginPage Component (`src/components/LoginPage.jsx`)
- Replaced the Building2 icon with the actual logo
- Logo size: 128x128px (w-32 h-32)
- Positioned at the top center of the login page
- Maintains responsive design

**Before:**
```jsx
<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cura-primary to-cura-secondary rounded-2xl shadow-lg mb-4">
  <Building2 className="w-10 h-10 text-white" />
</div>
```

**After:**
```jsx
<div className="inline-flex items-center justify-center mb-4">
  <img 
    src="/cmhlogo.png" 
    alt="Cura Hospitals Logo" 
    className="w-32 h-32 object-contain"
  />
</div>
```

#### 2. Dashboard Component (`src/components/Dashboard.jsx`)
- Added logo to the sidebar header
- Two states:
  - **Expanded sidebar**: Logo (48x48px) + text
  - **Collapsed sidebar**: Logo only (40x40px)
- Logo adapts to sidebar state

**Expanded Sidebar:**
```jsx
<div className="flex items-center gap-3">
  <img 
    src="/cmhlogo.png" 
    alt="Cura Hospitals Logo" 
    className="w-12 h-12 object-contain"
  />
  <div>
    <h2 className="text-lg font-bold text-cura-primary">Cura Hospitals</h2>
    <p className="text-xs text-gray-600">Doctor Portal</p>
  </div>
</div>
```

**Collapsed Sidebar:**
```jsx
<img 
  src="/cmhlogo.png" 
  alt="Cura Hospitals Logo" 
  className="w-10 h-10 object-contain mx-auto"
/>
```

## Deployment Considerations

### Public Folder
- Files in the `public/` folder are served at the root path
- No import statements needed
- Accessible via `/filename.ext` in production
- Automatically included in build output

### Git & Version Control
- Logo file is tracked by Git (not in .gitignore)
- Will be included in commits and deployments
- Vercel/Netlify will serve it from the public folder

### Build Process
When running `npm run build`:
1. Vite copies all files from `public/` to `dist/`
2. Logo becomes available at `/cmhlogo.png` in production
3. No additional configuration needed

## Testing

### Local Development
1. Start dev server: `npm run dev`
2. Navigate to login page
3. Verify logo appears on login page
4. Login and verify logo in dashboard sidebar
5. Toggle sidebar to verify collapsed state

### Production Build
```bash
npm run build
npm run preview
```
Verify logo loads correctly in preview mode.

## Troubleshooting

### Logo Not Showing
1. **Check file location**: Ensure `cmhlogo.png` is in `public/` folder
2. **Check path**: Use `/cmhlogo.png` (not `./cmhlogo.png` or `../public/cmhlogo.png`)
3. **Clear cache**: Hard refresh browser (Ctrl+Shift+R)
4. **Check console**: Look for 404 errors in browser console

### Logo Size Issues
- Use `object-contain` class to maintain aspect ratio
- Adjust `w-*` and `h-*` classes as needed
- Logo should be square or near-square for best results

### Deployment Issues
- Verify `public/` folder is committed to Git
- Check deployment logs for file copying
- Ensure hosting platform serves static files from root

## Future Enhancements

### Potential Improvements
- Add favicon using the same logo
- Create different logo sizes for various contexts
- Add dark mode variant if needed
- Implement lazy loading for performance
- Add loading placeholder

### Favicon Setup
To add favicon:
1. Create `public/favicon.ico` from logo
2. Update `index.html`:
```html
<link rel="icon" type="image/png" href="/cmhlogo.png" />
```

## Version History

### v1.0.0 (Current)
- Initial logo integration
- Added to LoginPage component
- Added to Dashboard sidebar
- Responsive design for collapsed/expanded states
- Moved to public folder for deployment

---

**File Location**: `public/cmhlogo.png`  
**Components**: LoginPage.jsx, Dashboard.jsx  
**Last Updated**: November 2025
