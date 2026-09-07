import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { Project } from '../types';

interface ProjectEditDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (project: Project, name: string) => Promise<void>;
}

export const ProjectEditDialog = ({ open, project, onClose, onSave }: ProjectEditDialogProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(project?.name ?? '');
  }, [project]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!project) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await onSave(project, trimmed);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit project</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || !name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
