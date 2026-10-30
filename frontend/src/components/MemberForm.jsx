import { useState } from 'react';
import { api } from '../api.js';
import { Modal, ROLE_LABEL } from '../ui.jsx';

/** Add member form: the person must already have a TaskHub account. */
export default function MemberForm({ team, onDone, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('JUNIOR');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.post(`/teams/${team.id}/members`, { email, role }); onDone(); }
    catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <Modal title={`Add member to ${team.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></label>
        <label>Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button className="primary" disabled={busy}>Add member</button>
        </div>
      </form>
    </Modal>
  );
}
