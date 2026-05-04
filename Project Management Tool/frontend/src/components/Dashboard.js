import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI, projectsAPI, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import './Dashboard.css';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__content">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          tasksAPI.getDashboardStats(),
          projectsAPI.getAll({ limit: 4, sort: '-updatedAt' }),
        ]);
        setStats(statsRes.data.data);
        setProjects(projectsRes.data.data.projects);
      } catch (e) {
        console.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-skeleton">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  const taskTotal = stats?.totalTasks || 0;
  const taskDone = stats?.taskStats?.done || 0;
  const progress = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0;

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-greeting">{greeting},</p>
          <h1 className="dashboard-name">{user?.name?.split(' ')[0]} <span className="dashboard-name-wave">👋</span></h1>
          <p className="dashboard-date">{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
        </div>
        <Link to="/projects/new" className="btn btn--primary btn--md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Projects"
          value={stats?.totalProjects || 0}
          color="accent"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>}
        />
        <StatCard
          label="Total Tasks"
          value={taskTotal}
          color="neutral"
          sub={`${taskDone} completed`}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
        />
        <StatCard
          label="In Progress"
          value={stats?.taskStats?.['in-progress'] || 0}
          color="info"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          label="Overdue"
          value={stats?.overdueTasks || 0}
          color={stats?.overdueTasks > 0 ? 'danger' : 'neutral'}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        />
      </div>

      {/* Progress bar */}
      {taskTotal > 0 && (
        <div className="dashboard-progress">
          <div className="dashboard-progress__header">
            <span className="dashboard-progress__label">Overall Progress</span>
            <span className="dashboard-progress__pct">{progress}%</span>
          </div>
          <div className="dashboard-progress__bar">
            <div className="dashboard-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="dashboard-progress__breakdown">
            {[
              { label: 'To Do', key: 'todo', color: 'var(--color-border)' },
              { label: 'In Progress', key: 'in-progress', color: 'var(--color-info)' },
              { label: 'Review', key: 'review', color: 'var(--color-warning)' },
              { label: 'Done', key: 'done', color: 'var(--color-success)' },
            ].map(({ label, key, color }) => (
              <div key={key} className="dashboard-progress__item">
                <div className="dashboard-progress__dot" style={{ background: color }} />
                <span>{label}: {stats?.taskStats?.[key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-columns">
        {/* Recent Projects */}
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">Recent Projects</h2>
            <Link to="/projects" className="dashboard-section__link">View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="dashboard-empty">
              <p>No projects yet.</p>
              <Link to="/projects" className="btn btn--primary btn--sm">Create your first project</Link>
            </div>
          ) : (
            <div className="project-cards-list">
              {projects.map((p) => (
                <Link key={p._id} to={`/projects/${p._id}`} className="project-mini-card">
                  <div className="project-mini-card__color" style={{ background: p.color || '#C8622A' }} />
                  <div className="project-mini-card__content">
                    <div className="project-mini-card__name">{p.name}</div>
                    <div className="project-mini-card__meta">
                      <StatusBadge status={p.status} />
                      {p.dueDate && (
                        <span className={`project-mini-card__due ${isPast(new Date(p.dueDate)) ? 'overdue' : ''}`}>
                          Due {formatDistanceToNow(new Date(p.dueDate), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="project-mini-card__arrow">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">Recent Tasks</h2>
            <Link to="/tasks" className="dashboard-section__link">View all →</Link>
          </div>
          {!stats?.recentTasks?.length ? (
            <div className="dashboard-empty"><p>No tasks yet.</p></div>
          ) : (
            <div className="recent-tasks-list">
              {stats.recentTasks.map((task) => (
                <Link key={task._id} to={`/tasks/${task._id}`} className="recent-task-item">
                  <div className="recent-task__dot" style={{ background: task.project?.color || '#C8622A' }} />
                  <div className="recent-task__content">
                    <div className="recent-task__title">{task.title}</div>
                    <div className="recent-task__meta">
                      <span className="recent-task__project">{task.project?.name}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;