import { useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';

export function useFaceRecognition() {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    async function loadModels() {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log("Face API models loaded");
      } catch (err) {
        console.error("Error loading face-api models:", err);
      }
    }
    loadModels();
  }, []);

  return { modelsLoaded };
}
