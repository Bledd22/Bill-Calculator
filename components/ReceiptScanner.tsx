import React, { useState, useRef } from 'react';
import { Camera, Loader2, Sparkles } from './Icons';
import { parseReceiptImage } from '../services/geminiService';
import { ReceiptData } from '../types';

interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const base64 = await convertFileToBase64(file);
      // Remove data URL prefix for Gemini API
      const base64Data = base64.split(',')[1];
      const data = await parseReceiptImage(base64Data);
      onScanComplete(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze receipt. Please try again or enter details manually.');
    } finally {
      setIsScanning(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="mb-6">
      <div 
        className={`
          relative overflow-hidden rounded-xl border-2 border-dashed border-indigo-200 
          bg-indigo-50/50 p-6 text-center transition-all duration-300
          hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer
        `}
        onClick={() => !isScanning && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={isScanning}
        />
        
        {isScanning ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-medium text-indigo-800">Gemini is analyzing your receipt...</p>
            <p className="text-xs text-indigo-500 mt-1">This may take a few seconds</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 group">
            <div className="mb-3 rounded-full bg-white p-3 shadow-sm ring-1 ring-indigo-100 transition-transform group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-indigo-900">
              Auto-fill with AI
            </h3>
            <p className="text-xs text-indigo-600 max-w-[200px]">
              Upload a receipt photo and let Gemini extract the totals for you.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-200">
              <Camera className="h-3.5 w-3.5" />
              <span>Snap or Upload</span>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;