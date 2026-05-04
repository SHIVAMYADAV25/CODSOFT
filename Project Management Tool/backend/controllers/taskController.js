const Task = require('../models/Task');
const Project = require('../models/Project');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const taskController = {
  // GET /api/tasks?project=id&status=&assignee=
  async getAll(req, res, next) {
    try {
      const { project, status, priority, assignee, search, sort = '-createdAt', page = 1, limit = 50 } = req.query;

      // Only fetch tasks for projects user has access to
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');

      const projectIds = userProjects.map((p) => p._id);

      const query = { project: { $in: projectIds } };
      if (project) query.project = project;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (assignee) query.assignee = assignee;
      if (search) query.title = { $regex: search, $options: 'i' };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [tasks, total] = await Promise.all([
        Task.find(query)
          .populate('assignee', 'name email')
          .populate('createdBy', 'name email')
          .populate('project', 'name color')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Task.countDocuments(query),
      ]);

      return ApiResponse.success(res, {
        tasks,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/tasks
  async create(req, res, next) {
    try {
      const { title, description, project, assignee, status, priority, dueDate, estimatedHours, tags, checklist } = req.body;

      const proj = await Project.findById(project);
      if (!proj) return ApiResponse.notFound(res, 'Project not found');

      const isMember =
        proj.owner.toString() === req.user._id.toString() ||
        proj.members.some((m) => m.user.toString() === req.user._id.toString());

      if (!isMember) return ApiResponse.forbidden(res, 'You are not a member of this project');

      const task = await Task.create({
        title, description, project, assignee, status, priority,
        dueDate, estimatedHours, tags, checklist,
        createdBy: req.user._id,
      });

      await task.populate('assignee', 'name email');
      await task.populate('createdBy', 'name email');
      await task.populate('project', 'name color');

      logger.info(`Task created: ${title} in project ${proj.name}`);
      return ApiResponse.created(res, { task }, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  },

  // GET /api/tasks/:id
  async getOne(req, res, next) {
    try {
      const task = await Task.findById(req.params.id)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .populate('project', 'name color owner members')
        .populate('comments.author', 'name email');

      if (!task) return ApiResponse.notFound(res, 'Task not found');

      return ApiResponse.success(res, { task });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/tasks/:id
  async update(req, res, next) {
    try {
      const task = await Task.findById(req.params.id).populate('project');
      if (!task) return ApiResponse.notFound(res, 'Task not found');

      const allowed = ['title', 'description', 'assignee', 'status', 'priority', 'dueDate', 'estimatedHours', 'actualHours', 'tags', 'checklist'];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) task[field] = req.body[field];
      });

      await task.save();
      await task.populate('assignee', 'name email');
      await task.populate('createdBy', 'name email');
      await task.populate('project', 'name color');

      return ApiResponse.success(res, { task }, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/tasks/:id
  async delete(req, res, next) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return ApiResponse.notFound(res, 'Task not found');

      await task.deleteOne();
      return ApiResponse.success(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  // POST /api/tasks/:id/comments
  async addComment(req, res, next) {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return ApiResponse.error(res, 'Comment content is required', 400);
      }

      const task = await Task.findById(req.params.id);
      if (!task) return ApiResponse.notFound(res, 'Task not found');

      task.comments.push({ author: req.user._id, content: content.trim() });
      await task.save();
      await task.populate('comments.author', 'name email');

      const newComment = task.comments[task.comments.length - 1];
      return ApiResponse.created(res, { comment: newComment }, 'Comment added');
    } catch (error) {
      next(error);
    }
  },

  // GET /api/tasks/my-tasks
  async getMyTasks(req, res, next) {
    try {
      const tasks = await Task.find({
        assignee: req.user._id,
        status: { $ne: 'done' },
      })
        .populate('project', 'name color')
        .sort('dueDate')
        .limit(20);

      return ApiResponse.success(res, { tasks });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/tasks/dashboard-stats
  async getDashboardStats(req, res, next) {
    try {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');

      const projectIds = userProjects.map((p) => p._id);

      const [totalProjects, taskStats, overdueTasks, recentTasks] = await Promise.all([
        userProjects.length,
        Task.aggregate([
          { $match: { project: { $in: projectIds } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Task.countDocuments({
          project: { $in: projectIds },
          dueDate: { $lt: new Date() },
          status: { $ne: 'done' },
        }),
        Task.find({ project: { $in: projectIds } })
          .populate('project', 'name color')
          .populate('assignee', 'name')
          .sort('-updatedAt')
          .limit(5),
      ]);

      const stats = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
      taskStats.forEach((s) => (stats[s._id] = s.count));

      return ApiResponse.success(res, {
        totalProjects,
        taskStats: stats,
        overdueTasks,
        recentTasks,
        totalTasks: Object.values(stats).reduce((a, b) => a + b, 0),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = taskController;