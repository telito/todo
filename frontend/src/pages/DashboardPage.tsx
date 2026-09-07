import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AppHeader } from '../components/AppHeader';
import { CreateProjectCard } from '../components/CreateProjectCard';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectEditDialog } from '../components/ProjectEditDialog';
import { TaskEditDialog } from '../components/TaskEditDialog';
import { TaskInsightsDialog } from '../components/TaskInsightsDialog';
import * as projectsApi from '../api/projects';
import * as tasksApi from '../api/tasks';
import * as aiApi from '../api/ai';
import { ApiError, Project, Task } from '../types';

export const DashboardPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [insightsTask, setInsightsTask] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsResponse, tasksResponse] = await Promise.all([
        projectsApi.fetchProjects(),
        tasksApi.fetchTasks(),
      ]);
      setProjects(projectsResponse.projects);
      setTasks(tasksResponse.tasks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tasksByProject = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const list = map.get(task.projectId) ?? [];
      list.push(task);
      map.set(task.projectId, list);
    }
    return map;
  }, [tasks]);

  const showError = (err: unknown, fallback: string) => {
    setSnackbar(err instanceof ApiError ? err.message : fallback);
  };

  const handleCreateProject = async (name: string) => {
    try {
      const { project } = await projectsApi.createProject(name);
      setProjects((prev) => [project, ...prev]);
      setSnackbar('Project created');
    } catch (err) {
      showError(err, 'Failed to create project');
    }
  };

  const handleEditProject = async (project: Project, name: string) => {
    try {
      const { project: updated } = await projectsApi.updateProject(project.id, name);
      setProjects((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSnackbar('Project updated');
    } catch (err) {
      showError(err, 'Failed to update project');
    }
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      await projectsApi.deleteProject(project.id);
      setProjects((prev) => prev.filter((item) => item.id !== project.id));
      setTasks((prev) => prev.filter((item) => item.projectId !== project.id));
      setSnackbar('Project deleted');
    } catch (err) {
      showError(err, 'Failed to delete project');
    }
  };

  const handleAddTask = async (projectId: string, description: string) => {
    try {
      const { task } = await tasksApi.createTask(projectId, description);
      setTasks((prev) => [...prev, task]);
      setSnackbar('Task added');
    } catch (err) {
      showError(err, 'Failed to add task');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const { task: updated } = task.completed
        ? await tasksApi.uncompleteTask(task.id)
        : await tasksApi.completeTask(task.id);
      setTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      showError(err, 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      await tasksApi.deleteTask(task.id);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
      setSnackbar('Task deleted');
    } catch (err) {
      showError(err, 'Failed to delete task');
    }
  };

  const handleSaveTask = async (task: Task, description: string, finishDate: string | null) => {
    try {
      const { task: updated } = await tasksApi.updateTask(task.id, { description, finishDate });
      setTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSnackbar('Task updated');
    } catch (err) {
      showError(err, 'Failed to update task');
      throw err;
    }
  };

  const handleImproveDescription = async (title: string, roughDescription: string) => {
    const result = await aiApi.improveDescription(title, roughDescription);
    setSnackbar(
      result.source === 'openai'
        ? 'AI suggestion applied'
        : 'AI unavailable — local suggestion applied'
    );
    return result.description;
  };

  const handleFetchInsights = async (description: string, finishDate: string | null) =>
    aiApi.getTaskInsights(description, finishDate);

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <AppHeader />
      <Box p={{ xs: 2, md: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={2}>
            {projects.map((project) => (
              <Grid key={project.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <ProjectCard
                  project={project}
                  tasks={tasksByProject.get(project.id) ?? []}
                  onEditProject={setEditingProject}
                  onDeleteProject={handleDeleteProject}
                  onAddTask={handleAddTask}
                  onToggleComplete={handleToggleComplete}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={setEditingTask}
                  onInsights={setInsightsTask}
                  onImproveDescription={handleImproveDescription}
                />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <CreateProjectCard onCreate={handleCreateProject} />
            </Grid>
          </Grid>
        )}
      </Box>

      <ProjectEditDialog
        open={Boolean(editingProject)}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleEditProject}
      />

      <TaskEditDialog
        open={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onImproveDescription={handleImproveDescription}
      />

      <TaskInsightsDialog
        open={Boolean(insightsTask)}
        task={insightsTask}
        onClose={() => setInsightsTask(null)}
        onFetchInsights={handleFetchInsights}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
      />
    </Box>
  );
};
