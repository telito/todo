import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TaskItem } from '../components/TaskItem';
import { TaskList } from '../components/TaskList';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const baseTask: Task = {
  id: '1',
  description: 'Sample task',
  projectId: 'p1',
  finishDate: '2026-12-31T00:00:00.000Z',
  completed: false,
  completedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TaskItem', () => {
  const handlers = {
    onToggleComplete: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onInsights: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task description and finish date', () => {
    render(<TaskItem task={baseTask} {...handlers} />);
    expect(screen.getByText('Sample task')).toBeInTheDocument();
    expect(screen.getByText(/Due/)).toBeInTheDocument();
  });

  it('shows actions for pending tasks', () => {
    render(<TaskItem task={baseTask} {...handlers} />);
    expect(screen.getByLabelText('Edit task')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete task')).toBeInTheDocument();
  });

  it('hides edit and delete for completed tasks', () => {
    render(<TaskItem task={{ ...baseTask, completed: true }} {...handlers} />);
    expect(screen.queryByLabelText('Edit task')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete task')).not.toBeInTheDocument();
  });
});

describe('TaskList', () => {
  it('separates todo and done sections', () => {
    const tasks: Task[] = [
      baseTask,
      { ...baseTask, id: '2', description: 'Done task', completed: true },
    ];

    render(
      <TaskList
        tasks={tasks}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onInsights={vi.fn()}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Sample task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
  });
});

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
