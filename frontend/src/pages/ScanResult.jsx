
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Droplets,
  Flame,
  HeartPulse,
  Info,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wheat,
  Beef,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { scanService } from '../services/scanService.js';
import { Button } from '../components/common/Button.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';

const STATUS_CONFIG = {
  AVOID: {
    label: 'Avoid',
    icon: XCircle,
    color: '#B94B45',
    bg: '#FCEFED',
    border: '#F1D2CE',
    description: 'This product conflicts with your saved profile.',
  },

  CAUTION: {
    label: 'Caution',
    icon: AlertTriangle,
    color: '#A87522',
    bg: '#FBF4E6',
    border: '#EEDDB9',
    description: 'Some concerns need your attention before consuming.',
  },

  OK: {
    label: 'Compatible',
    icon: CheckCircle2,
    color: '#247A50',
    bg: '#EAF4EC',
    border: '#CDE2D1',
    description: 'This product appears compatible with your saved profile.',
  },

  UNVERIFIED: {
    label: 'Unverified',
    icon: CircleHelp,
    color: '#687B70',
    bg: '#F0F3F0',
    border: '#DCE5DE',
    description: 'There is insufficient information to verify compatibility.',
  },
};

const CONCERN_CONFIG = {
  none: {
    label: 'No identified concern',
    color: '#247A50',
    bg: '#EAF4EC',
  },
  possible: {
    label: 'Possible concern',
    color: '#A87522',
    bg: '#FBF4E6',
  },
  confirmed: {
    label: 'Confirmed concern',
    color: '#B94B45',
    bg: '#FCEFED',
  },
  unknown: {
    label: 'Information unavailable',
    color: '#687B70',
    bg: '#F0F3F0',
  },
};

const cx = (...classes) => classes.filter(Boolean).join(' ');

function getStatus(status) {
  const normalized = String(status || 'UNVERIFIED')
    .trim()
    .toUpperCase();

  if (normalized === 'COMPATIBLE') {
    return STATUS_CONFIG.OK;
  }

  return STATUS_CONFIG[normalized] || STATUS_CONFIG.UNVERIFIED;
}

function formatTag(value) {
  return String(value ?? '')
    .replace(/^en:/, '')
    .replace(/[-_]/g, ' ');
}

function SectionHeading({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3EB] text-[#247A50]">
          <Icon size={19} />
        </div>
      )}

      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6C9477]">
            {eyebrow}
          </p>
        )}

        <h2 className="text-lg font-semibold tracking-tight text-[#153F2D]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#829187]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const config = getStatus(status);
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

/* Large highlighted verdict section */
function VerdictBanner({ status }) {
  const config = getStatus(status);
  const Icon = config.icon;
  const normalizedStatus = String(status || '').toUpperCase();

  const isAvoid = normalizedStatus === 'AVOID';
  const isCaution = normalizedStatus === 'CAUTION';
  const isUnverified = normalizedStatus === 'UNVERIFIED';

  const badgeText = isAvoid
    ? 'Profile conflict found'
    : isCaution
      ? 'Review before consuming'
      : isUnverified
        ? 'Assessment incomplete'
        : 'Profile check complete';

  const BadgeIcon = isAvoid
    ? ShieldAlert
    : isCaution
      ? AlertTriangle
      : isUnverified
        ? CircleHelp
        : ShieldCheck;

  return (
    <div
      className="relative overflow-hidden border-b px-5 py-7 sm:px-8 sm:py-9"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="absolute -right-8 -top-12 h-48 w-48 rounded-full opacity-[0.07]"
        style={{ backgroundColor: config.color }}
      />

      <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full opacity-[0.05]"
        style={{ backgroundColor: config.color }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4 sm:gap-6">

          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-2 bg-white shadow-sm sm:h-24 sm:w-24"
            style={{
              color: config.color,
              borderColor: config.border,
            }}
          >
            <Icon size={42} strokeWidth={2} />
          </div>

          <div className="min-w-0">

            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: config.color }}
            >
              Your personalized verdict
            </p>

            <h2
              className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: config.color }}
            >
              {config.label}
            </h2>

            <p
              className="mt-2 max-w-xl text-sm leading-6 sm:text-base"
              style={{ color: config.color, opacity: 0.9 }}
            >
              {config.description}
            </p>

          </div>
        </div>

        <div
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-xs font-semibold shadow-sm"
          style={{
            color: config.color,
            borderColor: config.border,
          }}
        >
          <BadgeIcon size={16} />
          {badgeText}
        </div>

      </div>
    </div>
  );
}

