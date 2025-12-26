# Deployment Guide

This guide covers deploying both the frontend (Next.js) and backend (FastAPI) to production.

## Table of Contents
1. [Backend Deployment Options](#backend-deployment)
2. [Frontend Deployment Options](#frontend-deployment)
3. [Environment Variables](#environment-variables)
4. [CORS Configuration](#cors-configuration)
5. [Quick Deploy Options](#quick-deploy)

---

## Backend Deployment

### Option 1: Railway (Recommended - Easy)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy:**
   ```bash
   cd backend
   railway init
   railway up
   ```

3. **Set Environment Variables in Railway Dashboard:**
   - No special variables needed for basic deployment

4. **Get your backend URL:**
   - Railway will provide a URL like: `https://your-app.railway.app`

### Option 2: Render

1. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Select the `backend` folder
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables:**
   - No special variables needed

3. **Get your backend URL:**
   - Render provides: `https://your-app.onrender.com`

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App:**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Create Procfile:**
   ```bash
   echo "web: uvicorn app:app --host 0.0.0.0 --port \$PORT" > Procfile
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create App:**
   - Go to DigitalOcean App Platform
   - Connect GitHub repository
   - Select `backend` folder
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### Option 5: AWS EC2 / Lightsail

1. **Launch Instance:**
   - Create EC2 or Lightsail instance (Ubuntu)
   - SSH into instance

2. **Install Dependencies:**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx
   ```

3. **Deploy App:**
   ```bash
   cd /var/www
   git clone your-repo-url
   cd face-mask-detection/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Create Systemd Service:**
   ```bash
   sudo nano /etc/systemd/system/facemask-api.service
   ```
   Add:
   ```ini
   [Unit]
   Description=Face Mask Detection API
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/face-mask-detection/backend
   Environment="PATH=/var/www/face-mask-detection/backend/venv/bin"
   ExecStart=/var/www/face-mask-detection/backend/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000

   [Install]
   WantedBy=multi-user.target
   ```

5. **Start Service:**
   ```bash
   sudo systemctl start facemask-api
   sudo systemctl enable facemask-api
   ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended - Best for Next.js)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Or use Vercel Dashboard:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Select `frontend` folder
   - Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

4. **Get your frontend URL:**
   - Vercel provides: `https://your-app.vercel.app`

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod
   ```

3. **Or use Netlify Dashboard:**
   - Go to https://netlify.com
   - Connect GitHub repository
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/.next`
   - Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

### Option 3: Render

1. **Create Static Site:**
   - Connect GitHub repository
   - Build Command: `cd frontend && npm install && npm run build && npm run export`
   - Publish Directory: `frontend/out`

2. **Or use Node.js Service:**
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm start`

### Option 4: AWS Amplify

1. **Go to AWS Amplify Console**
2. **Connect Repository**
3. **Build Settings:**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/.next
       files:
         - '**/*'
   ```

---

## Environment Variables

### Backend (.env or Platform Settings)

No required variables for basic deployment, but you can add:
```env
# Optional
PORT=8000
MODEL_PATH=mask_detector_model.h5
```

### Frontend (.env.local or Platform Settings)

**Required:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Important:** 
- For Vercel/Netlify: Set in dashboard under Environment Variables
- Variable must start with `NEXT_PUBLIC_` to be accessible in browser

---

## CORS Configuration

Update `backend/app.py` to allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://your-frontend.vercel.app",  # Production frontend
        "https://your-frontend.netlify.app",  # If using Netlify
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Or allow all origins (less secure, but easier):
```python
allow_origins=["*"],  # Allow all origins (not recommended for production)
```

---

## Quick Deploy (Recommended Setup)

### Step 1: Deploy Backend to Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repository → Select `backend` folder
4. Railway auto-detects Python and deploys
5. Copy the URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Import Project → Select GitHub repository
3. Root Directory: `frontend`
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app`
5. Deploy

### Step 3: Update Backend CORS

1. Edit `backend/app.py`
2. Add your Vercel URL to `allow_origins`
3. Redeploy backend

---

## Production Checklist

### Backend:
- [ ] CORS configured for frontend domain
- [ ] Model file uploaded (if using model)
- [ ] Environment variables set
- [ ] Health endpoint working: `/health`
- [ ] API accessible from frontend

### Frontend:
- [ ] `NEXT_PUBLIC_API_URL` set correctly
- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] API calls working

---

## Testing Deployment

### Test Backend:
```bash
curl https://your-backend-url.com/health
```

### Test Frontend:
1. Visit your frontend URL
2. Open browser console (F12)
3. Check for API connection
4. Try uploading an image

---

## Troubleshooting

### Backend Issues:

**Problem:** CORS errors
- **Solution:** Update `allow_origins` in `backend/app.py` with your frontend URL

**Problem:** Model not found
- **Solution:** Upload model file to your hosting platform or use fallback detection

**Problem:** Port issues
- **Solution:** Use `$PORT` environment variable (most platforms set this automatically)

### Frontend Issues:

**Problem:** API calls failing
- **Solution:** Check `NEXT_PUBLIC_API_URL` is set correctly
- **Solution:** Verify backend CORS allows your frontend domain

**Problem:** Build fails
- **Solution:** Run `npm run build` locally to see errors
- **Solution:** Check Node.js version (should be 18+)

---

## Cost Estimates

### Free Tier Options:
- **Railway:** $5/month free credit
- **Render:** Free tier available (with limitations)
- **Vercel:** Free tier for Next.js (generous limits)
- **Netlify:** Free tier available

### Paid Options:
- **AWS:** Pay as you go (~$5-20/month for small apps)
- **DigitalOcean:** $5/month minimum
- **Heroku:** $7/month (no free tier anymore)

---

## Recommended Stack (Free)

1. **Backend:** Railway (free tier)
2. **Frontend:** Vercel (free tier)
3. **Total Cost:** $0/month

This setup is perfect for getting started and can handle moderate traffic.

