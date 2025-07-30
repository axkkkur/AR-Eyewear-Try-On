import { useRef, useEffect } from "react";
import "../mainui.css";

function CaptureOverlay({ onCapture }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        alert("Please allow camera access!");
      }
    };
    enableStream();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    const imageDataUrl = canvas.toDataURL("image/png");
    onCapture(imageDataUrl);
  };

  return (
    <div className="overlay-bg">
      <div className="overlay-card">
        <video
          ref={videoRef}
          autoPlay
          className="video-preview"
        />
        <button className="capture-btn" onClick={handleCapture}>
          Capture Photo
        </button>
        <div className="overlay-tip">
          Position your face inside the camera and click 'Capture Photo'
        </div>
      </div>
    </div>
  );
}

export default CaptureOverlay;
