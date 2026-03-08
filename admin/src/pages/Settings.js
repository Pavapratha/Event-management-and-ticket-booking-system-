import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Section({ title, icon, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span> {title}
        </span>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <div
        onClick={onChange}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: checked ? 'var(--primary)' : 'var(--gray-300)',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3,
          left: checked ? 23 : 3, transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      <span style={{ fontSize: 14, color: 'var(--gray-700)', fontWeight: 500 }}>{label}</span>
    </label>
  );
}

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/admin/settings')
      .then((res) => setSettings(res.data.settings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/api/admin/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!settings) return <div className="empty-state"><div className="empty-state-icon">⚙️</div><div className="empty-state-text">Failed to load settings</div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your platform configuration</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {saved && <div className="alert alert-success">✅ Settings saved successfully!</div>}

      {/* General Settings */}
      <Section title="General Settings" icon="🌐">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Site Name</label>
            <input
              className="form-control"
              value={settings.siteName || ''}
              onChange={(e) => update('siteName', e.target.value)}
              placeholder="EventHub"
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Contact Email</label>
            <input
              type="email"
              className="form-control"
              value={settings.contactEmail || ''}
              onChange={(e) => update('contactEmail', e.target.value)}
              placeholder="admin@eventhub.com"
            />
          </div>
          <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
            <label className="form-label">Site Description</label>
            <textarea
              className="form-control"
              value={settings.siteDescription || ''}
              onChange={(e) => update('siteDescription', e.target.value)}
              placeholder="Your one-stop destination for event tickets"
              style={{ minHeight: 72, resize: 'vertical' }}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Support Phone</label>
            <input
              className="form-control"
              value={settings.supportPhone || ''}
              onChange={(e) => update('supportPhone', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Currency</label>
            <select
              className="form-control"
              value={settings.currency || 'USD'}
              onChange={(e) => update('currency', e.target.value)}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
              <option value="PHP">PHP — Philippine Peso</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Booking Settings */}
      <Section title="Booking Settings" icon="🎟️">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Max Tickets Per Booking</label>
            <input
              type="number"
              className="form-control"
              value={settings.maxTicketsPerBooking || 10}
              min={1}
              max={100}
              onChange={(e) => update('maxTicketsPerBooking', parseInt(e.target.value) || 1)}
            />
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
              Maximum number of tickets a user can book at once.
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Timezone</label>
            <select
              className="form-control"
              value={settings.timezone || 'UTC'}
              onChange={(e) => update('timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (US)</option>
              <option value="America/Chicago">Central Time (US)</option>
              <option value="America/Los_Angeles">Pacific Time (US)</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Manila">Manila (Philippines)</option>
              <option value="Asia/Singapore">Singapore</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </Section>

      {/* System Settings */}
      <Section title="System Settings" icon="🛠️">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
            <Toggle
              checked={!!settings.maintenanceMode}
              onChange={() => update('maintenanceMode', !settings.maintenanceMode)}
              label="Maintenance Mode"
            />
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6, marginLeft: 56 }}>
              When enabled, the public-facing site will show a maintenance message.
            </p>
            {settings.maintenanceMode && (
              <div className="alert alert-warning" style={{ marginTop: 10, marginBottom: 0 }}>
                ⚠️ Maintenance mode is ON. Users cannot access the public site.
              </div>
            )}
          </div>

          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
            <Toggle
              checked={settings.allowRegistrations !== false}
              onChange={() => update('allowRegistrations', !settings.allowRegistrations)}
              label="Allow New User Registrations"
            />
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6, marginLeft: 56 }}>
              When disabled, new users will not be able to create accounts.
            </p>
          </div>
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="Site Logo" icon="🖼️">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 16,
            border: '2px dashed var(--gray-300)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 8 }}>
              Current logo: <strong>logo.png</strong>
            </p>
            <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
              To update the logo, replace <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>frontend/public/logo.png</code> and <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>admin/public/logo.png</code> with your new image, then rebuild the application.
            </p>
          </div>
        </div>
      </Section>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  );
}

export default Settings;
