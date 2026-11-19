
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Hash,
  ImageUp,
  X,
  ScanLine,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Barcode,
  Leaf,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

import { scanService } from '../services/scanService.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { USE_MOCK } from '../services/api.js';

const SCAN_OPTIONS = [
  {
    id: 'camera',
    icon: Camera,
    title: 'Camera Scan',
    description: 'Scan a product barcode using your camera.',
    number: '01',
  },
  {
    id: 'manual',
    icon: Hash,
    title: 'Manual Entry',
    description: 'Enter the product barcode number manually.',
    number: '02',
  },
  {
    id: 'barcode-image',
    icon: Barcode,
    title: 'Barcode Image',
    description: 'Upload a photo containing the product barcode.',
    number: '03',
  },
  {
    id: 'ingredient-image',
    icon: ImageUp,
    title: 'Ingredients Image',
    description: 'Upload an ingredients label for AI analysis.',
    number: '04',
  },
];

function LoadingMessage({ children }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-[#EFF5EF] px-4 py-4 text-sm text-[#247A50]">
      <Loader2 size={19} className="animate-spin shrink-0" />
      {children}
    </div>
  );
}

function UploadArea({ title, description, fileRef, onFile }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileRef.current?.click();
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        onFile(event.dataTransfer.files[0]);
      }}
      onDragOver={(event) => event.preventDefault()}
      className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C9DCCF] bg-[#F6FAF6] px-6 py-12 text-center transition hover:border-[#247A50] hover:bg-[#EFF6F0]"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5F1E8] text-[#247A50] transition group-hover:scale-105">
        <Upload size={27} />
      </div>

      <h3 className="font-semibold text-[#153F2C]">{title}</h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-[#788A7D]">
        {description}
      </p>

      <span className="mt-5 rounded-lg bg-[#247A50] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#195F3C]">
        Choose Image
      </span>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </div>
  );
}

function ImagePreview({ preview, file, onRemove, alt }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#DCE8DE] bg-white">
      <div className="flex min-h-48 items-center justify-center bg-[#F7FAF7] p-4">
        <img
          src={preview}
          alt={alt}
          className="max-h-64 w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#E6EDE6] px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#183F2D]">
            {file?.name}
          </p>
          <p className="mt-1 text-xs text-[#829187]">
            Image uploaded successfully
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove uploaded image"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCEDEA] text-[#A34F40] transition hover:bg-[#F5DCD5]"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------
// CAMERA BARCODE SCAN
// --------------------------------------------------

function CameraTab({ onResult }) {
  const [scanning, setScanning] = useState(false);
  const [permDenied, setPermDenied] = useState(false);

  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const scannedRef = useRef(false);
  const mountedRef = useRef(false);

  const stopScan = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (error) {
        console.error('[Camera Stop Error]', error);
      }

      controlsRef.current = null;
    }

    setScanning(false);
  }, []);

  const startScan = useCallback(async () => {
    if (scanning || controlsRef.current) return;

    setScanning(true);
    setPermDenied(false);
    scannedRef.current = false;

    try {
      const reader = new BrowserMultiFormatReader();

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result && !scannedRef.current) {
            scannedRef.current = true;

            controlsRef.current?.stop();
            controlsRef.current = null;

            if (mountedRef.current) {
              setScanning(false);
              onResult(result.getText());
            }
          }
        }
      );

      if (!mountedRef.current) {
        controls.stop();
        return;
      }

      controlsRef.current = controls;
    } catch (error) {
      if (!mountedRef.current) return;

      setScanning(false);

      if (
        error?.name === 'NotAllowedError' ||
        error?.name === 'PermissionDeniedError'
      ) {
        setPermDenied(true);
      } else {
        toast.error('Could not access camera. Please check permissions.');
        console.error('[Camera Error]', error);
      }
    }
  }, [onResult, scanning]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-[#245A3E] bg-[#153F2D]">
        <video
          ref={videoRef}
          className="w-full"
          style={{
            display: scanning ? 'block' : 'none',
            maxHeight: '340px',
            objectFit: 'cover',
          }}
          muted
          playsInline
        />

        {!scanning && (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#C7E3CE]">
              <Camera size={30} />
            </div>

            <div>
              <p className="font-medium text-white">Camera Preview</p>
              <p className="mt-2 text-xs text-white/60">
                Your camera will appear here when activated.
              </p>
            </div>
          </div>
        )}

        {scanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-32 w-[75%] rounded-xl border-2 border-[#C4E4CC]">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-[#C4E4CC] shadow-[0_0_10px_#C4E4CC]" />
            </div>
          </div>
        )}
      </div>

      {permDenied && (
        <div className="flex items-start gap-3 rounded-xl bg-[#FCEDEA] p-4 text-sm text-[#A34F40]">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          Please allow camera access in your browser settings and try again.
        </div>
      )}

      {!scanning ? (
        <Button onClick={startScan} fullWidth>
          <Camera size={18} />
          Start Scanning
        </Button>
      ) : (
        <Button variant="danger" onClick={stopScan} fullWidth>
          <X size={18} />
          Stop Scanning
        </Button>
      )}

      {USE_MOCK && (
        <Button
          variant="ghost"
          onClick={() => onResult('8901030860140')}
        >
          Test Mock Scan
        </Button>
      )}

      <p className="text-center text-xs leading-5 text-[#829187]">
        Hold your camera steady and point it towards the barcode on the
        product packaging.
      </p>
    </div>
  );
}

