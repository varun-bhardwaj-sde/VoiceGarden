import { useState, useEffect, useRef } from "react";

const VOICES = [
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", desc: "Laid-back & Casual", gender: "male" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "Confident & Warm", gender: "female" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", desc: "Quirky & Enthusiastic", gender: "female" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", desc: "Energetic & Deep", gender: "male" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", desc: "Warm Storyteller", gender: "male" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", desc: "Clear Educator", gender: "female" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", desc: "Deep & Comforting", gender: "male" },
];

const API_BASE = "http://localhost:8080/api/v1/tts";

// Falling Leaves Component
function FallingLeaves() {
  const leaves = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 12 + Math.random() * 10,
    type: Math.floor(Math.random() * 3),
  }));

  return (
    <div className="leaves-container">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className={`leaf leaf-type-${leaf.type}`}
          style={{
            left: `${leaf.left}%`,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
            fontSize: `${leaf.size}px`,
          }}
        >
          🍂
        </div>
      ))}
    </div>
  );
}

// Flying Birds Component
function FlyingBirds() {
  const birds = [
    { id: 1, top: 15, delay: 0, duration: 18 },
    { id: 2, top: 22, delay: 6, duration: 22 },
    { id: 3, top: 12, delay: 12, duration: 20 },
  ];

  return (
    <div className="birds-container">
      {birds.map((bird) => (
        <div
          key={bird.id}
          className="bird"
          style={{
            top: `${bird.top}%`,
            animationDelay: `${bird.delay}s`,
            animationDuration: `${bird.duration}s`,
          }}
        >
          <div className="bird-body">
            <div className="wing wing-left"></div>
            <div className="wing wing-right"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Waveform Component
function Waveform({ isPlaying, barCount = 32 }) {
  return (
    <div className="waveform">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={`waveform-bar ${isPlaying ? "playing" : ""}`}
          style={{
            "--delay": `${i * 0.05}s`,
            "--height": `${15 + Math.sin(i * 0.4) * 12 + Math.random() * 8}px`,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [requestId, setRequestId] = useState(null);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const charCount = text.length;
  const selectedVoice = VOICES.find((v) => v.id === voiceId);

  useEffect(() => {
    let interval;
    if (requestId && status !== "DONE" && status !== "FAILED") {
      interval = setInterval(pollStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [requestId, status]);

  useEffect(() => {
    if (status === "DONE" && audioRef.current) {
      audioRef.current.load();
    }
  }, [status]);

  const submitRequest = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    setStatus("PENDING");
    setErrorMessage("");
    setRequestId(null);

    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId, sourceWindow: "WebUI" }),
      });
      const data = await response.json();
      setRequestId(data.requestId);
    } catch {
      setStatus("FAILED");
      setErrorMessage("Could not reach the server. Is your backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/requests/${requestId}`);
      const data = await response.json();
      setStatus(data.status);
      if (data.status === "FAILED") {
        setErrorMessage(data.errorMessage || "Processing failed.");
      }
    } catch {
      setStatus("FAILED");
      setErrorMessage("Lost connection while checking status.");
    }
  };

  const resetForm = () => {
    setText("");
    setRequestId(null);
    setStatus("");
    setErrorMessage("");
    setIsPlaying(false);
  };

  const isProcessing = status === "PENDING" || status === "STREAMING";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Nunito', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* ============ NATURE SCENE ============ */
        .nature-scene {
          position: fixed;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        /* Sky Gradient */
        .sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            #87CEEB 0%,
            #B4E1F2 25%,
            #F7E8D0 60%,
            #FFDAB3 80%,
            #FFB87A 100%
          );
        }

        /* Sun */
        .sun {
          position: absolute;
          top: 8%;
          right: 15%;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, #FFF9E6 0%, #FFD966 50%, #FFAA33 100%);
          border-radius: 50%;
          box-shadow: 
            0 0 60px 30px rgba(255, 217, 102, 0.4),
            0 0 120px 60px rgba(255, 170, 51, 0.2);
          animation: sunPulse 4s ease-in-out infinite;
        }

        @keyframes sunPulse {
          0%, 100% { box-shadow: 0 0 60px 30px rgba(255, 217, 102, 0.4), 0 0 120px 60px rgba(255, 170, 51, 0.2); }
          50% { box-shadow: 0 0 80px 40px rgba(255, 217, 102, 0.5), 0 0 150px 80px rgba(255, 170, 51, 0.25); }
        }

        /* Sun Rays */
        .sun-rays {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          opacity: 0.3;
        }

        .ray {
          position: absolute;
          top: 12%;
          right: 18%;
          width: 4px;
          height: 300px;
          background: linear-gradient(180deg, rgba(255,220,150,0.8) 0%, transparent 100%);
          transform-origin: top center;
          animation: rayShimmer 6s ease-in-out infinite;
        }

        .ray:nth-child(1) { transform: rotate(-30deg); animation-delay: 0s; }
        .ray:nth-child(2) { transform: rotate(-15deg); animation-delay: 0.5s; }
        .ray:nth-child(3) { transform: rotate(0deg); animation-delay: 1s; }
        .ray:nth-child(4) { transform: rotate(15deg); animation-delay: 1.5s; }
        .ray:nth-child(5) { transform: rotate(30deg); animation-delay: 2s; }
        .ray:nth-child(6) { transform: rotate(45deg); animation-delay: 2.5s; }

        @keyframes rayShimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        /* Clouds */
        .clouds {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50px;
          animation: cloudFloat 40s linear infinite;
        }

        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: inherit;
          border-radius: 50%;
        }

        .cloud-1 {
          width: 120px;
          height: 40px;
          top: 10%;
          left: -150px;
          animation-duration: 45s;
        }
        .cloud-1::before { width: 50px; height: 50px; top: -25px; left: 20px; }
        .cloud-1::after { width: 60px; height: 60px; top: -30px; left: 50px; }

        .cloud-2 {
          width: 100px;
          height: 35px;
          top: 18%;
          left: -120px;
          animation-duration: 55s;
          animation-delay: 10s;
          opacity: 0.6;
        }
        .cloud-2::before { width: 45px; height: 45px; top: -22px; left: 15px; }
        .cloud-2::after { width: 50px; height: 50px; top: -25px; left: 45px; }

        .cloud-3 {
          width: 80px;
          height: 28px;
          top: 6%;
          left: -100px;
          animation-duration: 60s;
          animation-delay: 20s;
          opacity: 0.5;
        }
        .cloud-3::before { width: 35px; height: 35px; top: -18px; left: 12px; }
        .cloud-3::after { width: 40px; height: 40px; top: -20px; left: 35px; }

        @keyframes cloudFloat {
          from { transform: translateX(0); }
          to { transform: translateX(calc(100vw + 200px)); }
        }

        /* Mountains */
        .mountains {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 55%;
        }

        .mountain {
          position: absolute;
          bottom: 0;
          width: 0;
          height: 0;
          border-style: solid;
        }

        .mountain-back-1 {
          left: -5%;
          border-width: 0 200px 280px 200px;
          border-color: transparent transparent #7BA089 transparent;
          opacity: 0.6;
        }

        .mountain-back-2 {
          right: -10%;
          border-width: 0 250px 320px 250px;
          border-color: transparent transparent #6B9B7A transparent;
          opacity: 0.5;
        }

        .mountain-back-3 {
          left: 30%;
          border-width: 0 180px 260px 180px;
          border-color: transparent transparent #8FB89A transparent;
          opacity: 0.55;
        }

        .mountain-mid-1 {
          left: 5%;
          border-width: 0 180px 240px 180px;
          border-color: transparent transparent #5D8A6B transparent;
          opacity: 0.8;
        }

        .mountain-mid-2 {
          right: 5%;
          border-width: 0 220px 280px 220px;
          border-color: transparent transparent #4A7A5A transparent;
          opacity: 0.75;
        }

        .mountain-front-1 {
          left: -8%;
          border-width: 0 200px 200px 200px;
          border-color: transparent transparent #3D6B4A transparent;
        }

        .mountain-front-2 {
          right: -5%;
          border-width: 0 180px 180px 180px;
          border-color: transparent transparent #2F5A3A transparent;
        }

        .mountain-front-3 {
          left: 40%;
          border-width: 0 160px 160px 160px;
          border-color: transparent transparent #3A6548 transparent;
        }

        /* Hills */
        .hills {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 25%;
        }

        .hill {
          position: absolute;
          bottom: 0;
          border-radius: 50% 50% 0 0;
        }

        .hill-1 {
          left: -10%;
          width: 50%;
          height: 100%;
          background: linear-gradient(180deg, #4A7F5A 0%, #3A6B4A 100%);
        }

        .hill-2 {
          right: -15%;
          width: 60%;
          height: 90%;
          background: linear-gradient(180deg, #3D7048 0%, #2D5A38 100%);
        }

        .hill-3 {
          left: 25%;
          width: 55%;
          height: 70%;
          background: linear-gradient(180deg, #5A8F6A 0%, #4A7F5A 100%);
        }

        /* Grass Foreground */
        .grass {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 8%;
          background: linear-gradient(180deg, #4A7F5A 0%, #3A6545 100%);
        }

        /* ============ LEAVES ============ */
        .leaves-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .leaf {
          position: absolute;
          top: -30px;
          animation: leafFall linear infinite;
          opacity: 0.8;
        }

        .leaf-type-1 { filter: hue-rotate(0deg); }
        .leaf-type-2 { filter: hue-rotate(20deg) brightness(1.1); }
        .leaf-type-0 { filter: hue-rotate(-15deg) saturate(1.2); }

        @keyframes leafFall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% {
            transform: translateY(100vh) rotate(360deg) translateX(50px);
            opacity: 0;
          }
        }

        /* ============ BIRDS ============ */
        .birds-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .bird {
          position: absolute;
          left: -40px;
          animation: birdFly linear infinite;
        }

        .bird-body {
          position: relative;
          width: 8px;
          height: 3px;
          background: #2D3436;
          border-radius: 50%;
        }

        .wing {
          position: absolute;
          width: 12px;
          height: 2px;
          background: #2D3436;
          top: -1px;
          border-radius: 50%;
          transform-origin: right center;
        }

        .wing-left {
          right: 4px;
          animation: wingFlap 0.3s ease-in-out infinite;
        }

        .wing-right {
          left: 4px;
          transform-origin: left center;
          animation: wingFlap 0.3s ease-in-out infinite reverse;
        }

        @keyframes wingFlap {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(30deg); }
        }

        @keyframes birdFly {
          from { transform: translateX(0); }
          to { transform: translateX(calc(100vw + 80px)); }
        }

        /* ============ UI CONTENT ============ */
        .app-content {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 24px;
        }

        .header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 600;
          color: #2D3B2D;
          text-shadow: 0 2px 20px rgba(255,255,255,0.5);
          margin-bottom: 6px;
        }

        .header p {
          font-size: 15px;
          color: #4A5A4A;
          font-weight: 500;
        }

        /* Floating Card */
        .floating-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 
            0 8px 32px rgba(45, 75, 45, 0.15),
            0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid rgba(255,255,255,0.6);
          max-width: 600px;
          margin: 0 auto 20px;
          width: 100%;
          animation: floatIn 0.8s ease-out;
        }

        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6B8B6B;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Textarea */
        textarea {
          width: 100%;
          min-height: 140px;
          border: 2px solid #E8F0E8;
          border-radius: 16px;
          padding: 16px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #2D3B2D;
          resize: vertical;
          background: rgba(255,255,255,0.7);
          transition: all 0.3s ease;
        }

        textarea::placeholder {
          color: #9CAF9C;
        }

        textarea:focus {
          outline: none;
          border-color: #7BA089;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(123, 160, 137, 0.15);
        }

        textarea:disabled {
          opacity: 0.6;
        }

        .text-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .char-count {
          font-size: 12px;
          color: #9CAF9C;
          font-weight: 600;
        }

        .char-count.warn {
          color: #D97B5E;
        }

        /* Voice Grid */
        .voices-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
        }

        .voice-card {
          background: rgba(255,255,255,0.6);
          border: 2px solid transparent;
          border-radius: 14px;
          padding: 14px 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: center;
        }

        .voice-card:hover {
          background: rgba(255,255,255,0.9);
          transform: translateY(-2px);
        }

        .voice-card.selected {
          border-color: #7BA089;
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(123, 160, 137, 0.2);
        }

        .voice-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .voice-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7BA089 0%, #5D8A6B 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          font-size: 16px;
        }

        .voice-name {
          font-weight: 600;
          font-size: 14px;
          color: #2D3B2D;
          margin-bottom: 2px;
        }

        .voice-desc {
          font-size: 11px;
          color: #7A8F7A;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 18px 28px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #7BA089 0%, #5D8A6B 100%);
          color: white;
          font-family: 'Nunito', sans-serif;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(93, 138, 107, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(93, 138, 107, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .submit-btn.processing {
          background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%);
          box-shadow: 0 6px 20px rgba(196, 149, 106, 0.35);
        }

        /* Status Card */
        .status-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(45, 75, 45, 0.12);
          border: 1px solid rgba(255,255,255,0.7);
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
          animation: floatIn 0.5s ease-out;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .status-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .status-icon.pending { background: rgba(212, 165, 116, 0.15); }
        .status-icon.streaming { background: rgba(123, 160, 137, 0.15); }
        .status-icon.done { background: rgba(123, 160, 137, 0.2); }
        .status-icon.failed { background: rgba(217, 123, 94, 0.15); }

        .status-info h3 {
          font-size: 17px;
          font-weight: 700;
          color: #2D3B2D;
          margin-bottom: 4px;
        }

        .status-info p {
          font-size: 13px;
          color: #7A8F7A;
        }

        .error-box {
          background: rgba(217, 123, 94, 0.1);
          border-radius: 12px;
          padding: 14px;
          color: #B85A40;
          font-size: 14px;
          margin-top: 12px;
        }

        /* Waveform */
        .waveform {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          height: 50px;
          padding: 12px 0;
        }

        .waveform-bar {
          width: 4px;
          height: 6px;
          background: linear-gradient(180deg, #7BA089 0%, #5D8A6B 100%);
          border-radius: 3px;
          opacity: 0.3;
        }

        .waveform-bar.playing {
          animation: waveAnim 0.7s ease-in-out infinite;
          animation-delay: var(--delay);
          opacity: 1;
        }

        @keyframes waveAnim {
          0%, 100% { height: 6px; }
          50% { height: var(--height); }
        }

        /* Audio Section */
        .audio-container {
          background: rgba(123, 160, 137, 0.08);
          border-radius: 16px;
          padding: 20px;
          margin-top: 16px;
        }

        .audio-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .audio-title {
          font-weight: 700;
          color: #2D3B2D;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .voice-tag {
          font-size: 12px;
          background: rgba(123, 160, 137, 0.2);
          padding: 4px 10px;
          border-radius: 20px;
          color: #5D8A6B;
          font-weight: 600;
        }

        audio {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          margin-top: 8px;
        }

        .new-btn {
          margin-top: 16px;
          width: 100%;
          padding: 14px;
          background: transparent;
          border: 2px solid #C8D8C8;
          border-radius: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #5D8A6B;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .new-btn:hover {
          border-color: #7BA089;
          background: rgba(123, 160, 137, 0.05);
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: auto;
          padding-top: 30px;
          font-size: 12px;
          color: rgba(45, 59, 45, 0.6);
        }

        /* Mobile */
        @media (max-width: 600px) {
          .header h1 { font-size: 28px; }
          .floating-card { padding: 20px; }
          .voices-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .voice-card { padding: 12px 8px; }
          .voice-avatar { width: 32px; height: 32px; }
          .voice-name { font-size: 12px; }
          .voice-desc { display: none; }
        }
      `}</style>

      {/* Nature Scene Background */}
      <div className="nature-scene">
        <div className="sky" />
        
        {/* Sun with rays */}
        <div className="sun" />
        <div className="sun-rays">
          <div className="ray" />
          <div className="ray" />
          <div className="ray" />
          <div className="ray" />
          <div className="ray" />
          <div className="ray" />
        </div>

        {/* Clouds */}
        <div className="clouds">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
        </div>

        {/* Mountains */}
        <div className="mountains">
          <div className="mountain mountain-back-1" />
          <div className="mountain mountain-back-2" />
          <div className="mountain mountain-back-3" />
          <div className="mountain mountain-mid-1" />
          <div className="mountain mountain-mid-2" />
          <div className="mountain mountain-front-1" />
          <div className="mountain mountain-front-2" />
          <div className="mountain mountain-front-3" />
        </div>

        {/* Hills */}
        <div className="hills">
          <div className="hill hill-1" />
          <div className="hill hill-2" />
          <div className="hill hill-3" />
        </div>

        <div className="grass" />

        {/* Animated Elements */}
        <FallingLeaves />
        <FlyingBirds />
      </div>

      {/* UI Content */}
      <div className="app-content">
        <header className="header">
          <h1>🌿 Voice Garden</h1>
          <p>Let your words bloom into speech</p>
        </header>

        {/* Text Input - Floating */}
        <div className="floating-card">
          <div className="card-label">✍️ Your Words</div>
          <textarea
            placeholder="Type or paste text you'd like to hear spoken..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
            maxLength={5000}
          />
          <div className="text-footer">
            <span className={`char-count ${charCount > 4500 ? "warn" : ""}`}>
              {charCount.toLocaleString()} / 5,000
            </span>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="floating-card">
          <div className="card-label">🎭 Choose Voice</div>
          <div className="voices-grid">
            {VOICES.map((voice) => (
              <div
                key={voice.id}
                className={`voice-card ${voiceId === voice.id ? "selected" : ""} ${isProcessing ? "disabled" : ""}`}
                onClick={() => !isProcessing && setVoiceId(voice.id)}
              >
                <div className="voice-avatar">
                  {voice.gender === "male" ? "👨" : "👩"}
                </div>
                <div className="voice-name">{voice.name}</div>
                <div className="voice-desc">{voice.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="floating-card" style={{ padding: '16px 24px' }}>
          <button
            className={`submit-btn ${isProcessing ? "processing" : ""}`}
            onClick={submitRequest}
            disabled={!text.trim() || isProcessing || isSubmitting}
          >
            {isProcessing ? (
              <>{status === "PENDING" ? "⏳ In Queue..." : "🌱 Growing Audio..."}</>
            ) : (
              <>🎧 Generate Speech</>
            )}
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className="status-card">
            <div className="status-header">
              <div className={`status-icon ${status.toLowerCase()}`}>
                {status === "PENDING" && "⏳"}
                {status === "STREAMING" && "🌱"}
                {status === "DONE" && "✨"}
                {status === "FAILED" && "😔"}
              </div>
              <div className="status-info">
                <h3>
                  {status === "PENDING" && "Preparing..."}
                  {status === "STREAMING" && "Creating Audio"}
                  {status === "DONE" && "Ready to Listen!"}
                  {status === "FAILED" && "Something Went Wrong"}
                </h3>
                <p>
                  {status === "PENDING" && "Your request is in the queue"}
                  {status === "STREAMING" && `${selectedVoice?.name} is speaking your words`}
                  {status === "DONE" && "Your audio has bloomed"}
                  {status === "FAILED" && "Please try again"}
                </p>
              </div>
            </div>

            {isProcessing && (
              <Waveform isPlaying={status === "STREAMING"} />
            )}

            {status === "FAILED" && errorMessage && (
              <div className="error-box">⚠️ {errorMessage}</div>
            )}

            {status === "DONE" && requestId && (
              <>
                <div className="audio-container">
                  <div className="audio-header">
                    <span className="audio-title">🔊 Your Audio</span>
                    <span className="voice-tag">{selectedVoice?.name}</span>
                  </div>
                  <Waveform isPlaying={isPlaying} barCount={40} />
                  <audio
                    ref={audioRef}
                    controls
                    src={`${API_BASE}/requests/${requestId}/audio`}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
                <button className="new-btn" onClick={resetForm}>
                  ← Start Fresh
                </button>
              </>
            )}
          </div>
        )}

        <footer className="footer">
          Voice Garden — Built by Varun Bhardwaj
        </footer>
      </div>
    </>
  );
}

export default App;