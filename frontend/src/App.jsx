import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Auth from './pages/Auth.jsx';
import Home from './pages/Home.jsx';
import MyTeams from './pages/MyTeams.jsx';
import MyProjects from './pages/MyProjects.jsx';
import MyTasks from './pages/MyTasks.jsx';

function Shell() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="shell">
      <nav className="side" aria-label="Main">
        <div className="brand">TaskHub</div>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/teams">My teams</NavLink>
        <NavLink to="/projects">My projects</NavLink>
        <NavLink to="/tasks">My tasks</NavLink>
        <div className="who">
          <span>{user.name}</span>
          <button className="ghost" onClick={logout}>Sign out</button>
        </div>
      </nav>
      <main className="main"><Outlet /></main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="teams" element={<MyTeams />} />
        <Route path="projects" element={<MyProjects />} />
        <Route path="tasks" element={<MyTasks />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
