import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useWorkspace } from '../useWorkspace.js';
import TaskForm from '../components/TaskForm.jsx';
import TaskTree from '../components/TaskTree.jsx';
import { Empty, Modal, RoleTag } from '../ui.jsx';

function ProjectForm({ teams, onDone, onClose }) {
  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/projects', { teamId, name, description }); onDone(); }
    catch (err) { setError(err.message); }
  };
  return (
    <Modal title="Create project" onClose={onClose}>
      <form onSubmit={submit}>
        <label>Team<select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label>Project name<input value={name} onChange={(e) => setName(e.target.value)} required autoFocus /></label>
        <label>Description<textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button className="primary">Create project</button>
        </div>
      </form>
    </Modal>
  );
}

export default function MyProjects() {
  const { user } = useAuth();
  const { teams, projects, loading, error: loadError, reload } = useWorkspace();
  const [selectedId, setSelectedId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(null);       // { parentTask? } when the task form is open
  const [summarizing, setSummarizing] = useState(false);

  const selected = projects.find((p) => p.id === selectedId);
  const ledTeams = teams.filter((t) => t.members.some((m) => m.role === 'LEADER' && m.userId === user.id));

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/projects/${selectedId}/tasks`).then(setTasks).catch((e) => setError(e.message));
  }, [selectedId, projects]);

  const select = (id) => { setSelectedId(id); setSummary(''); setError(''); };
  const summarize = async () => {
    setSummarizing(true);
    try { setSummary((await api.get(`/ai/projects/${selectedId}/summary`)).summary); setError(''); }
    catch (e) { setError(e.message); }
    finally { setSummarizing(false); }
  };

  if (loading) return <p className="hint">Loading…</p>;

  return (
    <>
      <header className="page-head">
        <h1>My projects</h1>
        {ledTeams.length > 0 && <button className="primary" onClick={() => setCreating(true)}>Create project</button>}
      </header>
      {(loadError || error) && <p className="error" role="alert">{loadError || error}</p>}
      {projects.length === 0 && <Empty title="No projects yet">A team leader can create a project for their team.</Empty>}

      <div className="split">
        <ul className="plain projects">
          {projects.map((p) => {
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
            return (
              <li key={p.id}>
                <button className={`project ${p.id === selectedId ? 'on' : ''}`} onClick={() => select(p.id)}>
                  <span className="title">{p.name}</span>
                  <span className="meta">{p.teamName} · {p.done}/{p.total} done</span>
                  <span className="rail" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
                </button>
              </li>
            );
          })}
        </ul>

        {selected && (
          <section className="card">
            <div className="card-head">
              <div>
                <h2>{selected.name}</h2>
                <p className="hint">{selected.description || 'No description'}</p>
                <RoleTag role={selected.myRole} />
              </div>
              <div className="actions">
                <button onClick={summarize} disabled={summarizing}>{summarizing ? 'Summarizing…' : 'Summarize with AI'}</button>
                <button className="primary" onClick={() => setAdding({})}>Add task</button>
              </div>
            </div>
            {summary && <p className="summary">{summary}</p>}
            {tasks.length === 0
              ? <Empty title="No tasks in this project">Add the first task to get started.</Empty>
              : <TaskTree tasks={tasks} role={selected.myRole} onChange={reload}
                  onAddSubtask={(t) => setAdding({ parentTask: t })} onError={setError} />}
          </section>
        )}
      </div>

      {creating && <ProjectForm teams={ledTeams} onClose={() => setCreating(false)} onDone={() => { setCreating(false); reload(); }} />}
      {adding && <TaskForm projects={projects} teams={teams} presetProjectId={selectedId} parentTask={adding.parentTask}
        onClose={() => setAdding(null)} onDone={() => { setAdding(null); reload(); }} />}
    </>
  );
}
