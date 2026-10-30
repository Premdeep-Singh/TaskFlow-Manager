import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useWorkspace } from '../useWorkspace.js';
import TeamForm from '../components/TeamForm.jsx';
import MemberForm from '../components/MemberForm.jsx';
import { Empty, RoleTag, roleIn } from '../ui.jsx';

export default function MyTeams() {
  const { user } = useAuth();
  const { teams, loading, error, reload } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [addingTo, setAddingTo] = useState(null);

  if (loading) return <p className="hint">Loading…</p>;
  const done = () => { setCreating(false); setAddingTo(null); reload(); };

  return (
    <>
      <header className="page-head">
        <h1>My teams</h1>
        <button className="primary" onClick={() => setCreating(true)}>Create team</button>
      </header>
      {error && <p className="error">{error}</p>}
      {teams.length === 0 && <Empty title="You're not on a team yet">Create one to start adding members and projects.</Empty>}

      {teams.map((t) => (
        <section className="card" key={t.id}>
          <div className="card-head">
            <div>
              <h2>{t.name}</h2>
              {t.description && <p className="hint">{t.description}</p>}
            </div>
            {roleIn(t, user.id) === 'LEADER' && <button onClick={() => setAddingTo(t)}>Add member</button>}
          </div>
          <ul className="plain members">
            {t.members.map((m) => (
              <li key={m.userId}>
                <span className="title">{m.name}{m.userId === user.id && ' (you)'}</span>
                <span className="meta">{m.email}</span>
                <RoleTag role={m.role} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {creating && <TeamForm onClose={() => setCreating(false)} onDone={done} />}
      {addingTo && <MemberForm team={addingTo} onClose={() => setAddingTo(null)} onDone={done} />}
    </>
  );
}
