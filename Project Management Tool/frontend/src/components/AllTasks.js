import React, { useEffect, useState } from 'react';
import { tasksAPI, getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import './Tasks.css';

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    try {
      const { data } = await tasksAPI.getAll();
      setTasks(data.data.tasks);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">All Tasks</h1>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task._id} className="task-card">
            <div className="task-title">{task.title}</div>

            <div className="task-meta">
              <span className={`badge badge--${task.status}`}>
                {task.status}
              </span>
              <span className={`badge badge--${task.priority}`}>
                {task.priority}
              </span>
            </div>

            <div className="task-project">
              {task.project?.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllTasks;