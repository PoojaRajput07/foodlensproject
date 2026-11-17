// src/pages/IngredientDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import { ingredientService } from '../services/ingredientService.js';
import { StatusBadge, CategoryBadge } from '../components/common/Badge.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';
import toast from 'react-hot-toast';

export default function IngredientDetails() {
  // Route is /library/:id — we use this as a slug to match backend
  const { id } = useParams();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ingredientService
      .getIngredientById(id)
      .then(setIngredient)
      .catch(() => toast.error('Ingredient not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <InlineLoader message="Loading ingredient details…" />;

  if (!ingredient) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <AlertTriangle size={48} style={{ color: 'var(--ls-amber)', margin: '0 auto 16px' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ls-text)' }}>Ingredient not found</h2>
        <p className="mb-6" style={{ color: 'var(--ls-muted)' }}>This ingredient may not exist in our library yet.</p>
        <button onClick={() => navigate('/library')} className="ls-btn ls-btn-primary">
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/library')}
        className="flex items-center gap-2 text-sm mb-6 hover:underline"
        style={{ color: 'var(--ls-muted)' }}
        id="ingredient-back-btn"
      >
        <ArrowLeft size={16} /> Back to Library
      </button>

      {/* Header card */}
      <div
        className="ls-surface p-6 mb-5"
        style={{ boxShadow: 'var(--shadow-md)', borderLeft: '4px solid var(--ls-green)' }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>
              {ingredient.name}
            </h1>
            <p className="font-mono text-sm font-semibold" style={{ color: 'var(--ls-green)' }}>
              {ingredient.insNumber}
            </p>
          </div>
          <StatusBadge status={ingredient.fssaiStatus} />
        </div>
        <CategoryBadge category={ingredient.category} />
      </div>

      {/* Description */}
      <section className="ls-surface p-5 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h2 className="font-semibold mb-2" style={{ color: 'var(--ls-text)' }}>What is it?</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
          {ingredient.description}
        </p>
      </section>

      {/* Why used */}
      <section className="ls-surface p-5 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h2 className="font-semibold mb-2" style={{ color: 'var(--ls-text)' }}>Why is it used?</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
          {ingredient.whyUsed}
        </p>
      </section>

      {/* Who should be careful */}
      <section
        className="p-5 mb-4 rounded-xl"
        style={{
          background: 'var(--ls-amber-light)',
          border: '1px solid var(--ls-amber)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} style={{ color: 'var(--ls-amber)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h2 className="font-semibold mb-2" style={{ color: 'var(--ls-text)' }}>Who should be careful?</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
              {ingredient.whoShouldBeCareful}
            </p>
          </div>
        </div>
      </section>

      {/* Sources */}
      {ingredient.sources?.length > 0 && (
        <section className="ls-surface p-5 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--ls-text)' }}>Sources & References</h2>
          <ul className="flex flex-col gap-2">
            {ingredient.sources.map((src, i) => (
              <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--ls-green)' }}>
                <ExternalLink size={14} />
                <span>{src}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FSSAI note */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl text-xs"
        style={{ background: 'var(--ls-bg)', border: '1px solid var(--ls-border)', color: 'var(--ls-muted)' }}
      >
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <p>
          FSSAI status is based on the Food Safety and Standards (Food Products Standards and Food Additives) Regulations, 2011 and subsequent amendments. This information is for reference only and not a substitute for professional medical advice.
        </p>
      </div>

      {/* Back to library link */}
      <div className="mt-6">
        <Link to="/library" className="ls-btn ls-btn-secondary text-sm px-4 py-2">
          ← Browse more ingredients
        </Link>
      </div>
    </div>
  );
}
