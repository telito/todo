import request from 'supertest';
import { createApp } from './app';

const app = createApp();

const registerAndLogin = async (email = 'user@example.com', password = 'secret123') => {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ email, password });
  return agent;
};

describe('Auth API', () => {
  it('registers a new user and sets auth cookie', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@example.com', password: 'secret123' });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('new@example.com');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate registration', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dup@example.com', password: 'secret123' });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'secret123' });

    expect(response.status).toBe(409);
  });

  it('rejects invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid', password: 'secret123' });

    expect(response.status).toBe(400);
  });

  it('rejects short password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: '123' });

    expect(response.status).toBe(400);
  });

  it('logs in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({ email: 'login@example.com', password: 'secret123' });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'secret123' });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('login@example.com');
  });

  it('rejects invalid login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'missing@example.com', password: 'secret123' });

    expect(response.status).toBe(401);
  });

  it('returns current user when authenticated', async () => {
    const agent = await registerAndLogin('me@example.com');
    const response = await agent.get('/api/auth/me');

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('me@example.com');
  });

  it('rejects unauthenticated me request', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('logs out and clears session', async () => {
    const agent = await registerAndLogin('logout@example.com');
    const logoutResponse = await agent.post('/api/auth/logout');
    expect(logoutResponse.status).toBe(200);

    const meResponse = await agent.get('/api/auth/me');
    expect(meResponse.status).toBe(401);
  });
});

describe('Project and Task isolation', () => {
  it('prevents access to another user project', async () => {
    const userA = await registerAndLogin('usera@example.com');
    const createResponse = await userA.post('/api/projects').send({ name: 'Private Project' });
    const projectId = createResponse.body.project.id;

    const userB = await registerAndLogin('userb@example.com');
    const response = await userB.get(`/api/projects/${projectId}`);

    expect(response.status).toBe(404);
  });

  it('creates, updates, and deletes projects', async () => {
    const agent = await registerAndLogin('projects@example.com');

    const createResponse = await agent.post('/api/projects').send({ name: 'Project ABC' });
    expect(createResponse.status).toBe(201);
    const projectId = createResponse.body.project.id;

    const listResponse = await agent.get('/api/projects');
    expect(listResponse.body.projects).toHaveLength(1);

    const updateResponse = await agent.put(`/api/projects/${projectId}`).send({ name: 'Project XYZ' });
    expect(updateResponse.body.project.name).toBe('Project XYZ');

    const deleteResponse = await agent.delete(`/api/projects/${projectId}`);
    expect(deleteResponse.status).toBe(204);
  });

  it('manages tasks and enforces completed task rules', async () => {
    const agent = await registerAndLogin('tasks@example.com');
    const projectResponse = await agent.post('/api/projects').send({ name: 'Project ABC' });
    const projectId = projectResponse.body.project.id;

    const createTaskResponse = await agent.post('/api/tasks').send({
      projectId,
      description: 'First task',
      finishDate: '2026-12-31T00:00:00.000Z',
    });
    expect(createTaskResponse.status).toBe(201);
    const taskId = createTaskResponse.body.task.id;

    const completeResponse = await agent.patch(`/api/tasks/${taskId}/complete`);
    expect(completeResponse.body.task.completed).toBe(true);

    const editResponse = await agent.put(`/api/tasks/${taskId}`).send({ description: 'Updated' });
    expect(editResponse.status).toBe(403);

    const deleteResponse = await agent.delete(`/api/tasks/${taskId}`);
    expect(deleteResponse.status).toBe(403);
  });

  it('allows uncompleting a task', async () => {
    const agent = await registerAndLogin('uncomplete@example.com');
    const projectResponse = await agent.post('/api/projects').send({ name: 'Project ABC' });
    const projectId = projectResponse.body.project.id;

    const taskResponse = await agent.post('/api/tasks').send({
      projectId,
      description: 'Toggle task',
    });
    const taskId = taskResponse.body.task.id;

    await agent.patch(`/api/tasks/${taskId}/complete`);
    const uncompleteResponse = await agent.patch(`/api/tasks/${taskId}/uncomplete`);

    expect(uncompleteResponse.body.task.completed).toBe(false);
  });

  it('deletes project tasks in cascade', async () => {
    const agent = await registerAndLogin('cascade@example.com');
    const projectResponse = await agent.post('/api/projects').send({ name: 'Project ABC' });
    const projectId = projectResponse.body.project.id;

    await agent.post('/api/tasks').send({ projectId, description: 'Task to delete' });
    await agent.delete(`/api/projects/${projectId}`);

    const tasksResponse = await agent.get('/api/tasks');
    expect(tasksResponse.body.tasks).toHaveLength(0);
  });
});

describe('AI API', () => {
  it('returns fallback description when OpenAI is not configured', async () => {
    const agent = await registerAndLogin('ai@example.com');
    const response = await agent.post('/api/ai/improve-description').send({
      title: 'Prepare release',
    });

    expect(response.status).toBe(200);
    expect(response.body.source).toBe('fallback');
    expect(response.body.description).toContain('Prepare release');
  });

  it('returns fallback insights when OpenAI is not configured', async () => {
    const agent = await registerAndLogin('insights@example.com');
    const response = await agent.post('/api/ai/insights').send({
      description: 'Urgent deployment fix',
      finishDate: '2020-01-01T00:00:00.000Z',
    });

    expect(response.status).toBe(200);
    expect(response.body.source).toBe('fallback');
    expect(response.body.priority).toBe('high');
    expect(response.body.isOverdue).toBe(true);
  });

  it('rejects improve-description without title', async () => {
    const agent = await registerAndLogin('ai-empty@example.com');
    const response = await agent.post('/api/ai/improve-description').send({ title: '' });
    expect(response.status).toBe(400);
  });
});

describe('Health', () => {
  it('returns ok status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
