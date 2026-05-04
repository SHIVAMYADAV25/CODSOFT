import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsAPI, getErrorMessage } from '../services/api';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input, { Textarea, Select } from '../ui/Input';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import './Project.css';

const PROJECT_COLORS = [
  '#C8622A', '#4A7C59', '#9B7A2A', '#2A5A8B', '#7A2A7A', '#2A7A7A', '#8B3A3A', '#5A5A8B'
];

const CreateProjectModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '', description: '', status: 'planning', priority: 'medium', color: '#C8622A', dueDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: 'Project name is required' }); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      const { data } = await projectsAPI.create(payload);
      toast.success('Project created!');
      onCreated(data.data.project);
      onClose();
      setForm({ name: '', description: '', status: 'planning', priority: 'medium', color: '#C8622A', dueDate: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>Create Project</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label="Project Name" required value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors({}); }} error={errors.name} placeholder="e.g. Website Redesign" />
        <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
          </Select>
          <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </div>
        <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        <div className="color-picker-group">
          <label className="input-label">Color</label>
          <div className="color-picker-swatches">
            {PROJECT_COLORS.map(c => (
              <button key={c} type="button" className={`color-swatch ${form.color === c ? 'color-swatch--active' : ''}`}
                style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      if (filter.search) params.search = filter.search;
      const { data } = await projectsAPI.getAll(params);
      setProjects(data.data.projects);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  return (
    <div className="page-container fade-in">
      <div className="projects-header">
        <div>
          <h1 className="projects-title">Projects</h1>
          <p className="projects-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)} icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        }>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="search-input" placeholder="Search projects..." value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
        </div>
        <select className="filter-select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
        <select className="filter-select" value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="projects-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="projects-empty">
          <div className="projects-empty__icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <Button variant="primary" onClick={() => setModalOpen(true)}>Create Project</Button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <Link key={p._id} to={`/projects/${p._id}`} className="project-card">
              <div className="project-card__color-bar" style={{ background: p.color || '#C8622A' }} />
              <div className="project-card__body">
                <div className="project-card__header">
                  <h3 className="project-card__name">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                {p.description && <p className="project-card__desc">{p.description}</p>}
                <div className="project-card__meta">
                  <PriorityBadge priority={p.priority} />
                  {p.dueDate && (
                    <span className={`project-card__due ${isPast(new Date(p.dueDate)) && p.status !== 'completed' ? 'overdue' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {format(new Date(p.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                <div className="project-card__footer">
                  <div className="project-card__members">
                    {p.members?.slice(0, 3).map((m, i) => (
                      <div key={m.user?._id || i} className="member-avatar" style={{ zIndex: 10 - i }}>
                        {m.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {p.members?.length > 3 && <div className="member-avatar member-avatar--more">+{p.members.length - 3}</div>}
                  </div>
                  <span className="project-card__updated">
                    Updated {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        onCreated={(p) => setProjects(prev => [p, ...prev])} />
    </div>
  );
};

export default Projects;