import {
  IconButton,
  Tooltip,
  Checkbox,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onInsights: (task: Task) => void;
}

const formatDate = (value: string | null) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const TaskItem = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onInsights,
}: TaskItemProps) => (
  <Box
    display="flex"
    alignItems="flex-start"
    gap={1}
    py={0.5}
    sx={{
      opacity: task.completed ? 0.75 : 1,
      textDecoration: task.completed ? 'line-through' : 'none',
    }}
  >
    <Checkbox
      checked={task.completed}
      onChange={() => onToggleComplete(task)}
      size="small"
      sx={{ p: 0.5 }}
    />
    <Box flex={1}>
      <Typography variant="body2">{task.description}</Typography>
      {task.finishDate && (
        <Tooltip title={`Finish date: ${formatDate(task.finishDate)}`}>
          <Chip
            label={`Due ${formatDate(task.finishDate)}`}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
          />
        </Tooltip>
      )}
    </Box>
    {!task.completed && (
      <Box display="flex">
        <Tooltip title="Get AI insights">
          <IconButton size="small" onClick={() => onInsights(task)} aria-label="Get insights">
            <InsightsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit task">
          <IconButton size="small" onClick={() => onEdit(task)} aria-label="Edit task">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete task">
          <IconButton size="small" onClick={() => onDelete(task)} aria-label="Delete task">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )}
  </Box>
);
