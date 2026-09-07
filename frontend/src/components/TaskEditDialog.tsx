import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { FormEvent, useEffect, useState } from 'react';
import { Task } from '../types';

interface TaskEditDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task, description: string, finishDate: string | null) => Promise<void>;
  onImproveDescription: (title: string, roughDescription: string) => Promise<string>;
}

export const TaskEditDialog = ({
  open,
  task,
  onClose,
  onSave,
  onImproveDescription,
}: TaskEditDialogProps) => {
  const [description, setDescription] = useState('');
  const [finishDate, setFinishDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState('');

  useEffect(() => {
    setDescription(task?.description ?? '');
    setFinishDate(task?.finishDate ? task.finishDate.slice(0, 10) : '');
    setAiNotice('');
  }, [task]);

  const handleImprove = async () => {
    setAiLoading(true);
    try {
      const improved = await onImproveDescription(description.slice(0, 40) || 'Task', description);
      setDescription(improved);
      setAiNotice('AI suggestion applied. You can edit before saving.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!task) return;
    const trimmed = description.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await onSave(task, trimmed, finishDate ? new Date(finishDate).toISOString() : null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit task</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" gap={1} alignItems="flex-start" mb={2}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              autoFocus
            />
            <Tooltip title="Improve with AI (suggestion only)">
              <span>
                <IconButton onClick={handleImprove} disabled={aiLoading} aria-label="Improve with AI">
                  <AutoFixHighIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <TextField
            label="Finish date (optional)"
            type="date"
            value={finishDate}
            onChange={(e) => setFinishDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {aiNotice && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {aiNotice}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || !description.trim()}>
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
