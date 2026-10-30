import { useState } from 'react';
import { api } from '../api.js';
import { useWorkspace } from '../useWorkspace.js';
import TaskForm from '../components/TaskForm.jsx';
import { Empty, STATUSES, fmtDate, isOverdue } from '../ui.jsx';

export default function MyTasks() {
  const { teams, projects, tasks, loading, error, reload } = useWorkspace();
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState('');

  if (loading) return <p className="hint">Loading…</p>;
  const projectName = (id) => projects.find((p) => p.id === id)?.name;
  const move = async (task, status) => {
    try { await api.patch(`/tasks/${task.id}/status`, { status }); setActionError(''); reload(); }
    catch (e) { setActionError(e.message); }
  };

  return (
    <>
      <header className="page-head">
        <h1>My tasks</h1>
        <button className="primary" onClick={() => setAdding(true)}>Add task</button>
      </header>
      {(error || actionError) && <p className="error" role="alert">{error || actionError}</p>}
      {tasks.length === 0 && <Empty title="No tasks assigned to you">Tasks you create or are given will appear here.</Empty>}

      <div className="board">
        {STATUSES.map(([value, label]) => {
          const col = tasks.filter((t) => t.status === value);
          return (
            <section key={value} className="col">
              <h2><i className={`dot s-${value}`} />{label} <small>{col.length}</small></h2>
              {col.map((t) => (
                <article key={t.id} className="card tile">
                  <span className="title">{t.title}</span>
                  <span className="meta">{projectName(t.projectId)}{t.parentTaskId && ' · subtask'}</span>
                  <span className="meta">
                    <span className={isOverdue(t) ? 'late' : ''}>{fmtDate(t.dueDate)}</span> · {t.priority.toLowerCase()} priority
                  </span>
                  <select aria-label={`Move ${t.title}`} value={t.status} onChange={(e) => move(t, e.target.value)}>
                    {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </article>
              ))}
            </section>
          );
        })}
      </div>

      {adding && <TaskForm projects={projects} teams={teams} onClose={() => setAdding(false)}
        onDone={() => { setAdding(false); reload(); }} />}
    </>
  );
}
