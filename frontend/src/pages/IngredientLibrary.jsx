// src/pages/IngredientLibrary.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { ingredientService } from '../services/ingredientService.js';
import { StatusBadge, CategoryBadge } from '../components/common/Badge.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

const CATEGORIES = ['All', 'Colours', 'Preservatives', 'Sweeteners', 'Flavours', 'Emulsifiers'];

export default function IngredientLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const LIMIT = 12;

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ingredientService.getIngredients({
        search,
        category: category === 'All' ? '' : category,
        page,
        limit: LIMIT,
      });
      setIngredients(data.ingredients || []);
      setTotal(data.total || 0);
      setPages(data.totalPages || data.pages || 1);
    } catch {
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);
  useEffect(() => { setPage(1); }, [search, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIngredients();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>Ingredient Library</h1>
        <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
          Search food additives by name or INS number and understand their FSSAI status.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ls-muted)' }} />
        <input
          id="library-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or INS number (e.g. Tartrazine or INS 102)…"
          className="ls-input pl-9 pr-4"
        />
      </form>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`cat-filter-${cat}`}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat ? 'text-white ls-brand-gradient' : ''
            }`}
            style={category !== cat ? {
              background: 'var(--ls-surface)',
              color: 'var(--ls-muted)',
              border: '1px solid var(--ls-border)',
            } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm mb-4" style={{ color: 'var(--ls-muted)' }}>
          {total} ingredient{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <InlineLoader message="Loading ingredients…" />
      ) : ingredients.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No ingredients found"
          description="Try adjusting your search term or category filter."
          action={
            <button
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="ls-btn ls-btn-secondary text-sm px-4 py-2"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {ingredients.map((ing) => (
            <Link
              key={ing.slug || ing._id}
              to={`/library/${ing.slug || ing._id}`}
              id={`ingredient-card-${ing.slug || ing._id}`}
              className="ls-surface p-5 ls-card-hover animate-fade-in flex flex-col gap-3"
              style={{ boxShadow: 'var(--shadow-card)', textDecoration: 'none' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--ls-text)' }}>
                    {ing.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ls-muted)' }}>
                    {ing.insNumber}
                  </p>
                </div>
                <StatusBadge status={ing.fssaiStatus} />
              </div>

              <CategoryBadge category={ing.category} />

              <p className="text-xs line-clamp-2" style={{ color: 'var(--ls-muted)' }}>
                {ing.description}
              </p>

              <span className="text-xs font-medium mt-auto" style={{ color: 'var(--ls-green)' }}>
                View details →
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <button
              id="library-prev-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="ls-btn ls-btn-ghost px-3 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              id="library-next-btn"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="ls-btn ls-btn-ghost px-3 py-2 text-sm disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
