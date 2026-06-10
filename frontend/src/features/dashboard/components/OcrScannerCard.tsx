'use client';

import { useRef, ChangeEvent } from 'react';
import { Camera, Loader2, Check, AlertCircle } from 'lucide-react';

interface OcrScannerCardProps {
  ocrScanStep: 'idle' | 'scanning' | 'success' | 'error';
  ocrFeedback: string;
  onReceiptUpload: (file: File) => void;
  onDemoScan: () => void;
}

/**
 * OcrScannerCard handles secure local upload dropzones and AI OCR mock simulation triggers.
 */
export function OcrScannerCard({
  ocrScanStep,
  ocrFeedback,
  onReceiptUpload,
  onDemoScan,
}: OcrScannerCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, and WebP receipt images are supported.');
      return;
    }

    // Size check (< 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('File size exceeds 4MB security limit.');
      return;
    }

    onReceiptUpload(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-500" />
            Receipt OCR Ingestion
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-semibold uppercase tracking-wider">
            Google Cloud Vision OCR Ingestion Pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="receipt-file-uploader"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={ocrScanStep === 'scanning'}
          />
          <button
            onClick={triggerFileSelect}
            disabled={ocrScanStep === 'scanning'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:bg-emerald-800 disabled:cursor-not-allowed"
            aria-label="Upload utility bill or receipt image"
          >
            {ocrScanStep === 'scanning' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            <span>Upload Receipt</span>
          </button>
          
          <button
            onClick={onDemoScan}
            disabled={ocrScanStep === 'scanning'}
            className="border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer"
          >
            Demo OCR Scan
          </button>
        </div>
      </div>

      {/* OCR SCANNER STATUS FEEDBACK BANNER */}
      {ocrScanStep !== 'idle' && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 ${
          ocrScanStep === 'scanning' 
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
            : ocrScanStep === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {ocrScanStep === 'scanning' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : ocrScanStep === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">{ocrFeedback}</span>
          </div>
          {ocrScanStep === 'scanning' && (
            <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-blue-500 animate-pulse w-full"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
