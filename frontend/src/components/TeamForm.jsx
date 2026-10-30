import { useState } from 'react';
import { api } from '../api.js';
import { Modal } from '../ui.jsx';

/** Create team form: the creator becomes the team leader. */
export default function TeamForm({ onDone, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.post('/teams', { name, description }); onDone(); }
    catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <Modal title="Create team" onClose={onClose}>
      <form onSubmit={submit}>
        <label>Team name<input value={name} onChange={(e) => setName(e.target.value)} required autoFocus /></label>
        <label>Description<textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <p className="hint">You'll be the team leader and can add members afterwards.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button className="primary" disabled={busy}>Create team</button>
        </div>
      </form>
    </Modal>
  );
}
