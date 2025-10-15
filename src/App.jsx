import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";

export default function ImageToText() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const dropZoneRef = useRef(null);

  // 📋 Handle paste (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile();
            const url = URL.createObjectURL(blob);
            setImage(url);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // 🖱️ Handle drag & drop
  useEffect(() => {
    const dropZone = dropZoneRef.current;

    const handleDragEnter = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      if (!dropZone.contains(e.relatedTarget)) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        setImage(URL.createObjectURL(file));
      }
    };

    const handleDragOver = (e) => e.preventDefault();

    dropZone.addEventListener("dragenter", handleDragEnter);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop);
    dropZone.addEventListener("dragover", handleDragOver);

    return () => {
      dropZone.removeEventListener("dragenter", handleDragEnter);
      dropZone.removeEventListener("dragleave", handleDragLeave);
      dropZone.removeEventListener("drop", handleDrop);
      dropZone.removeEventListener("dragover", handleDragOver);
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const convertImageToText = async () => {
    if (!image) return;
    setLoading(true);
    setText("");
    setProgress(0);

    try {
      const result = await Tesseract.recognize(image, "eng", {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setText(result.data.text);
    } catch (err) {
      console.error(err);
      setText("❌ Error reading image. Please try with a clearer image.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const copyToClipboard = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setImage(null);
    setText("");
    setProgress(0);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center p-4" style="
    height: auto;>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main Container - Full Screen */}
      <div
        ref={dropZoneRef}
        className={`relative grid grid-cols-1 xl:grid-cols-2 gap-6 w-full h-full max-w-full rounded-none xl:rounded-3xl p-4 xl:p-8 backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 ${
          isDragging ? "scale-[1.01] bg-blue-500/20 border-blue-400/30" : ""
        }`}
      >
        
        {/* Left Column - Upload & Image */}
        <div className="flex flex-col h-full space-y-4">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/5 rounded-2xl px-6 py-3 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🖼️</span>
              </div>
              <div>
                <h1 className="text-2xl xl:text-3xl font-bold text-white">Image to Text Converter</h1>
                <p className="text-white/60 text-sm">AI-Powered OCR Extraction</p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <label
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-500 group cursor-pointer min-h-[200px] xl:min-h-[250px] ${
                isDragging
                  ? "border-blue-400 bg-blue-500/20 scale-[1.01]"
                  : "border-white/20 hover:border-blue-400 bg-white/5 hover:bg-blue-500/10"
              }`}
            >
              <div className="text-center p-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative w-16 h-16 xl:w-20 xl:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 xl:w-10 xl:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <p className="text-lg font-semibold text-white mb-2">
                  {isDragging ? "🎯 Drop it here!" : "Click or drag image here"}
                </p>
                <p className="text-white/60 text-sm">
                  Supports PNG, JPG, JPEG, WEBP • Or paste with Ctrl+V
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Image Preview - SMALL FIXED SIZE */}
            {image && (
              <div className="flex flex-col">
                <div className="relative group bg-black/20 rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="flex items-center justify-center p-2 h-48">
                    <img
                      src={image}
                      alt="preview"
                      className="max-h-40 max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-sm">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span>📸</span>
                        <span>Image Preview</span>
                      </span>
                      <button
                        onClick={clearAll}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg text-red-200 text-xs transition-all duration-300"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at Bottom */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              onClick={convertImageToText}
              disabled={loading || !image}
              className="flex-1 relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:transform-none group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-transparent"></div>
                    <span>Processing... {progress}%</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Extract Text</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="flex flex-col h-full space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">📝</span>
              </div>
              <div>
                <h2 className="text-xl xl:text-2xl font-bold text-white">Extracted Text</h2>
                <p className="text-white/60 text-sm">AI-powered OCR results</p>
              </div>
            </div>
            
            {text && (
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                {copied ? (
                  <>✅ Copied!</>
                ) : (
                  <>📋 Copy</>
                )}
              </button>
            )}
          </div>

          {/* Text Results - SCROLLABLE AREA */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col min-h-0 bg-black/20 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="flex-1 overflow-y-auto p-4 xl:p-6">
                {text ? (
                  <pre className="text-white/90 leading-relaxed font-sans whitespace-pre-wrap text-sm xl:text-base">
                    {text}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-8">
                    <div className="text-white/40">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <p className="text-lg font-semibold mb-2">Ready for Magic</p>
                      <p className="text-sm">Your extracted text will appear here</p>
                      <p className="text-xs mt-2 text-white/30">Powered by Muhammad Farhan</p>
                      <div className="flex flex-col items-center gap-4 mt-6">
  <p className="text-white/50 text-sm">Connect with me</p>
  <div className="flex gap-4">
    <a 
      href="https://www.linkedin.com/in/muhammad-farhan-992245271/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-white/70 hover:text-white transition-all duration-300 group"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
      <span className="text-sm">LinkedIn</span>
    </a>
    
    <a 
      href="https://github.com/farhanrauf27" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-gray-700/20 hover:bg-gray-700/30 border border-gray-600/30 rounded-xl text-white/70 hover:text-white transition-all duration-300 group"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      <span className="text-sm">GitHub</span>
    </a>
  </div>
</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Text Stats */}
              {text && (
                <div className="border-t border-white/10 p-3 bg-white/5">
                  <div className="flex justify-between items-center text-xs text-white/60">
                    <span>📊 {text.split(/\s+/).length} words • {text.length} characters</span>
                    <span>✨ AI OCR Complete</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
            <div className="text-center bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-white font-bold text-lg">100+</div>
              <div className="text-white/60 text-xs">Formats</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-white font-bold text-lg">Instant</div>
              <div className="text-white/60 text-xs">Processing</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-white font-bold text-lg">AI</div>
              <div className="text-white/60 text-xs">Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
