# Camera Troubleshooting Guide

## If Camera Is Not Working:

### 1. Check Browser Console (F12)
Open browser DevTools (F12) and check the Console tab for:
- Camera permission errors
- Video element errors
- Stream errors

### 2. Common Issues:

#### Issue: "Camera permission denied"
**Solution:**
- Click the lock icon in browser address bar
- Allow camera permissions
- Refresh the page
- Try again

#### Issue: "No camera found"
**Solution:**
- Make sure a camera is connected
- Check if camera works in other apps
- Try a different browser

#### Issue: "Camera is being used by another application"
**Solution:**
- Close other apps using the camera (Zoom, Teams, etc.)
- Restart browser
- Try again

#### Issue: Video element shows but is black/blank
**Solution:**
- Check if camera LED is on (indicates camera is active)
- Try refreshing the page
- Check browser console for errors
- Try a different browser

### 3. Browser Compatibility:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: May need HTTPS
- ❌ Internet Explorer: Not supported

### 4. HTTPS Requirement:
Some browsers require HTTPS for camera access. If testing locally:
- Chrome/Edge: Works on localhost
- Firefox: Works on localhost
- Safari: May require HTTPS even on localhost

### 5. Test Camera Access:
Open browser console and run:
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log("Camera works!", stream)
    stream.getTracks().forEach(track => track.stop())
  })
  .catch(err => console.error("Camera error:", err))
```

### 6. Check Video Element:
After clicking "Start Camera", check:
- Is the video element visible?
- Does it show a black screen or error?
- Check Network tab for any failed requests

### 7. Debug Steps:
1. Open browser console (F12)
2. Click "Start Camera"
3. Look for console messages:
   - "Requesting camera access..."
   - "Camera stream obtained:"
   - "Stream assigned to video element"
   - "Video metadata loaded"
   - "Video playback started"

4. If you see errors, note the error message and check this guide

### 8. Still Not Working?
- Try incognito/private mode
- Clear browser cache
- Restart browser
- Try a different browser
- Check if camera works in other websites (e.g., Google Meet test)

