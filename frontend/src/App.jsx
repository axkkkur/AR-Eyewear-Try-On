import React, { useState } from "react";
import CaptureOverlay from "./components/CaptureOverlay";
import GlassesGallery from "./components/GlassesGallery";
import "./mainui.css";

function App() {
  const [userImage, setUserImage] = useState(null);

  return (
    <div className="main-bg">
      <div className="app-container">
        <h1 className="main-title">AR Eyewear Try-On</h1>
        {!userImage ? (
          <CaptureOverlay onCapture={setUserImage} />
        ) : (
          <>
            <div className="retake-row">
              <button
                className="retake-btn"
                onClick={() => setUserImage(null)}
              >
                Retake Photo
              </button>
            </div>
            <GlassesGallery userPhoto={userImage} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
