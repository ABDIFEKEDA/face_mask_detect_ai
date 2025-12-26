# Face Mask Detection System

A full-stack web application for real-time face mask detection using OpenCV, TensorFlow, Next.js, and Tailwind CSS.

## Features

- 🎥 **Real-time Webcam Detection**: Use your webcam for live face mask detection
- 📸 **Image Upload**: Upload images to detect face masks
- 🤖 **AI-Powered**: Uses TensorFlow model for accurate mask detection
- 🎨 **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui components
- ⚡ **Fast API**: FastAPI backend for efficient image processing

## Project Structure

```
face-mask-detection/
├── backend/              # Python FastAPI backend
│   ├── app.py           # Main API application
│   └── requirements.txt # Python dependencies
├── frontend/             # Next.js frontend
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── lib/             # Utility functions
│   └── package.json     # Node.js dependencies
├── mask_detector_model.h5  # Trained model file
└── README.md
```

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn
- Webcam (for real-time detection)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Make sure the model file (`mask_detector_model.h5`) is in the root directory or update the path in `app.py`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate your virtual environment (if using one)

3. Run the FastAPI server:
```bash
python app.py
```

Or using uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Start the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Using Webcam**:
   - Click "Start Camera" to activate your webcam
   - Click "Capture Frame" to detect masks in the current frame
   - Or click "Start Auto-Detection" for continuous detection

2. **Uploading Images**:
   - Click "Upload Image" and select an image file
   - The system will automatically detect faces and masks

3. **Viewing Results**:
   - Detection results show on the right side
   - Green boxes indicate masks detected
   - Red boxes indicate no mask
   - Confidence scores are displayed for each detection

## API Endpoints

### `GET /`
Health check endpoint

### `GET /health`
Returns API health status and model loading status

### `POST /detect`
Upload an image file for mask detection
- **Body**: multipart/form-data with `file` field
- **Response**: JSON with detections and annotated image

### `POST /detect-base64`
Detect masks from base64 encoded image
- **Body**: JSON with `image` field (base64 string)
- **Response**: JSON with detections and annotated image

## Model Information

The system uses a TensorFlow/Keras model trained on face mask detection dataset. The model:
- Input size: 128x128 pixels
- Output: Binary classification (mask/no mask)
- Uses Haar Cascade for face detection
- Processes RGB images normalized to [0, 1]

## Troubleshooting

### Model Not Found
If you see "Warning: Could not load model", make sure:
- The model file `mask_detector_model.h5` exists in the root directory
- Or update the `model_path` in `backend/app.py`

### Camera Not Working
- Check browser permissions for camera access
- Make sure no other application is using the camera
- Try refreshing the page and allowing camera permissions

### CORS Errors
- Make sure the backend is running on port 8000
- Check that `CORS_ORIGINS` in `app.py` includes your frontend URL

## Technologies Used

### Backend
- FastAPI - Modern Python web framework
- OpenCV - Computer vision library
- TensorFlow - Machine learning framework
- NumPy - Numerical computing

### Frontend
- Next.js 14 - React framework
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - High-quality component library
- Lucide React - Icon library

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!

