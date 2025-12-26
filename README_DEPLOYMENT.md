# 🚀 Quick Start Deployment

## Recommended: Railway + Vercel (100% Free)

### Backend (Railway) - 2 minutes

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. In project settings, set **Root Directory** to `backend`
5. Railway will auto-detect Python and deploy
6. Copy your Railway URL (e.g., `https://facemask-api.railway.app`)

### Frontend (Vercel) - 2 minutes

1. Go to https://vercel.com and sign up
2. Click "Import Project" → Select your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add Environment Variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your Railway URL from step above
5. Click "Deploy"

### Update CORS - 1 minute

1. Edit `backend/app.py`
2. Find line with `allow_origins=`
3. Add your Vercel URL:
   ```python
   allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://your-app.vercel.app").split(",")
   ```
4. Commit and push (Railway auto-deploys)

**Done!** Your app is live! 🎉

---

## Alternative Platforms

### Backend Options:
- **Render** (Free tier) - https://render.com
- **Heroku** ($7/month) - https://heroku.com
- **DigitalOcean** ($5/month) - https://digitalocean.com
- **AWS EC2** (Pay as you go)

### Frontend Options:
- **Netlify** (Free tier) - https://netlify.com
- **AWS Amplify** (Free tier) - https://aws.amazon.com/amplify
- **Cloudflare Pages** (Free) - https://pages.cloudflare.com

---

## Environment Variables

### Backend (Railway/Render/etc.):
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.netlify.app
```

### Frontend (Vercel/Netlify/etc.):
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## Testing Your Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend-url.com/health
   ```
   Should return: `{"status":"healthy","model_loaded":true/false}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Open browser console (F12)
   - Check for "API connected" message
   - Try uploading an image

---

## Troubleshooting

### CORS Errors?
- Make sure frontend URL is in backend's `ALLOWED_ORIGINS`
- Check backend logs for CORS errors

### API Not Connecting?
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running (visit `/health` endpoint)
- Check browser console for errors

### Build Fails?
- Check Node.js version (needs 18+)
- Check Python version (needs 3.8+)
- Review build logs in deployment platform

---

For detailed instructions, see `DEPLOYMENT.md`

