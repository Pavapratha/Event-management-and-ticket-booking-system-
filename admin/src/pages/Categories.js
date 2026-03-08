import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PRESET_ICONS = ['🎵', '⚽', '💻', '🍕', '🎨', '💼', '📚', '🎪', '🎭', '🏋️', '🎬', '🌿', '🏖️', '🎮', '🎤'];
const PRESET_COLORS = ['#ff6b00', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6b7280', '#14b8a6', '#ef4444', '#a78bfa'];

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CategoryForm({ initial = {}, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    icon: initial.icon || '🎪',
    color: initial.color || '#ff6b00',
    isActive: initial.isActive !== false,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    await onSave(form, setError);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Category Name *</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Music, Sports..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Icon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {PRESET_ICONS.map((ic) => (
              <button
                key={ic} type="button"
                onClick={() => setForm({ ...form, icon: ic })}
                style={{
                  fontSize: 22, padding: '6px 8px', border: '2px solid',
                  borderColor: form.icon === ic ? 'var(--primary)' : 'var(--gray-200)',
                  borderRadius: 8, background: form.icon === ic ? 'var(--primary-pale)' : 'white',
                  cursor: 'pointer',
                }}
              >{ic}</button>
            ))}
          </div>
          <input
            className="form-control"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="Custom emoji or icon"
            style={{ marginTop: 4 }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c} type="button"
                onClick={() => setForm({ ...form, color: c })}
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: c,
                  border: form.color === c ? '3px solid var(--gray-800)' : '2px solid transparent',
                  cursor: 'pointer', boxShadow: form.color === c ? '0 0 0 2px white inset' : 'none',
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            style={{ width: 48, height: 36, border: '1px solid var(--gray-300)', borderRadius: 6, cursor: 'pointer' }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
            />
            <span className="form-label" style={{ margin: 0 }}>Active (visible in event forms)</span>
          </label>
        </div>

        {/* Preview */}
        <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: form.color + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>{form.icon}</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{form.name || 'Category Name'}</div>
            <div style={{ fontSize: 12, color: form.color, fontWeight: 500 }}>Active</div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/admin/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (form, setError) => {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/api/admin/categories/${editTarget._id}`, form);
        setCategories((prev) => prev.map((c) => c._id === editTarget._id ? res.data.category : c));
      } else {
        const res = await api.post('/api/admin/categories', form);
        setCategories((prev) => [...prev, res.data.category]);
      }
      setShowModal(false);
      setEditTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openEdit = (cat) => { setEditTarget(cat); setShowModal(true); };
  const openAdd = () => { setEditTarget(null); setShowModal(true); };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Categories</h1>
          <p className="page-subtitle">{categories.length} categories configured</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
      </div>

      {/* Category cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {categories.map((cat) => (
          <div key={cat._id} className="card" style={{ overflow: 'visible' }}>
            <div style={{ padding: '20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: cat.color + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                }}>{cat.icon}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(cat)} title="Edit">✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(cat._id)} title="Delete">🗑️</button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)', marginBottom: 4 }}>{cat.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{cat.color}</span>
                <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-gray'}`} style={{ marginLeft: 'auto' }}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">🏷️</div>
            <div className="empty-state-text">No categories yet</div>
            <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: 12 }}>Add First Category</button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editTarget ? 'Edit Category' : 'Add New Category'}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        >
          <CategoryForm
            initial={editTarget || {}}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditTarget(null); }}
            saving={saving}
          />
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <Modal title="Delete Category" onClose={() => setDeleteId(null)}>
          <div className="modal-body">
            <p style={{ color: 'var(--gray-700)' }}>
              Are you sure you want to delete this category? Events using this category will retain their value but the category won't appear in new event forms.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Categories;