function Panel({ children, className = '' }) {
  return (
    <section
      className={cx(
        'rounded-2xl border border-[#DFE9E0] bg-white p-5 shadow-[0_3px_16px_rgba(30,70,45,0.035)] sm:p-6',
        className
      )}
    >
      {children}
    </section>
  );
}

function InsightTile({
  label,
  value,
  unit,
  icon: Icon,
  emphasis = false,
}) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <div
      className={cx(
        'rounded-xl border p-4',
        emphasis
          ? 'border-[#EEDDB9] bg-[#FBF7EE]'
          : 'border-[#E1EAE2] bg-[#FAFCFA]'
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[#829187]">{label}</p>

        <Icon
          size={16}
          className={emphasis ? 'text-[#A87522]' : 'text-[#6C9B79]'}
        />
      </div>

      <p className="text-xl font-semibold tracking-tight text-[#153F2D]">
        {value}
        <span className="ml-1 text-xs font-medium text-[#829187]">
          {unit}
        </span>
      </p>
    </div>
  );
}

function AssessmentRow({ title, icon: Icon, assessment }) {
  if (!assessment) return null;

  const reasons = Array.isArray(assessment.reasons)
    ? assessment.reasons
    : [];

  const config = getStatus(assessment.status);

  return (
    <div className="rounded-xl border border-[#E1EAE2] bg-[#FAFCFA] p-4">

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF3EB] text-[#39845A]">
            <Icon size={17} />
          </div>

          <h3 className="text-sm font-semibold text-[#254B35]">
            {title}
          </h3>
        </div>

        <StatusPill status={assessment.status} />

      </div>

      <div className="mt-3 border-t border-[#E7EEE7] pt-3">

        {reasons.length ? (
          <ul className="space-y-2">
            {reasons.map((reason, index) => (
              <li
                key={`${title}-${index}`}
                className="flex items-start gap-2 text-sm leading-6 text-[#718477]"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                {reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#829187]">
            No specific concerns reported.
          </p>
        )}

      </div>
    </div>
  );
}

function IngredientRow({ item }) {
  const [expanded, setExpanded] = useState(false);

  const level = String(item.concernLevel || 'unknown').toLowerCase();

  const config = CONCERN_CONFIG[level] || CONCERN_CONFIG.unknown;

  const concerns = Array.isArray(item.profileConcerns)
    ? item.profileConcerns
    : [];

  return (
    <div className="overflow-hidden rounded-xl border border-[#DFE9E0] bg-white">

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-[#FAFCFA]"
      >
        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5EF] text-[#39845A]">
            <Leaf size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold capitalize text-[#254B35]">
              {item.commonName || item.ingredient || 'Ingredient'}
            </h3>

            <p className="mt-1 truncate text-xs text-[#829187]">
              {item.ingredient}
            </p>
          </div>

        </div>

        <div className="flex shrink-0 items-center gap-2">

          <span
            className="hidden rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex"
            style={{
              backgroundColor: config.bg,
              color: config.color,
            }}
          >
            {config.label}
          </span>

          <span className="text-[#829187]">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>

        </div>
      </button>

      <div className="px-4 pb-3 sm:hidden">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{
            backgroundColor: config.bg,
            color: config.color,
          }}
        >
          {config.label}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-[#E7EEE7] bg-[#FAFCFA] p-4">

          <p className="text-sm leading-6 text-[#718477]">
            {item.explanation || 'No additional explanation available.'}
          </p>

          {concerns.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#315A40]">
                Profile-related concerns
              </p>

              <div className="flex flex-wrap gap-2">
                {concerns.map((concern, index) => (
                  <span
                    key={`${concern}-${index}`}
                    className="rounded-lg border border-[#EEDDB9] bg-[#FBF4E6] px-3 py-1.5 text-xs text-[#9A6B24]"
                  >
                    {formatTag(concern)}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

function TagGroup({
  title,
  items,
  variant = 'green',
  emptyText,
}) {
  const styles = {
    green: 'border-[#D4E7D8] bg-[#EFF6F0] text-[#28764B]',
    red: 'border-[#F1D2CE] bg-[#FCEFED] text-[#A84E46]',
    neutral: 'border-[#E0E9E1] bg-[#F5F8F5] text-[#687B70]',
  };

  const list = Array.isArray(items) ? items : [];

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold capitalize text-[#315A40]">
        {title}
      </h3>

      {list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={cx(
                'rounded-lg border px-3 py-2 text-xs font-medium capitalize',
                styles[variant]
              )}
            >
              {formatTag(item)}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#829187]">{emptyText}</p>
      )}
    </div>
  );
}

export default function ScanResult() {
  const { id } = useParams();

  const { state } = useLocation();

  const navigate = useNavigate();

  const [result, setResult] = useState(state?.result || null);

  const [loading, setLoading] = useState(!state?.result);

  const [saved, setSaved] = useState(
    Boolean(state?.result?.isSaved)
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state?.result) {
      setResult(state.result);
      setSaved(Boolean(state.result.isSaved));
      setLoading(false);
      return undefined;
    }

    let active = true;

    setLoading(true);

    scanService
      .getScanById(id)
      .then((data) => {
        if (!active) return;

        setResult(data);
        setSaved(Boolean(data?.isSaved));
      })
      .catch(() => {
        if (active) toast.error('Could not load scan result.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, state?.result]);

  const scan = useMemo(
    () =>
      result?.scan ||
      result?.data?.scan ||
      result?.data ||
      result ||
      {},
    [result]
  );

  const product = scan.product || {};

  const ai = scan.aiAnalysis || {};

  const assessment = ai.personalizedAssessment || {};

  const productAnalysis =
    product.productAnalysis || scan.productAnalysis || {};

  const nutrition = scan.nutrition || {};

  const ingredientAnalysis = Array.isArray(ai.ingredientAnalysis)
    ? ai.ingredientAnalysis
    : [];

  const ingredients = Array.isArray(scan.ingredients)
    ? scan.ingredients
    : Array.isArray(product.ingredients)
      ? product.ingredients
      : typeof product.ingredientsText === 'string'
        ? product.ingredientsText
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

 
const verdict =
  scan.overallVerdict ||
  scan.verdict ||
  assessment.status ||
  ai.overallAssessment ||
  'UNVERIFIED';

const verdictConfig = getStatus(verdict);
const VerdictIcon = verdictConfig.icon;
  


  const productName =
    product.name || scan.productName || 'Unknown product';

  const brand = product.brand || scan.brand || '';

  const image = product.image || null;

  const scanId = scan.scanId || scan._id || id;

  const analyzedIngredients = new Set(
    ingredientAnalysis.map((item) =>
      String(item.ingredient || '').toLowerCase()
    )
  );

  const nutritionItems = [
    {
      label: 'Energy',
      value: nutrition.energyKcal100g,
      unit: 'kcal',
      icon: Flame,
    },
    {
      label: 'Total sugars',
      value: nutrition.sugars100g,
      unit: 'g',
      icon: Droplets,
      emphasis: true,
    },
    {
      label: 'Carbohydrates',
      value: nutrition.carbohydrates100g,
      unit: 'g',
      icon: Wheat,
    },
    {
      label: 'Total fat',
      value: nutrition.fat100g,
      unit: 'g',
      icon: Droplets,
    },
    {
      label: 'Saturated fat',
      value: nutrition.saturatedFat100g,
      unit: 'g',
      icon: Droplets,
      emphasis: true,
    },
    {
      label: 'Protein',
      value: nutrition.proteins100g,
      unit: 'g',
      icon: Beef,
    },
    {
      label: 'Salt',
      value: nutrition.salt100g,
      unit: 'g',
      icon: Droplets,
    },
    {
      label: 'Sodium',
      value: nutrition.sodium100g,
      unit: 'g',
      icon: Info,
    },
  ].filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      item.value !== ''
  );

  const handleSave = async () => {
    if (saving || !scanId) return;

    setSaving(true);

    try {
      await scanService.saveScan(scanId, !saved);

      setSaved((current) => !current);

      toast.success(
        saved
          ? 'Removed from saved items.'
          : 'Scan saved successfully!'
      );
    } catch {
      toast.error('Could not save scan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <InlineLoader message="Loading result..." />;
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[#DFE9E0] bg-white px-6 py-16 text-center shadow-sm">

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF5EF] text-[#39845A]">
          <CircleHelp size={32} />
        </div>

        <h2 className="text-xl font-semibold text-[#153F2D]">
          Result not found
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#829187]">
          This scan result may have expired or been removed.
        </p>

        <div className="mt-6">
          <Button onClick={() => navigate('/scan')}>
            Scan Again
          </Button>
        </div>

      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl animate-fade-in space-y-5 pb-10">

      {/* PAGE HEADER */}
      <header>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#718477] transition hover:text-[#247A50]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="flex flex-wrap items-end justify-between gap-3">

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#247A50]">
              Your food report
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-[#153F2D] sm:text-3xl">
              Product analysis
            </h1>

            <p className="mt-2 text-sm text-[#829187]">
              A clear breakdown of ingredients, nutrition and profile compatibility.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            loading={saving}
            className="border border-[#DCE8DE] bg-white text-[#315A40]"
          >
            {saved ? (
              <BookmarkCheck size={16} />
            ) : (
              <Bookmark size={16} />
            )}

            {saved ? 'Saved product' : 'Save product'}
          </Button>

        </div>
      </header>

      {/* PRODUCT CARD WITH LARGE VERDICT */}
      <Panel className="overflow-hidden !p-0">

        <VerdictBanner status={verdict} />

        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_300px]">

          {/* PRODUCT INFORMATION */}
          <div className="p-5 sm:p-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E5ECE5] bg-[#FAFCFA] p-2 sm:h-36 sm:w-36">

                {image ? (
                  <img
                    src={image}
                    alt={productName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Leaf
                    size={42}
                    className="text-[#6C9B79]"
                    strokeWidth={1.3}
                  />
                )}

              </div>

              <div className="min-w-0">

                {brand && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#718477]">
                    {brand}
                  </p>
                )}

                <h2 className="text-2xl font-semibold leading-tight text-[#153F2D] sm:text-3xl">
                  {productName}
                </h2>

                {scan.barcode && (
                  <p className="mt-2 text-xs text-[#829187]">
                    Barcode: {scan.barcode}
                  </p>
                )}

                <div className="mt-4 flex items-start gap-2">

                  <VerdictIcon
                    size={18}
                    className="mt-0.5 shrink-0"
                    style={{ color: verdictConfig.color }}
                  />

                  <p className="text-sm leading-6 text-[#52705C]">
                    {assessment.recommendation ||
                      verdictConfig.description}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* QUICK TAKEAWAY */}
          <aside className="flex flex-col justify-center border-t border-[#E7EEE7] bg-[#F7FAF7] p-5 sm:p-6 md:border-l md:border-t-0">

            <div className="mb-3 flex items-center gap-2 text-[#315A40]">
              <Sparkles size={17} />

              <h3 className="text-sm font-semibold">
                The quick takeaway
              </h3>
            </div>

            <p className="text-sm leading-6 text-[#607568]">
              {ai.summary ||
                'Review the ingredient and nutrition details below to understand this product.'}
            </p>

          </aside>

        </div>
      </Panel>

      {/* RECOMMENDATION */}
      {assessment.recommendation && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#D5E6D8] bg-[#EFF6F0] p-4 sm:p-5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#247A50]">
            <ShieldCheck size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#247A50]">
              Your recommendation
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#52705C]">
              {assessment.recommendation}
            </p>
          </div>

        </div>
      )}

      {/* PERSONAL PROFILE COMPATIBILITY */}
      {Object.keys(assessment).some((key) =>
        key.endsWith('Assessment')
      ) && (
        <Panel>

          <SectionHeading
            eyebrow="Your profile"
            title="Compatibility check"
            description="See how the product matches your saved allergies, health conditions and diet."
            icon={HeartPulse}
          />

          <div className="grid gap-3 md:grid-cols-3">

            <AssessmentRow
              title="Allergy compatibility"
              icon={ShieldAlert}
              assessment={assessment.allergyAssessment}
            />

            <AssessmentRow
              title="Health conditions"
              icon={HeartPulse}
              assessment={assessment.conditionAssessment}
            />

            <AssessmentRow
              title="Diet compatibility"
              icon={Leaf}
              assessment={assessment.dietAssessment}
            />

          </div>

        </Panel>
      )}

      {/* NUTRITION */}
      {nutritionItems.length > 0 && (
        <Panel>

          <SectionHeading
            eyebrow="Nutrition facts"
            title="What is inside?"
            description="Nutritional values per 100 g of product. Your actual intake depends on portion size."
            icon={HeartPulse}
          />

          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#829187]">

            <span className="rounded-full bg-[#FBF4E6] px-2.5 py-1 text-[#9A6B24]">
              Highlighted values deserve attention
            </span>

            <span>All values are per 100 g</span>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            {nutritionItems.map((item) => (
              <InsightTile key={item.label} {...item} />
            ))}

          </div>

        </Panel>
      )}

      {/* INGREDIENT ANALYSIS */}
      {ingredientAnalysis.length > 0 && (
        <Panel>

          <SectionHeading
            eyebrow="Ingredient breakdown"
            title={`Ingredient analysis (${ingredientAnalysis.length})`}
            description="Open an ingredient to read what it does and whether it raises a profile-related concern."
            icon={Leaf}
          />

          <div className="space-y-3">

            {ingredientAnalysis.map((item, index) => (
              <IngredientRow
                key={`${item.ingredient || 'ingredient'}-${index}`}
                item={item}
              />
            ))}

          </div>

        </Panel>
      )}

      {/* ALLERGENS AND PRODUCT TAGS */}
      <Panel>

        <SectionHeading
          eyebrow="Product label"
          title="Allergens and product tags"
          description="These are tags supplied by the product database; they are separate from the personalized compatibility result."
          icon={Info}
        />

        <div className="grid gap-6 md:grid-cols-2">

          <TagGroup
            title="Declared allergens"
            items={productAnalysis.allergens}
            variant="red"
            emptyText="No declared allergen tags available."
          />

          <TagGroup
            title="Ingredient tags"
            items={productAnalysis.ingredientAnalysisTags}
            variant="green"
            emptyText="No ingredient analysis tags available."
          />

        </div>

        <div className="mt-6 border-t border-[#E7EEE7] pt-5">

          <TagGroup
            title="Additives"
            items={productAnalysis.additives}
            variant="neutral"
            emptyText="No additive tags listed."
          />

        </div>

      </Panel>

      {/* COMPLETE INGREDIENT LIST */}
      {ingredients.length > 0 && (
        <Panel>

          <SectionHeading
            eyebrow="Full label"
            title={`Complete ingredient list (${ingredients.length})`}
            description="Ingredients shown in the product database listing. Green indicates an ingredient with an AI explanation above."
            icon={Leaf}
          />

          <div className="flex flex-wrap gap-2">

            {ingredients.map((ingredient, index) => {
              const isAnalyzed = analyzedIngredients.has(
                String(ingredient).toLowerCase()
              );

              return (
                <span
                  key={`${ingredient}-${index}`}
                  className={cx(
                    'rounded-lg border px-3 py-2 text-xs font-medium capitalize',
                    isAnalyzed
                      ? 'border-[#CDE2D1] bg-[#EFF6F0] text-[#247A50]'
                      : 'border-[#E1E9E2] bg-[#F6F8F6] text-[#687B70]'
                  )}
                >
                  {ingredient}
                </span>
              );
            })}

          </div>

        </Panel>
      )}

      {/* DISCLAIMER */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#DFE9E0] bg-[#F3F7F3] p-4 sm:p-5">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#39845A]">
          <ShieldCheck size={17} />
        </div>

        <div>

          <h3 className="text-xs font-semibold text-[#315A40]">
            Important information
          </h3>

          <p className="mt-1 text-xs leading-6 text-[#829187]">
            FoodLens provides AI-assisted assessments based on available
            product label, ingredient and nutrition information.
            Product data may be incomplete or inaccurate. This result
            does not certify FSSAI compliance and is not medical advice.
            Check the physical packaging and consult a qualified
            healthcare professional for medical dietary decisions.
          </p>

        </div>

      </div>

    </main>
  );
}
