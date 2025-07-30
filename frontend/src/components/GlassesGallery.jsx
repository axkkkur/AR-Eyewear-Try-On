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

          // Calculate aspect-fit, scale and offsets for drawing on DISPLAY canvas
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
            // Robust: Average ALL eye points, not just 2 corners
            const leftEye = detection.landmarks.getLeftEye();
            const rightEye = detection.landmarks.getRightEye();

            // Avg center of both eyes (good for tilted/angled faces)
            const avgEye = [
              (leftEye.reduce((sum, pt) => sum + pt.x, 0) / leftEye.length +
                rightEye.reduce((sum, pt) => sum + pt.x, 0) / rightEye.length) /
                2,
              (leftEye.reduce((sum, pt) => sum + pt.y, 0) / leftEye.length +
                rightEye.reduce((sum, pt) => sum + pt.y, 0) / rightEye.length) /
                2,
            ];

            // Eye width: left-most to right-most
            const leftMost = leftEye[0],
              rightMost = rightEye[3];
            const eyeDist = Math.hypot(
              rightMost.x - leftMost.x,
              rightMost.y - leftMost.y
            );

            // Map the detected features to the canvas space
            const mappedEyeX = avgEye[0] * scale + offsetX;
            const mappedEyeY = avgEye[1] * scale + offsetY;
            const glassesWidth = eyeDist * 2.3 * scale; // Tweak 2.2–2.4 for your frame
            const glassesHeight = glassesWidth / 2.2;
            const gx = mappedEyeX - glassesWidth / 2;
            const gy = mappedEyeY - glassesHeight / 2.2;

            drawGlasses(gx, gy, glassesWidth, glassesHeight);
          } else {
            // fallback: center
            drawGlasses(
              DISPLAY_WIDTH / 2 - 75,
              DISPLAY_HEIGHT / 2 - 30,
              150,
              60
            );
          }
        };
      } catch (e) {
        console.error("Face detection error:", e);
      }
    }
    run();
    return () => {
      didCancel = true;
    };
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
          // Always use your deployed backend for image URLs!
          glassesImage={`https://ar-eyewear-try-on-1.onrender.com${g.image}`}
          name={g.name}
        />
      ))}
    </div>
  );
}
