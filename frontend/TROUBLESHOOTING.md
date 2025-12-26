# Troubleshooting Guide

## Common Issues and Solutions

### 1. CSS Not Loading / No Styling
**Problem:** Tailwind CSS classes not applying

**Solutions:**
- Make sure you've restarted the dev server after changes: `npm run dev`
- Clear Next.js cache: `rm -rf .next` (or delete `.next` folder)
- Verify `globals.css` is imported in `app/layout.tsx` ✓
- Check `tailwind.config.js` includes `.tsx` files ✓

### 2. Dev Server Not Starting
**Problem:** `npm run dev` fails

**Solutions:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Then start dev server
npm run dev
```

### 3. API Connection Issues
**Problem:** Cannot connect to backend

**Solutions:**
- Make sure backend is running on port 8000
- Check `.env.local` file exists with: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Verify CORS is enabled in backend (already configured ✓)

### 4. TypeScript Errors
**Problem:** Import errors or type errors

**Solutions:**
- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` paths are correct ✓

### 5. Build Errors
**Problem:** `npm run build` fails

**Solutions:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Quick Fix Commands

```bash
# Full reset (if nothing works)
cd frontend
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

## Verify Setup

1. ✅ Tailwind CSS installed: `npm list tailwindcss`
2. ✅ PostCSS configured: `postcss.config.js` exists
3. ✅ Globals CSS imported: Check `app/layout.tsx`
4. ✅ TypeScript config: `tsconfig.json` paths correct
5. ✅ All dependencies: `npm install` completed

