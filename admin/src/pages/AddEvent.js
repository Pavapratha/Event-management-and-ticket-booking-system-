import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = ['Music', 'Sports', 'Technology', 'Food & Drink', 'Arts', 'Business', 'Education', 'Other'];

function EventForm({ initialData = {}, onSubmit, submitLabel = 'Save Event', loading }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    time: initialData.time || '',
    location: initialData.location || '',
    price: initialData.price || '',
    totalSeats: initialData.totalSeats || '',
    status: initialData.status || 'active',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initialData.image ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${initialData.image}` : null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Max 5MB');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.date || !form.time || !form.location || !form.price || !form.totalSeats) {
      setError('Please fill in all required fields');
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append('image', image);
    await onSubmit(formData, setError);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Event Name *</label>
          <input name="title" className="form-control" value={form.title} onChange={handleChange} placeholder="Enter event name" />
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <select name="category" className="form-control" value={form.category} onChange={handleChange}>
            <option value="">Select Category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group form-full">
          <label className="form-label">Description *</label>
          <textarea name="description" className="form-control" value={form.description} onChange={handleChange} placeholder="Describe your event" />
        </div>

        <div className="form-group">
          <label className="form-label">Date *</label>
          <input type="date" name="date" className="form-control" value={form.date} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Time *</label>
          <input type="time" name="time" className="form-control" value={form.time} onChange={handleChange} />
        </div>

        <div className="form-group form-full">
          <label className="form-label">Location *</label>
          <input name="location" className="form-control" value={form.location} onChange={handleChange} placeholder="Venue name and address" />
        </div>

        <div className="form-group">
          <label className="form-label">Ticket Price (USD) *</label>
          <input type="number" name="price" className="form-control" value={form.price} onChange={handleChange} min="0" step="0.01" placeholder="0.00" />
        </div>

        <div className="form-group">
          <label className="form-label">Total Seats *</label>
          <input type="number" name="totalSeats" className="form-control" value={form.totalSeats} onChange={handleChange} min="1" placeholder="100" />
        </div>

        {initialData._id && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-control" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        <div className="form-group form-full">
          <label className="form-label">Event Image</label>
          <div className="image-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              id="event-image"
              style={{ display: 'none' }}
            />
            <label htmlFor="event-image" className="image-upload-label">
              <span>📷</span>
              <span>Click to upload image (max 5MB)</span>
            </label>
            {preview && (
              <div className="image-preview-wrapper">
                <img src={preview} alt="Preview" className="img-preview" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? <><span className="btn-spinner"></span> Saving...</> : submitLabel}
        </button>
      </div>
    </form>
  );
}

function AddEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData, setError) => {
    setLoading(true);
    try {
      await api.post('/api/admin/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/admin/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add New Event</h1>
          <p className="page-subtitle">Create a new event for your platform</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/events')}>
          ← Back
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <EventForm onSubmit={handleSubmit} submitLabel="Create Event" loading={loading} />
        </div>
      </div>

      <style>{`
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-full { grid-column: 1 / -1; }
        .form-actions { margin-top: 24px; display: flex; gap: 12px; }
        .image-upload-area { border: 2px dashed var(--gray-300); border-radius: var(--radius); padding: 20px; }
        .image-upload-label {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          cursor: pointer; color: var(--gray-500); font-size: 14px; padding: 20px;
        }
        .image-upload-label:hover { color: var(--primary); }
        .image-upload-label span:first-child { font-size: 32px; }
        .image-preview-wrapper { margin-top: 12px; }
        @media(max-width:768px){.form-grid{grid-template-columns:1fr;}}
      `}</style>
    </div>
  );
}

export { EventForm };
export default AddEvent;
