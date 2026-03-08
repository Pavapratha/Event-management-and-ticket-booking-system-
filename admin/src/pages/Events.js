import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/admin/events');
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/api/admin/events/${deleteModal._id}`);
      setEvents((prev) => prev.filter((e) => e._id !== deleteModal._id));
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleDownloadReport = async (eventId, format) => {
    try {
      const endpoint = format === 'pdf' 
        ? `/api/admin/events/${eventId}/download-pdf`
        : `/api/admin/events/${eventId}/download-csv`;
      
      const response = await api.get(endpoint, {
        responseType: format === 'pdf' ? 'arraybuffer' : 'blob',
      });

      // Create blob and download
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to download ${format.toUpperCase()} report`);
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const map = { active: 'badge-success', cancelled: 'badge-danger', completed: 'badge-gray' };
    return map[status] || 'badge-gray';
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Events</h1>
          <p className="page-subtitle">{events.length} events total</p>
        </div>
        <Link to="/admin/events/add" className="btn btn-primary">
          + Add New Event
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Events</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '240px' }}
          />
        </div>
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎪</div>
              <div className="empty-state-text">No events found</div>
              <div className="empty-state-hint">
                <Link to="/admin/events/add" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                  Create your first event
                </Link>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Tickets Sold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr key={event._id}>
                    <td>
                      {event.image ? (
                        <img
                          src={`${API_BASE}${event.image}`}
                          alt={event.title}
                          style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 52, height: 40, background: 'var(--gray-100)',
                            borderRadius: 6, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 18,
                          }}
                        >
                          🎪
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{event.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{event.category}</div>
                    </td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>{event.location}</td>
                    <td>Rs. {parseFloat(event.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span style={{ color: event.availableSeats < 10 ? 'var(--danger)' : 'inherit' }}>
                        {event.availableSeats}/{event.totalSeats}
                      </span>
                    </td>
                    <td>{event.ticketsSold || 0}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleDownloadReport(event._id, 'csv')}
                          title="Download CSV Report"
                        >
                          📊
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleDownloadReport(event._id, 'pdf')}
                          title="Download PDF Report"
                        >
                          📄
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteModal(event)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Event</span>
              <button className="modal-close" onClick={() => setDeleteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteModal.title}</strong>?</p>
              <p style={{ marginTop: 8, color: 'var(--gray-500)', fontSize: 14 }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
