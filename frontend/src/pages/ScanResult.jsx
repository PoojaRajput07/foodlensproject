
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  XCircle,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  ShieldAlert,
  HeartPulse,
  Leaf,
  ChevronDown,
  ChevronUp,
  Flame,
  Droplets,
  Wheat,
  Beef,
  ShieldCheck,
  Sparkles,
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
    description: 'This product has a confirmed conflict with your health profile.',
  },
  CAUTION: {
    label: 'Caution',
    icon: AlertTriangle,
    color: '#B47B25',
    bg: '#FBF4E6',
    border: '#EEDDB9',
    description: 'Some product information needs your attention.',
  },
  OK: {
    label: 'Looks suitable',
    icon: CheckCircle,
    color: '#247A50',
    bg: '#EAF4EC',
    border: '#CDE2D1',
    description: 'No conflicts were identified from the available information.',
  },
  UNVERIFIED: {
    label: 'Unverified',
    icon: HelpCircle,
    color: '#687B70',
    bg: '#F0F3F0',
    border: '#DCE5DE',
    description: 'There is not enough information for a reliable assessment.',
  },
};

function getStatus(status) {
  return STATUS_CONFIG[String(status || 'UNVERIFIED').toUpperCase()]
    || STATUS_CONFIG.UNVERIFIED;
}

