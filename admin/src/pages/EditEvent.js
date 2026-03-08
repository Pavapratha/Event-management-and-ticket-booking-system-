import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { EventForm } from './AddEvent';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/api/admin/events/${id}`);
        setEvent(res.data.event);
      } catch (err) {
        console.error(err);
        navigate('/admin/events');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleSubmit = async (formData, setError) => {
    setLoading(true);
    try {
      await api.put(`/api/admin/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/admin/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Event</h1>
          <p className="page-subtitle">{event?.title}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/events')}>
          ← Back
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {event && (
            <EventForm
              initialData={event}
              onSubmit={handleSubmit}
              submitLabel="Update Event"
              loading={loading}
            />
          )}
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

export default EditEvent;
