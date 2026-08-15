import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type { DurationOption, FeatureGroup, Product } from './types';

const DURATION_LABELS = ['1 Day', '3 Days', '7 Days', '30 Days'];
const DURATION_DAYS = [1, 3, 7, 30];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyProduct(): Product {
  return {
    id: generateId(),
    name: '',
    game: '',
    category: 'Items',
    durations: DURATION_LABELS.map((label, i) => ({ label, days: DURATION_DAYS[i], price: 0 })),
    note: '',
    tag: '',
    image: '',
    description: '',
    eta: 'Instant delivery',
    type: '',
    listed: true,
    features: [],
  };
}

type AdminPanelProps = {
  products: Product[];
  onSave: (products: Product[]) => void;
  onClose: () => void;
};

type View = 'list' | 'edit';

export default function AdminPanel({ products, onSave, onClose }: AdminPanelProps) {
  const [draft, setDraft] = useState<Product[]>(products);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<Product | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openEdit = (product: Product) => {
    setEditing(JSON.parse(JSON.stringify(product)));
    setView('edit');
  };

  const openNew = () => {
    setEditing(emptyProduct());
    setView('edit');
  };

  const saveEdit = () => {
    if (!editing) return;
    setDraft((prev) => {
      const exists = prev.find((p) => p.id === editing.id);
      return exists ? prev.map((p) => (p.id === editing.id ? editing : p)) : [...prev, editing];
    });
    setView('list');
    setEditing(null);
  };

  const deleteProduct = (id: string) => {
    setDraft((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleListed = (id: string) => {
    setDraft((prev) => prev.map((p) => (p.id === id ? { ...p, listed: !p.listed } : p)));
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#09090f] text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e1e2e] bg-[#0c0c16] px-6 py-4">
        <div className="flex items-center gap-4">
          {view === 'edit' && (
            <button
              onClick={() => { setView('list'); setEditing(null); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#13131e] text-[#a0a0b8] hover:text-white transition-colors"
            >
              <ChevronDown className="rotate-90" size={16} />
            </button>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C5CE7]">XtineCheats Admin</p>
            <h1 className="text-[18px] font-extrabold tracking-tight">
              {view === 'list' ? 'Product Manager' : editing?.id && products.find(p => p.id === editing.id) ? 'Edit Product' : 'New Product'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {view === 'list' && (
            <>
              <button
                onClick={openNew}
                className="flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#2a2a3a] transition-colors"
              >
                <Plus size={14} /> New Product
              </button>
              <button
                onClick={save}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold transition-all ${saved ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30' : 'bg-[#6C5CE7] text-white hover:bg-[#7B6FF0]'}`}
              >
                {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save All</>}
              </button>
            </>
          )}
          {view === 'edit' && (
            <button
              onClick={saveEdit}
              className="flex items-center gap-2 rounded-lg bg-[#6C5CE7] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#7B6FF0] transition-colors"
            >
              <Save size={14} /> Apply Changes
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#13131e] text-[#a0a0b8] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'list' && (
          <ProductList
            products={draft}
            onEdit={openEdit}
            onDelete={deleteProduct}
            onToggleListed={toggleListed}
          />
        )}
        {view === 'edit' && editing && (
          <ProductEditor product={editing} onChange={setEditing} />
        )}
      </div>
    </div>
  );
}

function ProductList({
  products,
  onEdit,
  onDelete,
  onToggleListed,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onToggleListed: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-8">
      <p className="mb-6 text-[13px] text-[#5a5a72]">
        {products.length} products · Changes are saved to local storage. Click <strong className="text-[#a0a0b8]">Save All</strong> after editing to persist.
      </p>
      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-4 rounded-xl border bg-[#0f0f18] px-5 py-4 transition-colors ${p.listed ? 'border-[#1e1e2e]' : 'border-[#1e1e2e] opacity-50'}`}
          >
            <GripVertical size={16} className="text-[#3a3a4a] shrink-0" />

            {/* Product image thumbnail */}
            <div className="h-12 w-12 shrink-0 rounded-lg border border-[#1e1e2e] bg-[#13131e] overflow-hidden flex items-center justify-center">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-[#3a3a4a]">IMG</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-[15px] truncate">{p.name || <span className="text-[#5a5a72]">Untitled</span>}</p>
                <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${p.listed ? 'bg-[#6C5CE7]/20 text-[#8B7CF8]' : 'bg-[#1e1e2e] text-[#5a5a72]'}`}>
                  {p.listed ? 'Listed' : 'Unlisted'}
                </span>
              </div>
              <p className="text-[12px] text-[#5a5a72] mt-0.5">
                {p.game} · {p.category} · Prices from ${Math.min(...p.durations.map(d => d.price)).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleListed(p.id)}
                title={p.listed ? 'Unlist' : 'List'}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#13131e] text-[#a0a0b8] hover:text-white transition-colors"
              >
                {p.listed ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => onEdit(p)}
                title="Edit"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#13131e] text-[#a0a0b8] hover:text-[#6C5CE7] hover:border-[#6C5CE7]/30 transition-colors"
              >
                <Pencil size={14} />
              </button>
              {confirmDelete === p.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { onDelete(p.id); setConfirmDelete(null); }}
                    className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#13131e] text-[#a0a0b8] hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(p.id)}
                  title="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#13131e] text-[#a0a0b8] hover:text-red-400 hover:border-red-400/30 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductEditor({ product, onChange }: { product: Product; onChange: (p: Product) => void }) {
  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    onChange({ ...product, [key]: value });

  const setDuration = (i: number, field: keyof DurationOption, value: string | number) => {
    const durations = product.durations.map((d, idx) =>
      idx === i ? { ...d, [field]: field === 'price' ? parseFloat(String(value)) || 0 : value } : d
    );
    set('durations', durations);
  };

  const addFeatureGroup = () => {
    const group: FeatureGroup = { id: generateId(), title: 'NEW SECTION:', items: ['Feature 1'] };
    set('features', [...product.features, group]);
  };

  const updateGroup = (groupId: string, field: keyof FeatureGroup, value: string | string[]) => {
    set('features', product.features.map(g => g.id === groupId ? { ...g, [field]: value } : g));
  };

  const deleteGroup = (groupId: string) => {
    set('features', product.features.filter(g => g.id !== groupId));
  };

  const moveGroup = (groupId: string, dir: -1 | 1) => {
    const idx = product.features.findIndex(g => g.id === groupId);
    const next = idx + dir;
    if (next < 0 || next >= product.features.length) return;
    const arr = [...product.features];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    set('features', arr);
  };

  const addItem = (groupId: string) => {
    const g = product.features.find(g => g.id === groupId);
    if (!g) return;
    updateGroup(groupId, 'items', [...g.items, '']);
  };

  const updateItem = (groupId: string, itemIdx: number, value: string) => {
    const g = product.features.find(g => g.id === groupId);
    if (!g) return;
    const items = g.items.map((it, i) => i === itemIdx ? value : it);
    updateGroup(groupId, 'items', items);
  };

  const deleteItem = (groupId: string, itemIdx: number) => {
    const g = product.features.find(g => g.id === groupId);
    if (!g) return;
    updateGroup(groupId, 'items', g.items.filter((_, i) => i !== itemIdx));
  };

  return (
    <div className="mx-auto max-w-[800px] px-6 py-8 space-y-8">
      {/* Basic info */}
      <section>
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#6C5CE7]">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product Name">
            <input value={product.name} onChange={e => set('name', e.target.value)} className="admin-input" placeholder="e.g. Nebula Bundle" />
          </Field>
          <Field label="Game / Collection">
            <input value={product.game} onChange={e => set('game', e.target.value)} className="admin-input" placeholder="e.g. Apex Legends" />
          </Field>
          <Field label="Category">
            <select value={product.category} onChange={e => set('category', e.target.value as Product['category'])} className="admin-input">
              <option value="Items">Items</option>
              <option value="Services">Services</option>
            </select>
          </Field>
          <Field label="Tag Badge">
            <input value={product.tag} onChange={e => set('tag', e.target.value)} className="admin-input" placeholder="e.g. Popular" />
          </Field>
          <Field label="Note (shown on card)">
            <input value={product.note} onChange={e => set('note', e.target.value)} className="admin-input" placeholder="e.g. 3 curated cosmetics" />
          </Field>
          <Field label="Type">
            <input value={product.type} onChange={e => set('type', e.target.value)} className="admin-input" placeholder="e.g. Cosmetic bundle" />
          </Field>
          <Field label="ETA / Delivery">
            <input value={product.eta} onChange={e => set('eta', e.target.value)} className="admin-input" placeholder="e.g. Instant delivery" />
          </Field>
          <Field label="Status">
            <select value={product.listed ? 'listed' : 'unlisted'} onChange={e => set('listed', e.target.value === 'listed')} className="admin-input">
              <option value="listed">Listed (visible in store)</option>
              <option value="unlisted">Unlisted (hidden from store)</option>
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description">
            <textarea value={product.description} onChange={e => set('description', e.target.value)} rows={3} className="admin-input resize-none" placeholder="Product description shown in the detail view..." />
          </Field>
        </div>
      </section>

      {/* Image */}
      <section>
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#6C5CE7]">Product Image</h2>
        <Field label="Image URL">
          <input value={product.image} onChange={e => set('image', e.target.value)} className="admin-input" placeholder="https://example.com/image.png" />
        </Field>
        {product.image && (
          <div className="mt-3 h-40 w-40 overflow-hidden rounded-xl border border-[#1e1e2e]">
            <img src={product.image} alt="Preview" className="h-full w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
          </div>
        )}
        {!product.image && (
          <p className="mt-2 text-[12px] text-[#5a5a72]">Paste an image URL above to show a custom image on the product card and detail view.</p>
        )}
      </section>

      {/* Duration pricing */}
      <section>
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#6C5CE7]">Duration Pricing</h2>
        <div className="space-y-3">
          {product.durations.map((d, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-[#1e1e2e] bg-[#0f0f18] px-5 py-4">
              <span className="w-16 text-[13px] font-bold text-white">{d.label}</span>
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#5a5a72]">Price (USD)</label>
                <div className="flex items-center gap-2">
                  <span className="text-[#5a5a72]">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={d.price}
                    onChange={e => setDuration(i, 'price', e.target.value)}
                    className="admin-input w-32"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature groups */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#6C5CE7]">Feature Overview Sections</h2>
          <button
            onClick={addFeatureGroup}
            className="flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-3 py-2 text-[12px] font-bold text-white hover:bg-[#2a2a3a] transition-colors"
          >
            <Plus size={13} /> Add Section
          </button>
        </div>

        {product.features.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#1e1e2e] bg-[#0f0f18] py-10 text-center text-[13px] text-[#5a5a72]">
            No feature sections yet. Click <strong className="text-[#a0a0b8]">Add Section</strong> to build the feature overview.
          </div>
        )}

        <div className="space-y-4">
          {product.features.map((group, gi) => (
            <div key={group.id} className="rounded-xl border border-[#1e1e2e] bg-[#0f0f18] overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[#1e1e2e] bg-[#13131e] px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveGroup(group.id, -1)} disabled={gi === 0} className="text-[#5a5a72] hover:text-white disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                  <button onClick={() => moveGroup(group.id, 1)} disabled={gi === product.features.length - 1} className="text-[#5a5a72] hover:text-white disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                </div>
                <input
                  value={group.title}
                  onChange={e => updateGroup(group.id, 'title', e.target.value)}
                  className="flex-1 bg-transparent text-[13px] font-bold text-[#8B7CF8] outline-none placeholder:text-[#3a3a4a]"
                  placeholder="SECTION TITLE:"
                />
                <button onClick={() => addItem(group.id)} className="flex items-center gap-1 rounded-md bg-[#1e1e2e] px-2 py-1 text-[11px] font-bold text-[#a0a0b8] hover:text-white transition-colors">
                  <Plus size={11} /> Item
                </button>
                <button onClick={() => deleteGroup(group.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-[#5a5a72] hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="divide-y divide-[#1e1e2e]/60">
                {group.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-3 px-4 py-2.5">
                    <Check size={12} className="shrink-0 text-[#6C5CE7]" />
                    <input
                      value={item}
                      onChange={e => updateItem(group.id, ii, e.target.value)}
                      className="flex-1 bg-transparent text-[13px] text-[#a0a0b8] outline-none focus:text-white transition-colors"
                      placeholder="Feature name..."
                    />
                    <button onClick={() => deleteItem(group.id, ii)} className="text-[#3a3a4a] hover:text-red-400 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {group.items.length === 0 && (
                  <p className="px-4 py-3 text-[12px] text-[#3a3a4a]">No items. Click + Item to add features.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#5a5a72]">{label}</label>
      {children}
    </div>
  );
}
