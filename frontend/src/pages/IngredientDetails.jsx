
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  AlertTriangle,
  Info,
  BookOpen,
  FlaskConical,
  ShieldCheck,
  Hash,
  ExternalLink,
  Leaf,
  ChevronRight,
} from 'lucide-react';

import { ingredientService } from '../services/ingredientService.js';
import {
  StatusBadge,
  CategoryBadge,
} from '../components/common/Badge.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';

import toast from 'react-hot-toast';

function InfoCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-[#e4ebe4] bg-white p-5 shadow-[0_3px_15px_rgba(27,65,42,0.035)] transition-shadow hover:shadow-[0_8px_22px_rgba(27,65,42,0.055)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ee] text-[#36784d]">
          <Icon size={19} strokeWidth={1.8} />
        </div>

        <h2 className="text-base font-semibold text-[#294634]">
          {title}
        </h2>
      </div>

      <div className="text-sm leading-7 text-[#78877c]">
        {children || 'No information available yet.'}
      </div>
    </section>
  );
}

export default function IngredientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setIngredient(null);

    ingredientService
      .getIngredientById(id)
      .then((data) => {
        if (isMounted) {
          setIngredient(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          toast.error('Ingredient not found.');
          setIngredient(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <InlineLoader message="Loading ingredient details..." />
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4e7] text-[#b77a2c]">
          <AlertTriangle size={28} strokeWidth={1.7} />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-[#294634]">
          Ingredient not found
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-[#87948a]">
          This ingredient may not exist in our library or may have been removed.
        </p>

        <button
          type="button"
          onClick={() => navigate('/library')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#20764b] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#185f3b]"
        >
          <ArrowLeft size={16} />
          Back to Library
        </button>
      </div>
    );
  }

  const sources = Array.isArray(ingredient.sources)
    ? ingredient.sources
    : [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7 pb-10 animate-fade-in">

      {/* Breadcrumb and back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#89968d]">
          <Link
            to="/library"
            className="transition-colors hover:text-[#28764a]"
          >
            Ingredient Library
          </Link>

          <ChevronRight size={13} />

          <span className="font-medium text-[#477454]">
            Ingredient details
          </span>
        </div>

        <button
          id="ingredient-back-btn"
          type="button"
          onClick={() => navigate('/library')}
          className="inline-flex items-center gap-2 rounded-xl border border-[#e2e9e2] bg-white px-4 py-2.5 text-xs font-semibold text-[#63766a] transition-all hover:border-[#bad2bf] hover:bg-[#f3f8f3] hover:text-[#286542]"
        >
          <ArrowLeft size={15} />
          Back to Library
        </button>
      </div>

      {/* Ingredient overview */}
      <section className="relative overflow-hidden rounded-3xl border border-[#dce9de] bg-gradient-to-br from-[#f2f8f2] via-white to-[#eaf4ec] p-6 shadow-[0_5px_22px_rgba(27,65,42,0.045)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-[#dcebdd]/40" />

        <div className="relative">
          <div className="mb-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d9e8db] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#477454]">
              <Leaf size={12} />
              Ingredient profile
            </span>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="max-w-2xl break-words text-3xl font-semibold tracking-tight text-[#193c2a] sm:text-4xl">
                {ingredient.name}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#78877c]">
                Understand what this ingredient is, why it is used in food products, and the information available about its regulatory status.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-[#dce9de] bg-white/90 p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf5ee] text-[#36784d]">
                <FlaskConical size={21} />
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#929e94]">
                  INS number
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#294634]">
                  {ingredient.insNumber || 'Not available'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#dce9de] pt-5">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#89968d]">
                Ingredient category
              </p>
              <CategoryBadge category={ingredient.category} />
            </div>

            <div className="mx-1 hidden h-9 w-px bg-[#dce9de] sm:block" />

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#89968d]">
                Regulatory status
              </p>
              <StatusBadge status={ingredient.fssaiStatus} />
            </div>
          </div>
        </div>
      </section>

      {/* Main information */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        <InfoCard
          icon={BookOpen}
          title="What is it?"
        >
          {ingredient.description}
        </InfoCard>

        <InfoCard
          icon={FlaskConical}
          title="Why is it used?"
        >
          {ingredient.whyUsed}
        </InfoCard>
      </div>

      {/* Caution section */}
      <section className="overflow-hidden rounded-2xl border border-[#f0dfc3] bg-[#fffaf1] shadow-[0_3px_15px_rgba(90,65,25,0.035)]">
        <div className="flex items-center gap-3 border-b border-[#f0e5d2] px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0d8] text-[#ae762e]">
            <AlertTriangle size={19} strokeWidth={1.8} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#604b2e]">
              Who should be careful?
            </h2>
            <p className="mt-0.5 text-xs text-[#a18b6b]">
              Important considerations
            </p>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm leading-7 text-[#88785f]">
            {ingredient.whoShouldBeCareful ||
              'No specific caution information is available for this ingredient yet.'}
          </p>
        </div>
      </section>

      {/* Sources and references */}
      {sources.length > 0 && (
        <section className="rounded-2xl border border-[#e4ebe4] bg-white p-5 shadow-[0_3px_15px_rgba(27,65,42,0.035)] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ee] text-[#36784d]">
              <ExternalLink size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#294634]">
                Sources & References
              </h2>
              <p className="mt-1 text-xs text-[#89968d]">
                Reference material used for this ingredient profile.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {sources.map((source, index) => {
              const isUrl =
                typeof source === 'string' &&
                /^https?:\/\//i.test(source);

              return (
                <div
                  key={`${source}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#edf0ed] bg-[#fafcfa] px-4 py-3 transition-colors hover:border-[#d6e5d8]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf5ee] text-[#548263]">
                      <BookOpen size={15} />
                    </div>

                    <span className="break-all text-sm text-[#63766a]">
                      {source}
                    </span>
                  </div>

                  {isUrl && (
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open source in new tab"
                      className="shrink-0 rounded-lg p-2 text-[#43805a] transition-colors hover:bg-[#edf5ee]"
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Regulatory disclaimer */}
      <section className="flex items-start gap-3 rounded-2xl border border-[#e2e9e2] bg-[#f6f9f6] p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f1e9] text-[#548263]">
          <ShieldCheck size={18} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#405e49]">
            Regulatory information
          </h3>

          <p className="mt-1.5 text-xs leading-6 text-[#829087]">
            FSSAI status is based on the Food Safety and Standards (Food Products Standards and Food Additives) Regulations, 2011 and subsequent amendments. This information is for reference only and is not a substitute for professional medical advice.
          </p>
        </div>
      </section>

      {/* Bottom navigation */}
      <div className="flex flex-col gap-3 border-t border-[#e7ece7] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#89968d]">
          Exploring food ingredients, one step at a time.
        </p>

        <Link
          to="/library"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce7dd] bg-white px-5 py-3 text-sm font-semibold text-[#36784d] transition-all hover:border-[#bad2bf] hover:bg-[#f2f7f2]"
        >
          Browse more ingredients
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
