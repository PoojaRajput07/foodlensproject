
function CameraTab({ onResult }) {
  const [scanning, setScanning] = useState(false);
  const [permDenied, setPermDenied] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

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
    if (scanning || lookupLoading || controlsRef.current) return;

    if (!videoRef.current) {
      toast.error('Camera preview is not ready.');
      return;
    }

    setScanning(true);
    setPermDenied(false);
    scannedRef.current = false;

    try {
      const reader = new BrowserMultiFormatReader();

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result) => {
          if (!result || scannedRef.current) return;

          const barcode = result.getText()?.trim();

          if (!barcode) return;

          scannedRef.current = true;

          controlsRef.current?.stop();
          controlsRef.current = null;

          if (!mountedRef.current) return;

          setScanning(false);
          setLookupLoading(true);

          try {
            await onResult(barcode);
          } catch (error) {
            console.error('[Product Lookup Error]', error);
            toast.error(
              error?.message ||
              'Could not retrieve product details. Please try again.'
            );
          } finally {
            if (mountedRef.current) {
              setLookupLoading(false);
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
  }, [onResult, scanning, lookupLoading]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch (error) {
          console.error('[Camera Cleanup Error]', error);
        }

        controlsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <div
        className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border"
        style={{
          borderColor: 'var(--ls-border)',
          background: 'var(--ls-raised)',
        }}
      >
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
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: 'var(--ls-green-light)',
                color: 'var(--ls-green)',
              }}
            >
              {lookupLoading ? (
                <Loader2 size={30} className="animate-spin" />
              ) : (
                <Camera size={30} />
              )}
            </div>

            <div>
              <p
                className="font-medium"
                style={{ color: 'var(--ls-heading)' }}
              >
                {lookupLoading
                  ? 'Barcode Detected!'
                  : 'Camera Preview'}
              </p>

              <p
                className="mt-2 text-xs"
                style={{ color: 'var(--ls-muted)' }}
              >
                {lookupLoading
                  ? 'Your barcode has been detected successfully.'
                  : 'Your camera will appear here when activated.'}
              </p>
            </div>
          </div>
        )}

        {scanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-32 w-[75%] rounded-xl border-2 border-white">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white" />
            </div>
          </div>
        )}
      </div>

      {lookupLoading && (
        <LoadingMessage>
          Barcode detected! Fetching product details. Please wait...
        </LoadingMessage>
      )}

      {permDenied && (
        <div
          className="flex items-start gap-3 rounded-xl p-4 text-sm"
          style={{
            background: 'var(--ls-red-light)',
            color: 'var(--ls-red)',
          }}
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          Please allow camera access in your browser settings and try again.
        </div>
      )}

      {lookupLoading ? (
        <Button fullWidth disabled>
          <Loader2 size={18} className="animate-spin" />
          Fetching Product...
        </Button>
      ) : scanning ? (
        <Button variant="danger" onClick={stopScan} fullWidth>
          <X size={18} />
          Stop Scanning
        </Button>
      ) : (
        <Button onClick={startScan} fullWidth>
          <Camera size={18} />
          Scan Again
        </Button>
      )}

      {USE_MOCK && !lookupLoading && (
        <Button
          variant="ghost"
          onClick={() => onResult('8901030860140')}
        >
          Test Mock Scan
        </Button>
      )}

      <p
        className="text-center text-xs leading-5"
        style={{ color: 'var(--ls-muted)' }}
      >
        Hold your camera steady and point it towards the barcode on the
        product packaging.
      </p>
    </div>
  );
}
