import React from 'react';
import './Badge.css';

const statusConfig = {
  planning:    { label: 'Planning',    color: 'neutral' },
  active:      { label: 'Active',      color: 'success' },
  'on-hold':   { label: 'On Hold',     color: 'warning' },
  completed:   { label: 'Completed',   color: 'info' },
  archived:    { label: 'Archived',    color: 'neutral' },
  todo:        { label: 'To Do',       color: 'neutral' },
  'in-progress': { label: 'In Progress', color: 'info' },
  review:      { label: 'Review',      color: 'warning' },
  done:        { label: 'Done',        color: 'success' },
};

const priorityConfig = {
  low:      { label: 'Low',      color: 'low' },
  medium:   { label: 'Medium',   color: 'medium' },
  high:     { label: 'High',     color: 'high' },
  critical: { label: 'Critical', color: 'critical' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, color: 'neutral' };
  return <span className={`badge badge--status badge--${config.color}`}>{config.label}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || { label: priority, color: 'medium' };
  return <span className={`badge badge--priority badge--priority-${config.color}`}>{config.label}</span>;
};

export const Badge = ({ children, color = 'neutral', size = 'md' }) => (
  <span className={`badge badge--${color} badge--size-${size}`}>{children}</span>
);

export default Badge;