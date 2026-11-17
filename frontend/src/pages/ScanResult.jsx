import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Flag,
  XCircle, AlertTriangle, CheckCircle, HelpCircle,
  ExternalLink, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scanService } from '../services/scanService.js';
import { VerdictBadge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';

const VERDICT_CONFIG = {
  avoid: {
    icon: XCircle,
    color: 'var(--ls-red)',
    bg: 'var(--ls-red-light)',
    label: 'Avoid',
    banner: 'This product contains ingredients that conflict with your health profile.',
  },
  caution: {
    icon: AlertTriangle,
    color: 'var(--ls-amber)',
    bg: 'var(--ls-amber-light)',
    label: 'Caution',
    banner: 'Some ingredients may require attention based on your health profile.',
  },
  ok: {
    icon: CheckCircle,
    color: 'var(--ls-green)',
    bg: 'var(--ls-green-light)',
    label: 'OK',
    banner: 'No concerning ingredients found for your health profile.',
  },
  unverified: {
    icon: HelpCircle,
    color: 'var(--ls-neutral)',
    bg: 'var(--ls-neutral-light)',
    label: 'Unverified',
    banner: 'Some ingredients could not be verified against FSSAI data.',
  },
};

function NutritionBar({ label, value, threshold, unit }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: 'var(--ls-text)' }}>{label}</span>
        <span className="font-medium" style={{ color: 'var(--ls-text)' }}>
          {value}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ls-border)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (parseFloat(value) / threshold) * 100)}%`,
            background: parseFloat(value) > threshold * 0.8 ? 'var(--ls-red)' :
              parseFloat(value) > threshold * 0.5 ? 'var(--ls-amber)' : 'var(--ls-green)',
          }}
        />
      </div>
    </div>
  );
}

export default function ScanResult() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(state?.result || null);
  const [loading, setLoading] = useState(!state?.result);
  const [saved, setSaved] = useState(state?.result?.isSaved || false);
  const [saving, setSaving] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (result) return;
    scanService
      .getScanById(id)
      .then(setResult)
      .catch(() => toast.error('Could not load scan result.'))
      .finally(() => setLoading(false));
  }, [id, result]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await scanService.saveScan(id, !saved);
      setSaved((v) => !v);
      toast.success(saved ? 'Removed from saved items.' : 'Scan saved to your history!');
    } catch {
      toast.error('Could not save scan.');
    } finally {
      setSaving(false);
    }
  };

  const handleReport = async () => {
    if (reporting) return;
    setReporting(true);
    try {
      await scanService.reportScan(id, 'incorrect_verdict', '');
      toast.success('Report submitted — thank you!');
    } catch {
      toast.error('Could not submit report. Please try again.');
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <InlineLoader message="Loading result…" />;

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <HelpCircle size={48} style={{ color: 'var(--ls-muted)', margin: '0 auto 16px' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ls-text)' }}>Result not found</h2>
        <p className="mb-6" style={{ color: 'var(--ls-muted)' }}>This scan result may have expired or been removed.</p>
        <Button onClick={() => navigate('/scan')}>Scan Again</Button>
      </div>
    );
  }

  const vc = VERDICT_CONFIG[result.verdict?.toLowerCase()] || VERDICT_CONFIG.unverified;
  const VIcon = vc.icon;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-5 hover:underline"
        style={{ color: 'var(--ls-muted)' }}
        id="result-back-btn"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Verdict banner */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: vc.bg, border: `1px solid ${vc.color}30` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <VIcon size={28} style={{ color: vc.color }} />
              <VerdictBadge verdict={result.verdict} />
            </div>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>
              {result.productName}
            </h1>
            <p style={{ color: 'var(--ls-muted)' }} className="text-sm">
              {result.brand}{result.quantity ? ` · ${result.quantity}` : ''}
            </p>
            <p className="text-sm mt-2" style={{ color: vc.color }}>{vc.banner}</p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              loading={saving}
              id="save-result-btn"
              className={saved ? 'opacity-70' : ''}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Conflicting ingredients */}
      {result.conflictingIngredients?.length > 0 && (
        <section className="ls-surface mb-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--ls-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--ls-text)' }}>Flagged Ingredients</h2>
          </div>
          <ul className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
            {result.conflictingIngredients.map((item, i) => {
              const cfg = VERDICT_CONFIG[item.verdict?.toLowerCase()] || VERDICT_CONFIG.unverified;
              const IIcon = cfg.icon;
              return (
                <li key={i} className="px-5 py-4 flex items-start gap-4">
                  <IIcon size={18} style={{ color: cfg.color, flexShrink: 0, marginTop: 2 }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm" style={{ color: 'var(--ls-text)' }}>
                        {item.name}
                      </span>
                      <VerdictBadge verdict={item.verdict} showIcon={false} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>{item.reason}</p>
                    {item.source && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--ls-green)' }}>
                        <ExternalLink size={11} /> {item.source}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Nutrition */}
      {result.nutrition && (
        <section className="ls-surface mb-5 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--ls-text)' }}>Nutritional Information</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--ls-muted)' }}>Per serving: {result.nutrition.servingSize}</p>
          <div className="flex flex-col gap-3">
            {result.nutrition.sugar && (
              <NutritionBar label="Sugar" value={result.nutrition.sugar.replace('g','')} threshold={12} unit="g" />
            )}
            {result.nutrition.sodium && (
              <NutritionBar label="Sodium" value={result.nutrition.sodium.replace('mg','')} threshold={600} unit="mg" />
            )}
            {result.nutrition.fat && (
              <NutritionBar label="Total Fat" value={result.nutrition.fat.replace('g','')} threshold={20} unit="g" />
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Energy', value: result.nutrition.energy },
              { label: 'Protein', value: result.nutrition.protein },
              { label: 'Carbs', value: result.nutrition.carbohydrates },
            ].map(({ label, value }) => value && (
              <div
                key={label}
                className="rounded-lg p-3 text-center"
                style={{ background: 'var(--ls-bg)' }}
              >
                <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>{label}</p>
                <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--ls-text)' }}>{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ingredients list */}
      {result.ingredients?.length > 0 && (
        <section className="ls-surface mb-5 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--ls-text)' }}>All Ingredients</h2>
          <div className="flex flex-wrap gap-2">
            {result.ingredients.map((ing) => {
              const conflict = result.conflictingIngredients?.find(
                (c) => c.name.toLowerCase() === ing.toLowerCase()
              );
              return (
                <span
                  key={ing}
                  className="px-3 py-1 rounded-full text-sm"
                  style={
                    conflict?.verdict === 'avoid'
                      ? { background: 'var(--ls-red-light)', color: 'var(--ls-red)' }
                      : conflict?.verdict === 'caution'
                      ? { background: 'var(--ls-amber-light)', color: 'var(--ls-amber)' }
                      : { background: 'var(--ls-bg)', color: 'var(--ls-text)', border: '1px solid var(--ls-border)' }
                  }
                >
                  {ing}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReport}
          loading={reporting}
          id="report-result-btn"
        >
          <Flag size={16} /> Report Incorrect Result
        </Button>
        <Link to="/library" className="ls-btn ls-btn-secondary text-sm px-4 py-2">
          Browse Ingredient Library
        </Link>
      </div>

      {/* Disclaimer */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl text-xs"
        style={{ background: 'var(--ls-bg)', border: '1px solid var(--ls-border)', color: 'var(--ls-muted)' }}
      >
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <p>{result.disclaimer || 'Label Sach provides ingredient analysis based on FSSAI data and published health guidelines. This is not medical advice. Always consult a healthcare professional for dietary decisions.'}</p>
      </div>
    </div>
  );
}
