import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';
import { FormEvent, useState } from 'react';

interface CreateProjectCardProps {
  onCreate: (name: string) => Promise<void>;
}

export const CreateProjectCard = ({ onCreate }: CreateProjectCardProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await onCreate(trimmed);
      setName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ height: '100%', bgcolor: 'grey.100' }}>
      <CardContent>
        <Typography variant="subtitle1" align="center" gutterBottom fontWeight={600}>
          Create a new project
        </Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            fullWidth
            placeholder="Project name"
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading || !name.trim()}>
            Create Project
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
