// src/pages/Scan.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Hash, ImageUp, X, ScanLine,
  Upload, AlertCircle, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scanService } from '../services/scanService.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { USE_MOCK } from '../services/api.js';

const TABS = [
  { id: 'camera', icon: Camera, label: 'Camera Scan' },
  { id: 'manual', icon: Hash, label: 'Manual Entry' },
  { id: 'image', icon: ImageUp, label: 'Upload Image' },
];

// ── Camera / Live scan tab ──────────────────────────────────────
function CameraTab({ onResult }) {
  const [scanning, setScanning] = useState(false);
  const [permDenied, setPermDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const startScan = useCallback(async () => {
    if (!window.Html5Qrcode) {
      toast.error('Scanner library not loaded. Please refresh.');
      return;
    }
    setScanning(true);
    setPermDenied(false);
    try {
      const scanner = new window.Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 180 } },
        (decodedText) => {
          stopScan();
          onResult(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      if (err?.toString?.().toLowerCase().includes('permission')) {
        setPermDenied(true);
      } else {
        toast.error('Could not access camera. Please use manual entry.');
      }
    }
  }, [onResult]);

  const stopScan = useCallback(async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => () => { stopScan(); }, [stopScan]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Scanner viewport */}
      <div
        id="qr-reader"
        ref={scannerRef}
        className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{
          minHeight: scanning ? undefined : '220px',
          background: 'var(--ls-bg)',
          border: `2px ${scanning ? 'solid var(--ls-green)' : 'dashed var(--ls-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!scanning && (
          <div className="flex flex-col items-center gap-3 p-8 text-center" style={{ color: 'var(--ls-muted)' }}>
            <Camera size={40} />
            <p className="text-sm">Camera preview will appear here</p>
          </div>
        )}
      </div>

      {permDenied && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl w-full max-w-sm"
          style={{ background: 'var(--ls-red-light)', color: 'var(--ls-red)' }}
        >
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            Camera permission denied. Please allow camera access in your browser settings, or use manual entry.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {!scanning ? (
          <Button onClick={startScan} loading={loading} id="start-scan-btn">
            <Camera size={18} /> Start Scanning
          </Button>
        ) : (
          <Button variant="danger" onClick={stopScan} id="stop-scan-btn">
            <X size={18} /> Stop
          </Button>
        )}
      </div>

      {/* Mock test button */}
      {USE_MOCK && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg w-full max-w-sm text-sm"
          style={{ background: 'var(--ls-amber-light)', color: 'var(--ls-amber)' }}
        >
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Mock mode active.</strong> Click &quot;Test Mock Scan&quot; to simulate a barcode scan result.
            <button
              className="ml-2 underline font-medium"
              onClick={() => onResult('8901030860140')}
              id="mock-scan-test-btn"
              type="button"
            >
              Test Mock Scan
            </button>
          </span>
        </div>
      )}

      <p className="text-xs text-center max-w-xs" style={{ color: 'var(--ls-muted)' }}>
        Point your camera at the barcode on the product packaging. Keep steady for best results.
      </p>
    </div>
  );
}

// ── Manual entry tab ─────────────────────────────────────────────
function ManualTab({ onResult }) {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) { setError('Please enter a barcode number'); return; }
    if (!/^\d{8,14}$/.test(barcode.trim())) { setError('Enter a valid 8–14 digit barcode'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await scanService.scanBarcode(barcode.trim());
      onResult(result._id, result);
    } catch (err) {
      toast.error(err.message || 'Product not found. Try another barcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="manual-barcode-input"
          label="Barcode number"
          icon={Hash}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="e.g. 8901030860140"
          value={barcode}
          onChange={(e) => { setBarcode(e.target.value.replace(/\D/g, '')); setError(''); }}
          error={error}
          autoFocus
          hint="8 to 14 digit product barcode (EAN-8, EAN-13, UPC)"
        />
        <Button type="submit" fullWidth loading={loading} id="manual-search-btn">
          <ScanLine size={18} /> Search Product
        </Button>
      </form>
    </div>
  );
}

// ── Image upload tab ─────────────────────────────────────────────
function ImageTab({ onResult }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please upload an ingredient image first'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const result = await scanService.scanIngredients(fd);
      onResult(result._id, result);
    } catch (err) {
      toast.error(err.message || 'OCR processing failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div className="max-w-sm mx-auto w-full flex flex-col gap-5">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="rounded-xl cursor-pointer flex flex-col items-center gap-4 p-10 transition-colors hover:border-[var(--ls-green)]"
          style={{ border: '2px dashed var(--ls-border)', background: 'var(--ls-bg)' }}
          role="button"
          tabIndex={0}
          id="image-drop-zone"
          onKeyDown={(e) => { if (e.key === 'Enter') fileRef.current?.click(); }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
          >
            <Upload size={24} />
          </div>
          <div className="text-center">
            <p className="font-medium mb-1" style={{ color: 'var(--ls-text)' }}>
              Drop ingredient image here
            </p>
            <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
              or click to browse · JPG, PNG, WEBP
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="image-file-input"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid var(--ls-border)' }}>
          <img src={preview} alt="Ingredient label preview" className="w-full max-h-56 object-cover" />
          <button
            onClick={removeFile}
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
            aria-label="Remove image"
            id="remove-image-btn"
          >
            <X size={14} />
          </button>
          <div className="p-3">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--ls-text)' }}>{file?.name}</p>
            <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
            </p>
          </div>
        </div>
      )}

      {USE_MOCK && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg text-sm"
          style={{ background: 'var(--ls-amber-light)', color: 'var(--ls-amber)' }}
        >
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <span><strong>Mock mode:</strong> OCR endpoint is simulated. Upload any image to test the flow.</span>
        </div>
      )}

      <Button
        fullWidth
        onClick={handleSubmit}
        loading={loading}
        disabled={!file}
        id="analyse-image-btn"
      >
        <ImageUp size={18} /> Analyse Ingredient Image
      </Button>

      <p className="text-xs text-center" style={{ color: 'var(--ls-muted)' }}>
        Upload a clear photo of the ingredient list on the product packaging.
      </p>
    </div>
  );
}

// ── Main Scan page ────────────────────────────────────────────────
export default function Scan() {
  const [activeTab, setActiveTab] = useState('camera');
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  // Load html5-qrcode script dynamically
  useEffect(() => {
    if (window.Html5Qrcode) return;
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  const handleBarcodeResult = useCallback(async (barcode) => {
    setScanning(true);
    try {
      const result = await scanService.scanBarcode(barcode);
      toast.success('Product found!');
      navigate(`/result/${result._id}`, { state: { result } });
    } catch (err) {
      toast.error(err.message || 'Product not found in database.');
    } finally {
      setScanning(false);
    }
  }, [navigate]);

  const handleResultReady = useCallback((id, result) => {
    navigate(`/result/${id}`, { state: { result } });
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>Scan a Product</h1>
        <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
          Choose how you want to scan — camera, barcode entry, or ingredient image.
        </p>
      </div>

      {/* Tab switcher */}
      <div
        className="flex rounded-xl mb-6 p-1"
        style={{ background: 'var(--ls-surface)', border: '1px solid var(--ls-border)' }}
      >
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            id={`scan-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? 'text-white ls-brand-gradient' : ''
            }`}
            style={activeTab !== id ? { color: 'var(--ls-muted)' } : {}}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        className="ls-surface p-6"
        style={{ boxShadow: 'var(--shadow-card)', minHeight: '340px' }}
      >
        {scanning && (
          <div className="flex flex-col items-center gap-3 py-10" style={{ color: 'var(--ls-green)' }}>
            <div className="animate-spin w-10 h-10 border-4 border-current border-t-transparent rounded-full" />
            <p className="text-sm font-medium" style={{ color: 'var(--ls-muted)' }}>
              Looking up product…
            </p>
          </div>
        )}

        {!scanning && activeTab === 'camera' && (
          <CameraTab onResult={handleBarcodeResult} />
        )}
        {!scanning && activeTab === 'manual' && (
          <ManualTab onResult={handleResultReady} />
        )}
        {!scanning && activeTab === 'image' && (
          <ImageTab onResult={handleResultReady} />
        )}
      </div>
    </div>
  );
}
