const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const projectController = {
  // GET /api/projects
  async getAll(req, res, next) {
    try {
      const { status, priority, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

      const query = {
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id },
        ],
        isArchived: false,
      };

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (search) query.name = { $regex: search, $options: 'i' };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [projects, total] = await Promise.all([
        Project.find(query)
          .populate('owner', 'name email')
          .populate('members.user', 'name email')
          .populate('taskCount')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Project.countDocuments(query),
      ]);

      return ApiResponse.success(res, {
        projects,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/projects
  async create(req, res, next) {
    try {
      const { name, description, status, priority, color, dueDate, startDate, tags } = req.body;

      const project = await Project.create({
        name,
        description,
        status,
        priority,
        color,
        dueDate,
        startDate,
        tags,
        owner: req.user._id,
        members: [{ user: req.user._id, role: 'admin' }],
      });

      await project.populate('owner', 'name email');

      logger.info(`Project created: ${name} by ${req.user.email}`);
      return ApiResponse.created(res, { project }, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  },

  // GET /api/projects/:id
  async getOne(req, res, next) {
    try {
      const project = await Project.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members.user', 'name email')
        .populate('taskCount');

      if (!project) return ApiResponse.notFound(res, 'Project not found');

      const isMember =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((m) => m.user._id.toString() === req.user._id.toString());

      if (!isMember) return ApiResponse.forbidden(res, 'Access denied');

      return ApiResponse.success(res, { project });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/projects/:id
  async update(req, res, next) {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return ApiResponse.notFound(res, 'Project not found');

      const isOwnerOrAdmin =
        project.owner.toString() === req.user._id.toString() ||
        project.members.some(
          (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
        );

      if (!isOwnerOrAdmin) return ApiResponse.forbidden(res, 'Only project admins can update projects');

      const allowed = ['name', 'description', 'status', 'priority', 'color', 'dueDate', 'startDate', 'tags'];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) project[field] = req.body[field];
      });

      await project.save();
      await project.populate('owner', 'name email');
      await project.populate('members.user', 'name email');

      return ApiResponse.success(res, { project }, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/projects/:id
  async delete(req, res, next) {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return ApiResponse.notFound(res, 'Project not found');

      if (project.owner.toString() !== req.user._id.toString()) {
        return ApiResponse.forbidden(res, 'Only the project owner can delete this project');
      }

      await Task.deleteMany({ project: project._id });
      await project.deleteOne();

      logger.info(`Project deleted: ${project.name} by ${req.user.email}`);
      return ApiResponse.success(res, null, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  // GET /api/projects/:id/stats
  async getStats(req, res, next) {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return ApiResponse.notFound(res, 'Project not found');

      const taskStats = await Task.aggregate([
        { $match: { project: project._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const stats = { todo: 0, 'in-progress': 0, review: 0, done: 0, total: 0 };
      taskStats.forEach((s) => {
        stats[s._id] = s.count;
        stats.total += s.count;
      });
      stats.progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

      // Overdue tasks
      stats.overdue = await Task.countDocuments({
        project: project._id,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' },
      });

      return ApiResponse.success(res, { stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = projectController;