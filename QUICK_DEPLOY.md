# Quick Deployment Guide

## Fastest Way to Deploy (5 minutes)

### Backend → Railway (Free)

1. **Sign up at https://railway.app**
2. **New Project → Deploy from GitHub**
3. **Select your repository**
4. **Settings → Root Directory: `backend`**
5. **Deploy!**
6. **Copy the URL** (e.g., `https://facemask-api.railway.app`)

### Frontend → Vercel (Free)

1. **Sign up at https://vercel.com**
2. **Import Project → Select GitHub repository**
3. **Root Directory: `frontend`**
4. **Environment Variables:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://facemask-api.railway.app` (your Railway URL)
5. **Deploy!**

### Update CORS

Edit `backend/app.py` line 20:
```python
allow_origins=[
    "http://localhost:3000",
    "https://your-frontend.vercel.app",  # Add your Vercel URL here
],
```

Then redeploy backend on Railway.

**Done!** Your app is live! 🎉

---

## Alternative: Deploy Both to Render

### Backend:
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub → Select repo
4. Settings:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### Frontend:
1. New → Static Site
2. Connect GitHub → Select repo
3. Settings:
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `frontend/.next`

---

## One-Click Deploy Buttons

### Deploy to Railway (Backend)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Deploy to Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Need Help?

Check `DEPLOYMENT.md` for detailed instructions and troubleshooting.