// --------------------------------------------------
// MANUAL BARCODE ENTRY
// --------------------------------------------------


function ManualTab({ onResult }) {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const value = barcode.trim();

    if (!/^\d{8,14}$/.test(value)) {
      setError('Enter a valid 8–14 digit barcode.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Pass the barcode string to the parent.
      // The parent handles the API request and navigation.
      await onResult(value);
    } catch (err) {
      toast.error(err.message || 'Product not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6 flex items-center gap-4 rounded-2xl bg-[#EFF5EF] p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#247A50]">
          <Hash size={22} />
        </div>

        <div>
          <p className="font-semibold text-[#153F2D]">
            Enter Product Barcode
          </p>
          <p className="mt-1 text-xs text-[#829187]">
            Usually printed below the barcode lines.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="manual-barcode-input"
          name="barcode"
          label="Barcode Number"
          type="tel"
          inputMode="numeric"
          placeholder="e.g. 8901030860140"
          value={barcode}
          onChange={(event) => {
            setBarcode(
              event.target.value.replace(/\D/g, '').slice(0, 14)
            );
            setError('');
          }}
          error={error}
          hint="Enter an 8 to 14 digit product barcode."
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          <ScanLine size={18} />
          Search Product
        </Button>
      </form>
    </div>
  );
}


// --------------------------------------------------
// BARCODE IMAGE UPLOAD
// --------------------------------------------------

function BarcodeImageTab({ onResult }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [detectedBarcode, setDetectedBarcode] = useState('');
  const [detectedFormat, setDetectedFormat] = useState('');

  const fileRef = useRef(null);
  const objectUrlRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const url = URL.createObjectURL(selectedFile);

    objectUrlRef.current = url;
    setFile(selectedFile);
    setPreview(url);
    setStatus('');
    setDetectedBarcode('');
    setDetectedFormat('');
  };

  const removeFile = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setFile(null);
    setPreview(null);
    setStatus('');
    setDetectedBarcode('');
    setDetectedFormat('');

    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const handleScan = async () => {
    if (!file) {
      toast.error('Please upload a barcode image first.');
      return;
    }

    setLoading(true);
    setStatus('scanning');

    try {
      const img = await new Promise((resolve, reject) => {
        const element = new Image();

        element.onload = () => resolve(element);
        element.onerror = () => reject(
          new Error('Could not load uploaded image.')
        );

        element.src = objectUrlRef.current;
      });

      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageElement(img);

      setDetectedBarcode(result.getText());
      setDetectedFormat(result.getBarcodeFormat().toString());
      setStatus('confirmed');
    } catch (error) {
      console.error('[Barcode Image Error]', error);

      setStatus('notfound');

      if (
        !(error instanceof NotFoundException) &&
        error?.name !== 'NotFoundException'
      ) {
        toast.error('Could not read barcode from image.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!detectedBarcode) return;

    setLoading(true);
    setStatus('fetching');

    try {
      const result = await scanService.scanBarcode(detectedBarcode);
      onResult(result);
    } catch (error) {
      setStatus('confirmed');
      toast.error(error.message || 'Product not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      {!preview ? (
        <UploadArea
          title="Upload Barcode Image"
          description="Choose a clear photo showing the complete barcode."
          fileRef={fileRef}
          onFile={handleFile}
        />
      ) : (
        <ImagePreview
          preview={preview}
          file={file}
          onRemove={removeFile}
          alt="Uploaded barcode"
        />
      )}

      {status === 'scanning' && (
        <LoadingMessage>Detecting barcode from your image...</LoadingMessage>
      )}

      {status === 'confirmed' && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#C8DDCE] bg-[#EFF6F0] p-5">
          <div className="flex items-center gap-2 text-[#247A50]">
            <CheckCircle size={19} />
            <strong className="text-sm">Barcode detected</strong>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-[#829187]">Barcode format</p>
            <p className="mt-1 text-sm font-medium text-[#315A40]">
              {detectedFormat}
            </p>

            <p className="mt-4 text-xs text-[#829187]">Detected number</p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-[#153F2D]">
              {detectedBarcode}
            </p>
          </div>

          <Button
            fullWidth
            loading={loading}
            onClick={handleConfirm}
          >
            <ScanLine size={18} />
            Search Product
          </Button>
        </div>
      )}

      {status === 'fetching' && (
        <LoadingMessage>Looking up product details...</LoadingMessage>
      )}

      {status === 'notfound' && (
        <div className="flex items-start gap-3 rounded-xl bg-[#FCEDEA] p-4 text-sm text-[#A34F40]">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          No barcode detected. Upload a clearer image showing the full barcode.
        </div>
      )}

      {file && status !== 'confirmed' && status !== 'fetching' && (
        <Button
          fullWidth
          onClick={handleScan}
          loading={loading}
          disabled={loading}
        >
          <ScanLine size={18} />
          Detect Barcode
        </Button>
      )}

      <p className="text-center text-xs text-[#829187]">
        Supported image formats: JPG, PNG and WEBP.
      </p>
    </div>
  );
}

// --------------------------------------------------
// INGREDIENTS IMAGE UPLOAD / OCR
// --------------------------------------------------

function IngredientImageTab({ onResult }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null);
  const objectUrlRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const url = URL.createObjectURL(selectedFile);

    objectUrlRef.current = url;
    setFile(selectedFile);
    setPreview(url);
  };

  const removeFile = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setFile(null);
    setPreview(null);

    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload an ingredients image first.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await scanService.scanIngredients(formData);

      toast.success('Ingredients analyzed successfully!');
      onResult(result);
    } catch (error) {
      console.error('[Ingredients OCR Error]', error);
      toast.error(error.message || 'Could not analyze ingredients image.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      {!preview ? (
        <UploadArea
          title="Upload Ingredients Label"
          description="Choose a clear photo of the complete ingredients list."
          fileRef={fileRef}
          onFile={handleFile}
        />
      ) : (
        <ImagePreview
          preview={preview}
          file={file}
          onRemove={removeFile}
          alt="Uploaded ingredients label"
        />
      )}

      {file && (
        <Button
          fullWidth
          onClick={handleAnalyze}
          loading={loading}
          disabled={loading}
        >
          <Sparkles size={18} />
          Analyze Ingredients
        </Button>
      )}

      {loading && (
        <LoadingMessage>
          Extracting ingredients and analyzing with AI...
        </LoadingMessage>
      )}

      <div className="flex items-start gap-3 rounded-xl bg-[#EFF5EF] p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#247A50]" />
        <p className="text-xs leading-5 text-[#718477]">
          For accurate results, upload a clear, readable photo of the complete
          ingredients label. Your personalized analysis uses your saved
          dietary and health profile.
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// MAIN SCAN PAGE
// --------------------------------------------------

export default function Scan() {
  const [activeTab, setActiveTab] = useState('camera');
  const [scanning, setScanning] = useState(false);

  const navigate = useNavigate();

  const handleBarcodeResult = useCallback(
    async (barcode) => {
      setScanning(true);

      try {
        const result = await scanService.scanBarcode(barcode);

        if (!result?._id) {
          toast.error('Scan completed, but scan ID was not returned.');
          console.error('Invalid scan result:', result);
          return;
        }

        toast.success('Product found!');

        navigate(`/result/${result._id}`, {
          state: { result },
        });
      } catch (error) {
        toast.error(error.message || 'Product not found.');
      } finally {
        setScanning(false);
      }
    },
    [navigate]
  );

  const handleResultReady = useCallback(
    (result) => {
      if (!result?._id) {
        toast.error('Scan completed, but scan ID was not returned.');
        console.error('Invalid scan result:', result);
        return;
      }

      navigate(`/result/${result._id}`, {
        state: { result },
      });
    },
    [navigate]
  );

  return (
    <div className="mx-auto max-w-4xl animate-fade-in pb-10">
      {/* Page header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-px w-6" style={{ background: 'var(--ls-green)' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--ls-green)' }}>Food intelligence</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>Scan a Product</h1>
        <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: 'var(--ls-muted)' }}>
          Discover what goes into your food. Choose a scanning method to get personalized insights based on your profile.
        </p>
      </div>

      {/* Tab selector */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:gap-2">
        {SCAN_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = activeTab === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveTab(option.id)}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 border sm:flex-1"
              style={{
                background: isActive ? 'var(--ls-green)' : 'var(--ls-surface)',
                color: isActive ? '#FFFFFF' : 'var(--ls-muted)',
                borderColor: isActive ? 'var(--ls-green)' : 'var(--ls-border)',
                boxShadow: isActive ? '0 2px 8px rgba(34,113,74,0.20)' : 'none',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="hidden xs:inline sm:inline">{option.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content card */}
      {scanning && (
        <div className="mb-4 flex items-center justify-center gap-3 rounded-xl px-4 py-4 text-sm border"
          style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)', borderColor: 'var(--ls-border)' }}>
          <Loader2 size={19} className="animate-spin shrink-0" />
          Looking up product details…
        </div>
      )}

      <div className="rounded-2xl border p-6 sm:p-8 min-h-[380px] flex items-start justify-center"
        style={{ background: 'var(--ls-surface)', borderColor: 'var(--ls-border)', boxShadow: 'var(--shadow-card)' }}>
        <div className="w-full">
          {activeTab === 'camera' && <CameraTab onResult={handleBarcodeResult} />}
          {activeTab === 'manual' && <ManualTab onResult={handleBarcodeResult} />}
          {activeTab === 'barcode-image' && <BarcodeImageTab onResult={handleResultReady} />}
          {activeTab === 'ingredient-image' && <IngredientImageTab onResult={handleResultReady} />}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border p-4"
        style={{ background: 'var(--ls-green-soft)', borderColor: 'var(--ls-border)' }}>
        <ShieldCheck size={17} className="mt-0.5 shrink-0" style={{ color: 'var(--ls-green)' }} />
        <p className="text-xs leading-5" style={{ color: 'var(--ls-muted)' }}>
          Results are for informational purposes only. FoodLens uses AI-powered analysis based on your saved profile. It does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}