function StatusBadge({ status }) {
  const config = getStatus(status);
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-[#DFE9E0] bg-white shadow-[0_2px_12px_rgba(30,70,45,0.035)]">
      <div className="flex items-center gap-3 border-b border-[#E8EFE8] px-5 py-5 sm:px-6">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3EB] text-[#247A50]">
            <Icon size={19} />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="font-semibold text-[#153F2D]">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-[#829187]">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function AssessmentCard({ title, icon: Icon, assessment }) {
  if (!assessment) return null;

  const reasons = Array.isArray(assessment.reasons)
    ? assessment.reasons
    : [];

  const config = getStatus(assessment.status);

  return (
    <div className="rounded-xl border border-[#E1EAE2] bg-[#FAFCFA] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF3EB] text-[#39845A]">
            <Icon size={17} />
          </div>
          <h3 className="text-sm font-semibold text-[#254B35]">{title}</h3>
        </div>

        <StatusBadge status={assessment.status} />
      </div>

      <div className="mt-4 border-t border-[#E7EEE7] pt-3">
        {reasons.length > 0 ? (
          <ul className="space-y-2.5">
            {reasons.map((reason, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-sm leading-6 text-[#718477]"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: config.color }}
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

function IngredientCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  const level = String(item.concernLevel || 'none').toLowerCase();

  const levelConfig = {
    none: {
      label: 'No identified concern',
      color: '#247A50',
      bg: '#EAF4EC',
    },
    possible: {
      label: 'Possible concern',
      color: '#B47B25',
      bg: '#FBF4E6',
    },
    confirmed: {
      label: 'Confirmed concern',
      color: '#B94B45',
      bg: '#FCEFED',
    },
    unknown: {
      label: 'Information unknown',
      color: '#687B70',
      bg: '#F0F3F0',
    },
  };

  const config = levelConfig[level] || levelConfig.unknown;

  return (
    <div className="overflow-hidden rounded-xl border border-[#DFE9E0] bg-white transition hover:border-[#BFD8C5]">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5EF] text-[#39845A]">
            <Leaf size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#254B35]">
              {item.commonName || item.ingredient}
            </h3>
            <p className="mt-1 truncate text-xs text-[#829187]">
              {item.ingredient}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="hidden rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex"
            style={{ background: config.bg, color: config.color }}
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
          style={{ background: config.bg, color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-[#E7EEE7] bg-[#FAFCFA] p-4">
          <p className="text-sm leading-6 text-[#718477]">
            {item.explanation || 'No additional explanation available.'}
          </p>

          {item.profileConcerns?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#315A40]">
                Your profile concerns
              </p>

              <div className="flex flex-wrap gap-2">
                {item.profileConcerns.map((concern, index) => (
                  <span
                    key={index}
                    className="rounded-lg border border-[#EEDDB9] bg-[#FBF4E6] px-3 py-1.5 text-xs text-[#9A6B24]"
                  >
                    {concern.replace(/[-_]/g, ' ')}
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

function NutritionItem({ label, value, unit, icon: Icon }) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <div className="rounded-xl border border-[#E1EAE2] bg-[#FAFCFA] p-4 transition hover:border-[#BFD8C5]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[#829187]">{label}</p>
        <Icon size={16} className="text-[#6C9B79]" />
      </div>

      <p className="text-xl font-semibold tracking-tight text-[#153F2D]">
        {value}
        <span className="ml-1 text-xs font-medium text-[#829187]">{unit}</span>
      </p>
    </div>
  );
}

function TagList({ items, variant = 'green', emptyText }) {
  const styles = {
    green: 'border-[#D4E7D8] bg-[#EFF6F0] text-[#28764B]',
    red: 'border-[#F1D2CE] bg-[#FCEFED] text-[#A84E46]',
    neutral: 'border-[#E0E9E1] bg-[#F5F8F5] text-[#687B70]',
  };

  if (!items?.length) {
    return <p className="text-sm text-[#829187]">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize ${styles[variant]}`}
        >
          {String(item).replace(/^en:/, '').replace(/-/g, ' ')}
        </span>
      ))}
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


  useEffect(() => {
    if (state?.result) {
      setResult(state.result);
      setSaved(Boolean(state.result.isSaved));
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);

    scanService
      .getScanById(id)
      .then((data) => {
        if (active) {
          setResult(data);
          setSaved(Boolean(data?.isSaved));
        }
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

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);

    try {
      await scanService.saveScan(id, !saved);
      setSaved((value) => !value);

      toast.success(
        saved ? 'Removed from saved items.' : 'Scan saved successfully!'
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
          <HelpCircle size={32} />
        </div>

        <h2 className="text-xl font-semibold text-[#153F2D]">
          Result not found
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#829187]">
          This scan result may have expired or been removed.
        </p>

        <div className="mt-6">
          <Button onClick={() => navigate('/scan')}>Scan Again</Button>
        </div>
      </div>
    );
  }

  const scan = result.scan || result.data?.scan || result.data || result;
  const product = scan.product || {};
  const ai = scan.aiAnalysis || {};
  const assessment = ai.personalizedAssessment || {};

  const verdict =
    scan.overallVerdict ||
    scan.verdict ||
    assessment.status ||
    ai.overallAssessment ||
    'UNVERIFIED';

  const verdictConfig = getStatus(verdict);
  const VerdictIcon = verdictConfig.icon;

  const ingredients = scan.ingredients || [];
  const ingredientAnalysis = ai.ingredientAnalysis || [];
  const productAnalysis = product.productAnalysis || scan.productAnalysis || {};
  const nutrition = scan.nutrition || {};

  const ingredientNames = new Set(
    ingredientAnalysis.map((item) =>
      String(item.ingredient || '').toLowerCase()
    )
  );

  const productName = product.name || scan.productName || 'Unknown product';
  const brand = product.brand || scan.brand || '';
  const image = product.image || null;

  const nutritionItems = [
    { label: 'Energy', value: nutrition.energyKcal100g, unit: 'kcal', icon: Flame },
    { label: 'Sugar', value: nutrition.sugars100g, unit: 'g', icon: Droplets },
    { label: 'Carbohydrates', value: nutrition.carbohydrates100g, unit: 'g', icon: Wheat },
    { label: 'Total Fat', value: nutrition.fat100g, unit: 'g', icon: Droplets },
    { label: 'Saturated Fat', value: nutrition.saturatedFat100g, unit: 'g', icon: Droplets },
    { label: 'Protein', value: nutrition.proteins100g, unit: 'g', icon: Beef },
    { label: 'Salt', value: nutrition.salt100g, unit: 'g', icon: Droplets },
    { label: 'Sodium', value: nutrition.sodium100g, unit: 'g', icon: Info },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-10">

      {/* PAGE HEADER */}
      <div className="mb-7">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#718477] transition hover:text-[#247A50]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="mb-2 flex items-center gap-2">
          <span className="h-px w-7 bg-[#247A50]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#247A50]">
            Your food report
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[#153F2D] sm:text-3xl">
          Product Analysis
        </h1>

        <p className="mt-2 text-sm text-[#829187]">
          Personalized insights based on your food preferences and profile.
        </p>
      </div>

      {/* PRODUCT VERDICT HERO */}
      <section
        className="relative mb-6 overflow-hidden rounded-2xl border p-5 sm:p-7"
        style={{
          background: verdictConfig.bg,
          borderColor: verdictConfig.border,
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-current opacity-[0.08]" />
        <div className="pointer-events-none absolute -right-5 -top-16 h-44 w-44 rounded-full border border-current opacity-[0.08]" />

        <div className="relative z-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: verdictConfig.color }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: verdictConfig.color }}
              >
                Personalized assessment
              </span>
            </div>

            <StatusBadge status={verdict} />
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white/80 p-2 shadow-sm sm:h-32 sm:w-32">
              {image ? (
                <img
                  src={image}
                  alt={productName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Leaf size={42} className="text-[#6C9B79]" strokeWidth={1.3} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {brand && (
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[#718477]">
                  {brand}
                </p>
              )}

              <h2 className="text-2xl font-semibold leading-tight text-[#153F2D] sm:text-3xl">
                {productName}
              </h2>

              <div className="mt-4 flex items-start gap-2">
                <VerdictIcon
                  size={19}
                  className="mt-0.5 shrink-0"
                  style={{ color: verdictConfig.color }}
                />
                <p
                  className="text-sm leading-6"
                  style={{ color: verdictConfig.color }}
                >
                  {verdictConfig.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-black/5 pt-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              loading={saving}
              className="border border-white/70 bg-white/60"
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {saved ? 'Saved' : 'Save Product'}
            </Button>
          </div>
        </div>
      </section>

      {/* AI SUMMARY */}
      {ai.summary && (
        <section className="mb-5 rounded-2xl border border-[#DCE9DE] bg-white p-5 shadow-[0_2px_12px_rgba(30,70,45,0.035)] sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3EB] text-[#247A50]">
              <Sparkles size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-[#153F2D]">
                What does this mean for you?
              </h2>
              <p className="mt-1 text-xs text-[#829187]">
                AI-powered personalized food insights
              </p>
            </div>
          </div>

          <p className="text-sm leading-7 text-[#718477]">{ai.summary}</p>

          {assessment.recommendation && (
            <div className="mt-5 rounded-xl border border-[#D5E6D8] bg-[#EFF6F0] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#247A50]">
                <ShieldCheck size={17} />
                Your recommendation
              </div>
              <p className="mt-2 text-sm leading-6 text-[#52705C]">
                {assessment.recommendation}
              </p>
            </div>
          )}
        </section>
      )}

      {/* PERSONALIZED ASSESSMENT */}
      {Object.keys(assessment).length > 0 && (
        <SectionCard
          title="Your Personalized Assessment"
          subtitle="How this product relates to your saved profile"
          icon={HeartPulse}
        >
          <div className="space-y-3">
            <AssessmentCard
              title="Allergy compatibility"
              icon={ShieldAlert}
              assessment={assessment.allergyAssessment}
            />

            <AssessmentCard
              title="Health conditions"
              icon={HeartPulse}
              assessment={assessment.conditionAssessment}
            />

            <AssessmentCard
              title="Diet compatibility"
              icon={Leaf}
              assessment={assessment.dietAssessment}
            />
          </div>
        </SectionCard>
      )}

      {/* INGREDIENT ANALYSIS */}
      {ingredientAnalysis.length > 0 && (
        <SectionCard
          title={`Ingredient Analysis (${ingredientAnalysis.length})`}
          subtitle="Understand each ingredient and its relevance to your profile"
          icon={Leaf}
        >
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-[#EFF6F0] p-3.5">
            <Info size={16} className="mt-0.5 shrink-0 text-[#39845A]" />
            <p className="text-xs leading-5 text-[#718477]">
              Select any ingredient to read its explanation and understand
              possible profile-related concerns.
            </p>
          </div>

          <div className="space-y-3">
            {ingredientAnalysis.map((item, index) => (
              <IngredientCard
                key={`${item.ingredient}-${index}`}
                item={item}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {/* NUTRITION */}
      {nutritionItems.some(
        (item) => item.value !== null && item.value !== undefined && item.value !== ''
      ) && (
        <SectionCard
          title="Nutritional Information"
          subtitle="Nutritional values per 100g of product"
          icon={HeartPulse}
        >
          <div className="mb-4 rounded-xl bg-[#EFF6F0] px-4 py-3">
            <p className="text-xs leading-5 text-[#718477]">
              These values are per 100g, not per serving. Actual intake depends
              on the quantity you consume.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {nutritionItems.map((item) => (
              <NutritionItem key={item.label} {...item} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* PRODUCT LABEL INFORMATION */}
      <SectionCard
        title="Product Label Information"
        subtitle="Information declared on the product database listing"
        icon={Info}
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#315A40]">
              Declared allergens
            </h3>
            <TagList
              items={productAnalysis.allergens}
              variant="red"
              emptyText="No declared allergen tags available."
            />
          </div>

          <div className="border-t border-[#E7EEE7] pt-5">
            <h3 className="mb-3 text-sm font-semibold text-[#315A40]">
              Ingredient analysis tags
            </h3>
            <TagList
              items={productAnalysis.ingredientAnalysisTags}
              variant="green"
              emptyText="No ingredient analysis tags available."
            />
          </div>

          <div className="border-t border-[#E7EEE7] pt-5">
            <h3 className="mb-3 text-sm font-semibold text-[#315A40]">
              Additives
            </h3>
            <TagList
              items={productAnalysis.additives}
              variant="neutral"
              emptyText="No additive tags available."
            />
          </div>
        </div>
      </SectionCard>

      {/* COMPLETE INGREDIENT LIST */}
      {ingredients.length > 0 && (
        <SectionCard
          title="Complete Ingredient List"
          subtitle={`${ingredients.length} ingredients found in the product`}
          icon={Leaf}
        >
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#829187]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#247A50]" />
              AI analyzed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C7D2C9]" />
              Listed ingredient
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => {
              const analyzed = ingredientNames.has(
                String(ingredient).toLowerCase()
              );

              return (
                <span
                  key={`${ingredient}-${index}`}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                    analyzed
                      ? 'border-[#CDE2D1] bg-[#EFF6F0] text-[#247A50]'
                      : 'border-[#E1E9E2] bg-[#F6F8F6] text-[#687B70]'
                  }`}
                >
                  {ingredient}
                </span>
              );
            })}
          </div>
        </SectionCard>
      )}



      {/* DISCLAIMER */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#DFE9E0] bg-[#F3F7F3] p-4 sm:p-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#39845A]">
          <ShieldCheck size={17} />
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#315A40]">
            Important information
          </h3>
          <p className="mt-1 text-xs leading-6 text-[#829187]">
            FoodLens provides AI-assisted assessments based on available
            product label, ingredient and nutrition information. Product data
            may be incomplete or inaccurate. This result does not certify
            FSSAI compliance and is not medical advice. Consult a qualified
            healthcare professional for medical dietary decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
