# Quick Start Guide

## To Fix "Not Working" Issues:

### Step 1: Start the Backend
```bash
cd backend
python app.py
```
Backend should run on: http://localhost:8000

### Step 2: Start the Frontend (in a NEW terminal)
```bash
cd frontend
npm run dev
```
Frontend should run on: http://localhost:3000

### Step 3: Open in Browser
Open: http://localhost:3000

## If CSS Still Not Working:

1. **Clear Next.js cache:**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

2. **Verify Tailwind is processing:**
   - Check browser console for errors
   - Look for CSS in `<style>` tags in page source
   - Verify `globals.css` is loaded (check Network tab)

3. **Check if dev server is running:**
   - Should see: "Ready on http://localhost:3000"
   - No errors in terminal

## Common Issues:

### Issue: "Cannot GET /"
- **Solution:** Make sure you're running `npm run dev` not `npm start`

### Issue: White page / No CSS
- **Solution:** 
  1. Stop dev server (Ctrl+C)
  2. Delete `.next` folder
  3. Run `npm run dev` again
  4. Hard refresh browser (Ctrl+Shift+R)

### Issue: API errors
- **Solution:** Make sure backend is running on port 8000

### Issue: Import errors
- **Solution:** Run `npm install` in frontend folder

## Verify Everything Works:

1. ✅ Backend running: http://localhost:8000/health
2. ✅ Frontend running: http://localhost:3000
3. ✅ CSS loaded: Page should have colors/styling
4. ✅ No console errors: Check browser DevTools

