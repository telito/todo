import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Tooltip,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { FormEvent, useState } from 'react';
import { Project, Task } from '../types';
import { TaskList } from './TaskList';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onAddTask: (projectId: string, description: string) => Promise<void>;
  onToggleComplete: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onInsights: (task: Task) => void;
  onImproveDescription: (title: string, roughDescription: string) => Promise<string>;
}

export const ProjectCard = ({
  project,
  tasks,
  onEditProject,
  onDeleteProject,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onInsights,
  onImproveDescription,
}: ProjectCardProps) => {
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAddTask = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = taskInput.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await onAddTask(project.id, trimmed);
      setTaskInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    const title = taskInput.trim() || 'New task';
    setAiLoading(true);
    try {
      const improved = await onImproveDescription(title, taskInput.trim());
      setTaskInput(improved);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1}
        bgcolor="grey.200"
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {project.name}
        </Typography>
        <Box>
          <Tooltip title="Edit project">
            <IconButton size="small" onClick={() => onEditProject(project)} aria-label="Edit project">
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete project">
            <IconButton
              size="small"
              onClick={() => onDeleteProject(project)}
              aria-label="Delete project"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box flex={1}>
          <TaskList
            tasks={tasks}
            onToggleComplete={onToggleComplete}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            onInsights={onInsights}
          />
        </Box>

        <Box component="form" onSubmit={handleAddTask} display="flex" gap={1} mt={2}>
          <TextField
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Task"
            size="small"
            fullWidth
            multiline
            maxRows={3}
          />
          <Tooltip title="Improve description with AI (suggestion only)">
            <span>
              <IconButton
                onClick={handleImprove}
                disabled={aiLoading}
                color="primary"
                aria-label="Improve with AI"
              >
                <AutoFixHighIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={loading || !taskInput.trim()}
            sx={{ minWidth: 70 }}
          >
            Add
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
