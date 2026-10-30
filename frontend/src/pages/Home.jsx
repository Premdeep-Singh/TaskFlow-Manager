import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { useWorkspace } from '../useWorkspace.js';
import TaskForm from '../components/TaskForm.jsx';
import { Empty, STATUSES, fmtDate, isOverdue } from '../ui.jsx';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Home() {
  const { user } = useAuth();
  const { teams, projects, tasks, loading, error, reload } = useWorkspace();
  const [adding, setAdding] = useState(false);

  if (loading) return <p className="hint">Loading…</p>;
  const counts = Object.fromEntries(STATUSES.map(([v]) => [v, tasks.filter((t) => t.status === v).length]));
  const open = tasks.filter((t) => t.status !== 'DONE');
  const upNext = [...open].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).slice(0, 6);
  const projectName = (id) => projects.find((p) => p.id === id)?.name;

  return (
    <>
      <header className="page-head">
        <h1>{greeting()}, {user.name.split(' ')[0]}</h1>
        <button className="primary" onClick={() => setAdding(true)}>Add task</button>
      </header>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>{open.length === 0 ? 'Nothing open right now' : `${open.length} open ${open.length === 1 ? 'task' : 'tasks'} assigned to you`}</h2>
        <div className="stack" role="img" aria-label={STATUSES.map(([v, l]) => `${counts[v]} ${l}`).join(', ')}>
          {STATUSES.map(([v]) => counts[v] > 0 && <span key={v} className={`seg s-${v}`} style={{ flexGrow: counts[v] }} />)}
        </div>
        <div className="legend">
          {STATUSES.map(([v, l]) => <span key={v}><i className={`dot s-${v}`} />{counts[v]} {l.toLowerCase()}</span>)}
        </div>
      </section>

      <div className="two">
        <section className="card">
          <h2>Up next</h2>
          {upNext.length === 0
            ? <Empty title="You're all caught up">New work assigned to you will show here.</Empty>
            : <ul className="plain">{upNext.map((t) => (
                <li key={t.id}>
                  <span className="title">{t.title}</span>
                  <span className="meta">{projectName(t.projectId)} · <span className={isOverdue(t) ? 'late' : ''}>{fmtDate(t.dueDate)}</span></span>
                </li>))}</ul>}
          <Link to="/tasks">See all my tasks</Link>
        </section>
        <section className="card">
          <h2>Your workspace</h2>
          <p className="big">{teams.length}<small> {teams.length === 1 ? 'team' : 'teams'}</small></p>
          <p className="big">{projects.length}<small> {projects.length === 1 ? 'project' : 'projects'}</small></p>
          <Link to="/teams">Manage teams</Link>
          <Link to="/projects">Open projects</Link>
        </section>
      </div>

      {adding && <TaskForm projects={projects} teams={teams} onClose={() => setAdding(false)}
        onDone={() => { setAdding(false); reload(); }} />}
    </>
  );
}
