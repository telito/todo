import { Typography, Box } from '@mui/material';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onInsights: (task: Task) => void;
}

export const TaskList = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onInsights,
}: TaskListProps) => {
  const todoTasks = tasks.filter((task) => !task.completed);
  const doneTasks = tasks.filter((task) => task.completed);

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        To Do
      </Typography>
      {todoTasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary" mb={2}>
          No pending tasks
        </Typography>
      ) : (
        todoTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onInsights={onInsights}
          />
        ))
      )}

      <Typography variant="subtitle2" fontWeight={700} gutterBottom mt={2}>
        Done
      </Typography>
      {doneTasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No completed tasks
        </Typography>
      ) : (
        doneTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onInsights={onInsights}
          />
        ))
      )}
    </Box>
  );
};
