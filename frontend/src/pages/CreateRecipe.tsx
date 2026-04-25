import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Ingredient, RecipeCategory } from '../types.ts';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

const CATEGORIES: RecipeCategory[] = ['breakfast', 'lunch', 'dinner', 'snack', 'shake', 'dessert'];
const EMOJIS = ['🍳', '🥣', '🍗', '🐟', '🥦', '🥑', '🍝', '🥤', '🌮', '🥗', '🥞', '🍮', '🥩', '🫙', '🍱'];

export default function CreateRecipe() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('lunch');
  const [emoji, setEmoji] = useState('🍽️');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('1');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '', unit: '' },
  ]);
  const [instructions, setInstructions] = useState(['']);
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [calories, setCalories] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">Sign in to share recipes</h2>
        <div className="flex justify-center gap-3 mt-5">
          <Link to="/login" className="btn-secondary">Sign in</Link>
          <Link to="/register" className="btn-primary">Join Free</Link>
        </div>
      </div>
    );
  }

  function addIngredient() {
    setIngredients(prev => [...prev, { name: '', amount: '', unit: '' }]);
  }

  function updateIngredient(idx: number, field: keyof Ingredient, val: string) {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, [field]: val } : ing));
  }

  function removeIngredient(idx: number) {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  }

  function addStep() {
    setInstructions(prev => [...prev, '']);
  }

  function updateStep(idx: number, val: string) {
    setInstructions(prev => prev.map((s, i) => i === idx ? val : s));
  }

  function removeStep(idx: number) {
    setInstructions(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validIngredients = ingredients.filter(i => i.name.trim());
    const validSteps = instructions.filter(s => s.trim());

    if (!title || !description || validIngredients.length === 0 || validSteps.length === 0 || !protein) {
      setError('Please fill in all required fields including at least one ingredient, step, and protein amount.');
      return;
    }

    setSubmitting(true);
    try {
      const recipe = await api.createRecipe({
        title,
        description,
        category,
        emoji,
        prepTime: Number(prepTime) || 0,
        cookTime: Number(cookTime) || 0,
        servings: Number(servings) || 1,
        ingredients: validIngredients,
        instructions: validSteps,
        macros: {
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
          calories: Number(calories) || 0,
        },
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      navigate(`/recipes/${recipe.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/recipes" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 inline-block">
        ← Back to Recipes
      </Link>

      <h1 className="text-2xl font-black text-gray-100 mb-6">🍽️ Share a Recipe</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Basic info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-200">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Recipe Emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    emoji === e ? 'bg-orange-500/20 ring-2 ring-orange-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. High-Protein Chicken Bowl"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe what makes this recipe great..."
              rows={3}
              className="input resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as RecipeCategory)}
                className="input"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Servings</label>
              <input
                type="number"
                value={servings}
                onChange={e => setServings(e.target.value)}
                min="1"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Prep Time (min)</label>
              <input
                type="number"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                min="0"
                placeholder="0"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Cook Time (min)</label>
              <input
                type="number"
                value={cookTime}
                onChange={e => setCookTime(e.target.value)}
                min="0"
                placeholder="0"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-200">Macros (per serving)</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Protein (g) *', value: protein, setter: setProtein, color: 'focus:ring-orange-500' },
              { label: 'Carbs (g)', value: carbs, setter: setCarbs, color: 'focus:ring-blue-500' },
              { label: 'Fat (g)', value: fat, setter: setFat, color: 'focus:ring-yellow-500' },
              { label: 'Calories', value: calories, setter: setCalories, color: 'focus:ring-gray-500' },
            ].map(({ label, value, setter, color }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  min="0"
                  placeholder="0"
                  className={`input ${color}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-200">Ingredients *</h2>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={ing.name}
                onChange={e => updateIngredient(i, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="input flex-1"
              />
              <input
                type="text"
                value={ing.amount}
                onChange={e => updateIngredient(i, 'amount', e.target.value)}
                placeholder="Amount"
                className="input w-24"
              />
              <input
                type="text"
                value={ing.unit}
                onChange={e => updateIngredient(i, 'unit', e.target.value)}
                placeholder="Unit"
                className="input w-20"
              />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(i)} className="text-gray-600 hover:text-red-400 transition-colors">
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="btn-secondary text-sm w-full">
            + Add Ingredient
          </button>
        </div>

        {/* Instructions */}
        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-200">Instructions *</h2>
          {instructions.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-3">
                {i + 1}
              </span>
              <textarea
                value={step}
                onChange={e => updateStep(i, e.target.value)}
                placeholder={`Step ${i + 1}...`}
                rows={2}
                className="input flex-1 resize-none text-sm"
              />
              {instructions.length > 1 && (
                <button type="button" onClick={() => removeStep(i)} className="text-gray-600 hover:text-red-400 transition-colors mt-3">
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addStep} className="btn-secondary text-sm w-full">
            + Add Step
          </button>
        </div>

        {/* Tags */}
        <div className="card p-5">
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. meal-prep, high-protein, quick"
            className="input"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
          {submitting ? 'Sharing Recipe...' : '🚀 Share Recipe'}
        </button>
      </form>
    </div>
  );
}
