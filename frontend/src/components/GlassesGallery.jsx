import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { getProducts } from "../api";
import "../mainui.css";

const DISPLAY_WIDTH = 300;
const DISPLAY_HEIGHT = 400;
const MODEL_URL = "/models";

function SingleTryOn({ userPhoto, glassesImage, name }) {
  const canvasRef = useRef();

  useEffect(() => {
    let didCancel = false;
    async function run() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

        const img = new window.Image();
        img.src = userPhoto;
        img.onload = async () => {
          const sourceW = img.width;
          const sourceH = img.height;
          const detCanvas = document.createElement("canvas");
          detCanvas.width = sourceW;
          detCanvas.height = sourceH;
          detCanvas.getContext("2d").drawImage(img, 0, 0);

          const detection = await faceapi
            .detectSingleFace(detCanvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true);

          const aspectImg = sourceW / sourceH;
          const aspectDisp = DISPLAY_WIDTH / DISPLAY_HEIGHT;
          let drawWidth, drawHeight, offsetX, offsetY, scale;
          if (aspectImg > aspectDisp) {
            drawWidth = DISPLAY_WIDTH;
            scale = DISPLAY_WIDTH / sourceW;
            drawHeight = sourceH * scale;
            offsetX = 0;
            offsetY = (DISPLAY_HEIGHT - drawHeight) / 2;
          } else {
            drawHeight = DISPLAY_HEIGHT;
            scale = DISPLAY_HEIGHT / sourceH;
            drawWidth = sourceW * scale;
            offsetX = (DISPLAY_WIDTH - drawWidth) / 2;
            offsetY = 0;
          }

          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          const drawGlasses = (gx, gy, gw, gh) => {
            const glasses = new window.Image();
            glasses.src = glassesImage;
            glasses.onload = () => {
              if (!didCancel) ctx.drawImage(glasses, gx, gy, gw, gh);
            };
          };

          if (detection && detection.landmarks) {
            const leftEye = detection.landmarks.getLeftEye();
            const rightEye = detection.landmarks.getRightEye();
            const eyeX = (leftEye[0].x + rightEye[3].x) / 2;
            const eyeY = (leftEye[0].y + rightEye[3].y) / 2;
            const eyeDist = Math.abs(rightEye[3].x - leftEye[0].x);

            const glassesWidth = eyeDist * 2.2 * scale;
            const glassesHeight = (eyeDist * 2.2 / 2.2) * scale;
            const gx = eyeX * scale + offsetX - glassesWidth / 2;
            const gy = eyeY * scale + offsetY - glassesHeight / 2.3;

            drawGlasses(gx, gy, glassesWidth, glassesHeight);
          } else {
            drawGlasses(DISPLAY_WIDTH / 2 - 75, DISPLAY_HEIGHT / 2 - 30, 150, 60);
          }
        };
      } catch (e) {
        console.error("Face detection error:", e);
      }
    }
    run();
    return () => { didCancel = true; };
  }, [userPhoto, glassesImage]);

  return (
    <div className="tryon-card">
      <canvas
        ref={canvasRef}
        width={DISPLAY_WIDTH}
        height={DISPLAY_HEIGHT}
        className="tryon-canvas"
      />
      <div className="glasses-name">{name}</div>
    </div>
  );
}

export default function GlassesGallery({ userPhoto }) {
  const [glasses, setGlasses] = useState([]);
  useEffect(() => {
    getProducts().then((resp) => setGlasses(resp.data));
  }, []);
  return (
    <div className="gallery-grid">
      {glasses.map((g, idx) => (
        <SingleTryOn
          key={idx}
          userPhoto={userPhoto}
          glassesImage={`http://localhost:5000${g.image}`}
          name={g.name}
        />
      ))}
    </div>
  );
}
