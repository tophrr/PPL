import { rest } from 'msw';

/**
 * MSW request handlers for mocking API endpoints
 * Add your API mocks here as you develop features
 */

export const handlers = [
  // Example: Mock GET /api/users
  rest.get('http://localhost/api/users', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ]));
  }),

  rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;

    if (id === 'nonexistent') {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        name: id === '1' ? 'John Doe' : 'Jane Smith',
        email: id === '1' ? 'john@example.com' : 'jane@example.com',
      })
    );
  }),

  // Example: Mock POST /api/users
  rest.post('http://localhost/api/users', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(201), ctx.json({ id: 3, ...body }));
  }),

  rest.patch('http://localhost/api/users/:id', async (req, res, ctx) => {
    const body = (await req.json()) as Record<string, unknown>;
    return res(
      ctx.status(200),
      ctx.json({
        id: req.params.id,
        name: body.name ?? 'Updated User',
        email: body.email ?? 'updated@example.com',
      })
    );
  }),

  rest.delete('http://localhost/api/users/:id', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // Example: Mock GET /api/health
  rest.get('http://localhost/api/health', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ status: 'ok' }));
  }),
];
