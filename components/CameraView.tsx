
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Icon } from './Icon';

interface CameraViewProps {
  onImageSubmit: (base64Image: string, prompt: string) => void;
  onBack: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onImageSubmit, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
            setError('Camera access is not supported by your browser.');
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions.');
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (capturedImage && prompt.trim()) {
      onImageSubmit(capturedImage, prompt);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
        <Icon name="alert" className="w-12 h-12 mb-4" />
        <p className="text-center">{error}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="relative flex-1">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
        <button onClick={onBack} className="absolute top-2 left-2 p-2 bg-black/50 rounded-full text-white">
          <Icon name="back" />
        </button>
      </div>
      
      {capturedImage ? (
        <div className="p-3 bg-gray-100 dark:bg-gray-900 border-t border-white/20">
            <div className="flex items-center gap-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-full p-1">
                 <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Ask about the image..."
                    className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 dark:text-white px-2"
                 />
                <button onClick={handleSubmit} disabled={!prompt.trim()} className="p-2 bg-gradient-to-br from-neon-blue to-neon-fuchsia rounded-full text-white disabled:opacity-50">
                    <Icon name="send" />
                </button>
            </div>
            <button onClick={() => setCapturedImage(null)} className="w-full mt-2 text-center text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                Retake Photo
            </button>
        </div>
      ) : (
        <div className="p-4 flex justify-center bg-black/50">
          <button onClick={handleCapture} className="w-16 h-16 rounded-full bg-white border-4 border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue focus:ring-offset-black"></button>
        </div>
      )}
    </div>
  );
};
