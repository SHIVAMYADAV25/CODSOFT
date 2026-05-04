import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectsAPI, tasksAPI, getErrorMessage } from '../services/api';

import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input, { Textarea, Select } from '../ui/Input';

import toast from 'react-hot-toast';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
  });

  // LOAD DATA
  const loadProject = async () => {
    try {
      const [projectRes, statsRes, tasksRes] = await Promise.all([
        projectsAPI.getOne(id),
        projectsAPI.getStats(id),
        tasksAPI.getAll({ project: id }),
      ]);

      setProject(projectRes.data.data.project);
      setStats(statsRes.data.data);
      setTasks(tasksRes.data.data.tasks);

    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  // CREATE TASK
  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      return toast.error('Task title required');
    }

    try {
      const { data } = await tasksAPI.create({
        ...taskForm,
        project: id,
      });

      setTasks(prev => [data.data.task, ...prev]);
      setShowModal(false);

      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
      });

      toast.success('Task created!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // DELETE
  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // UPDATE STATUS
  const handleStatusChange = async (task, newStatus) => {
    try {
      const { data } = await tasksAPI.update(task._id, {
        ...task,
        status: newStatus,
      });

      setTasks(prev =>
        prev.map(t => (t._id === task._id ? data.data.task : t))
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;
  if (!project) return <div className="page-container">Project not found</div>;

  return (
    <div className="page-container project-detail fade-in">

      {/* HEADER */}
      <div className="project-detail__header">
        <div>
          <h1 className="project-detail__title">{project.name}</h1>
          <p className="project-detail__desc">{project.description}</p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          + Add Task
        </Button>
      </div>

      {/* META */}
      <div className="project-detail__meta">
        <span>Status: {project.status}</span>
        <span>Priority: {project.priority}</span>
        {project.dueDate && (
          <span>Due: {new Date(project.dueDate).toDateString()}</span>
        )}
      </div>

      {/* STATS */}
      <div className="project-detail__stats">
        <div className="stat-box">
          <span>Total</span>
          <strong>{stats?.totalTasks || 0}</strong>
        </div>
        <div className="stat-box">
          <span>Done</span>
          <strong>{stats?.completedTasks || 0}</strong>
        </div>
        <div className="stat-box">
          <span>Pending</span>
          <strong>{stats?.pendingTasks || 0}</strong>
        </div>
      </div>

      {/* TASK LIST */}
      <div className="project-detail__section">
        <h2>Tasks</h2>

        {tasks.length === 0 ? (
          <p>No tasks yet</p>
        ) : (
          <div className="task-list">
            {tasks.map(task => (
              <div key={task._id} className="task-card">

                <div className="task-header">
                  <span className="task-title">{task.title}</span>

                  <button
                    className="task-delete"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    ✕
                  </button>
                </div>

                <div className="task-meta">
                  <span className={`badge badge--${task.status}`}>
                    {task.status}
                    </span>

                    <span className={`badge badge--${task.priority}`}>
                    {task.priority}
                    </span>
                </div>

                <div className="task-actions">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Task"
        footer={<Button onClick={handleCreateTask}>Create</Button>}
      >
        <Input
          label="Title"
          value={taskForm.title}
          onChange={(e) => setTaskForm(f => ({ ...f, title: e.target.value }))}
        />

        <Textarea
          label="Description"
          value={taskForm.description}
          onChange={(e) => setTaskForm(f => ({ ...f, description: e.target.value }))}
        />

        <Select
          label="Priority"
          value={taskForm.priority}
          onChange={(e) => setTaskForm(f => ({ ...f, priority: e.target.value }))}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>

        <Select
          label="Status"
          value={taskForm.status}
          onChange={(e) => setTaskForm(f => ({ ...f, status: e.target.value }))}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
      </Modal>

    </div>
  );
};

export default ProjectDetail;