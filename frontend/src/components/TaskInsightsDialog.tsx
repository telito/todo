import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Task, TaskInsightResult } from '../types';

interface TaskInsightsDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onFetchInsights: (description: string, finishDate: string | null) => Promise<TaskInsightResult>;
}

const priorityColor = (priority: TaskInsightResult['priority']) => {
  if (priority === 'high') return 'error';
  if (priority === 'low') return 'success';
  return 'warning';
};

export const TaskInsightsDialog = ({
  open,
  task,
  onClose,
  onFetchInsights,
}: TaskInsightsDialogProps) => {
  const [insights, setInsights] = useState<TaskInsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !task) {
      setInsights(null);
      setError('');
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await onFetchInsights(task.description, task.finishDate);
        setInsights(result);
      } catch {
        setError('Failed to load insights');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, task, onFetchInsights]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Task insights</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          These are AI suggestions only. Use your own judgment before acting.
        </Alert>

        {loading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {insights && !loading && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label={`Priority: ${insights.priority}`}
                color={priorityColor(insights.priority)}
                size="small"
              />
              {insights.isOverdue && <Chip label="Overdue" color="error" size="small" variant="outlined" />}
              {insights.isRisky && <Chip label="Potentially risky" color="warning" size="small" variant="outlined" />}
              <Chip label={`Source: ${insights.source}`} size="small" variant="outlined" />
            </Box>
            <Typography variant="body2">{insights.summary}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
