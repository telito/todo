import { Types } from 'mongoose';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { AppError } from '../utils/errors';

export const toProjectResponse = (project: {
  _id: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: project._id.toString(),
  name: project.name,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
});

export const toTaskResponse = (task: {
  _id: Types.ObjectId;
  description: string;
  projectId: Types.ObjectId;
  finishDate?: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: task._id.toString(),
  description: task.description,
  projectId: task.projectId.toString(),
  finishDate: task.finishDate?.toISOString() ?? null,
  completed: task.completed,
  completedAt: task.completedAt?.toISOString() ?? null,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

export const getProjectsByUser = async (userId: string) => {
  const projects = await Project.find({ userId }).sort({ createdAt: -1 });
  return projects.map(toProjectResponse);
};

export const getProjectById = async (projectId: string, userId: string) => {
  if (!Types.ObjectId.isValid(projectId)) {
    throw new AppError(400, 'Invalid project id');
  }

  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  return toProjectResponse(project);
};

export const createProject = async (userId: string, name: string) => {
  const trimmed = name?.trim();
  if (!trimmed) {
    throw new AppError(400, 'Project name is required');
  }

  const project = await Project.create({ name: trimmed, userId });
  return toProjectResponse(project);
};

export const updateProject = async (projectId: string, userId: string, name: string) => {
  const trimmed = name?.trim();
  if (!trimmed) {
    throw new AppError(400, 'Project name is required');
  }

  const project = await Project.findOneAndUpdate(
    { _id: projectId, userId },
    { name: trimmed },
    { new: true }
  );

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  return toProjectResponse(project);
};

export const deleteProject = async (projectId: string, userId: string) => {
  if (!Types.ObjectId.isValid(projectId)) {
    throw new AppError(400, 'Invalid project id');
  }

  const project = await Project.findOneAndDelete({ _id: projectId, userId });
  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  await Task.deleteMany({ projectId, userId });
};

export const getTasksByProject = async (projectId: string, userId: string) => {
  await getProjectById(projectId, userId);
  const tasks = await Task.find({ projectId, userId }).sort({ createdAt: 1 });
  return tasks.map(toTaskResponse);
};

export const getAllTasksByUser = async (userId: string) => {
  const tasks = await Task.find({ userId }).sort({ createdAt: 1 });
  return tasks.map(toTaskResponse);
};

export const createTask = async (
  userId: string,
  projectId: string,
  description: string,
  finishDate?: string | null
) => {
  await getProjectById(projectId, userId);

  const trimmed = description?.trim();
  if (!trimmed) {
    throw new AppError(400, 'Task description is required');
  }

  let parsedFinishDate: Date | undefined;
  if (finishDate) {
    parsedFinishDate = new Date(finishDate);
    if (Number.isNaN(parsedFinishDate.getTime())) {
      throw new AppError(400, 'Invalid finish date');
    }
  }

  const task = await Task.create({
    description: trimmed,
    projectId,
    userId,
    finishDate: parsedFinishDate,
    completed: false,
  });

  return toTaskResponse(task);
};

export const updateTask = async (
  taskId: string,
  userId: string,
  updates: { description?: string; finishDate?: string | null }
) => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(400, 'Invalid task id');
  }

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (task.completed) {
    throw new AppError(403, 'Completed tasks cannot be edited');
  }

  if (updates.description !== undefined) {
    const trimmed = updates.description.trim();
    if (!trimmed) {
      throw new AppError(400, 'Task description is required');
    }
    task.description = trimmed;
  }

  if (updates.finishDate !== undefined) {
    if (updates.finishDate === null || updates.finishDate === '') {
      task.finishDate = undefined;
    } else {
      const parsed = new Date(updates.finishDate);
      if (Number.isNaN(parsed.getTime())) {
        throw new AppError(400, 'Invalid finish date');
      }
      task.finishDate = parsed;
    }
  }

  await task.save();
  return toTaskResponse(task);
};

export const deleteTask = async (taskId: string, userId: string) => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(400, 'Invalid task id');
  }

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (task.completed) {
    throw new AppError(403, 'Completed tasks cannot be removed');
  }

  await Task.deleteOne({ _id: taskId });
};

export const completeTask = async (taskId: string, userId: string) => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(400, 'Invalid task id');
  }

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (task.completed) {
    return toTaskResponse(task);
  }

  task.completed = true;
  task.completedAt = new Date();
  await task.save();

  return toTaskResponse(task);
};

export const uncompleteTask = async (taskId: string, userId: string) => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(400, 'Invalid task id');
  }

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  if (!task.completed) {
    return toTaskResponse(task);
  }

  task.completed = false;
  task.completedAt = undefined;
  await task.save();

  return toTaskResponse(task);
};
