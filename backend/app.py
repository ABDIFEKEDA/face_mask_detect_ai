import os
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import base64

# Hide TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app = FastAPI(title="Face Mask Detection API")

# CORS middleware
# Get allowed origins from environment variable or use defaults
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model - check multiple possible paths
possible_paths = [
    "mask_detector_model.h5",  # Current directory
    "../mask_detector_model.h5",  # Parent directory
    os.path.join(os.path.dirname(__file__), "..", "mask_detector_model.h5"),  # Absolute path
]

model_path = None
for path in possible_paths:
    abs_path = os.path.abspath(path)
    if os.path.exists(abs_path):
        model_path = abs_path
        break

model = None
if model_path:
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"Model loaded successfully from {model_path}")
    except Exception as e:
        print(f"Warning: Could not load model from {model_path}: {e}")
        print("Using fallback detection method")
        model = None
else:
    print("Warning: Model file not found. Using fallback detection method.")
    print("Please ensure mask_detector_model.h5 exists in the project root.")

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

IMG_SIZE = 128

def detect_mask_in_image(image_array):
    """Detect faces and masks in an image"""
    gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
    
    results = []
    
    for (x, y, w, h) in faces:
        face_roi = image_array[y:y+h, x:x+w]
        face_resized = cv2.resize(face_roi, (IMG_SIZE, IMG_SIZE))
        face_normalized = face_resized / 255.0
        face_expanded = np.expand_dims(face_normalized, axis=0)
        
        if model is not None:
            try:
                prediction = model.predict(face_expanded, verbose=0)[0][0]
                has_mask = prediction < 0.5
                confidence = float(1 - prediction) if has_mask else float(prediction)
            except Exception as e:
                print(f"Model prediction error: {e}")
                # Fallback if model fails
                has_mask = False
                confidence = 0.5
        else:
            # Fallback: simple heuristic (not accurate, but works without model)
            # This is just for testing - model should be loaded for real detection
            has_mask = False
            confidence = 0.5
        
        # Draw rectangle on image
        color = (0, 255, 0) if has_mask else (0, 0, 255)
        cv2.rectangle(image_array, (x, y), (x+w, y+h), color, 2)
        label = "Mask" if has_mask else "No Mask"
        cv2.putText(image_array, f"{label} ({confidence:.2f})", (x, y-10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        results.append({
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h),
            "has_mask": bool(has_mask),
            "confidence": round(confidence, 2)
        })
    
    return results, image_array

@app.get("/")
def read_root():
    return {"message": "Face Mask Detection API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/detect")
async def detect_mask(file: UploadFile = File(...)):
    """Detect face masks in uploaded image"""
    try:
        # Read image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Detect faces and masks
        detections, annotated_image = detect_mask_in_image(image.copy())
        
        # Encode annotated image to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return JSONResponse({
            "detections": detections,
            "image": f"data:image/jpeg;base64,{image_base64}",
            "total_faces": len(detections)
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/detect-base64")
async def detect_mask_base64(data: dict):
    """Detect face masks from base64 encoded image"""
    try:
        image_data = data.get("image", "")
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Remove data URL prefix if present
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Detect faces and masks
        detections, annotated_image = detect_mask_in_image(image.copy())
        
        # Encode annotated image to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return JSONResponse({
            "detections": detections,
            "image": f"data:image/jpeg;base64,{image_base64}",
            "total_faces": len(detections)
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

