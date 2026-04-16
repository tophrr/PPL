import { rest } from "msw";

/**
 * MSW request handlers for mocking API endpoints
 * Add your API mocks here as you develop features
 */

export const handlers = [
  rest.get("/api/users", (_req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
      ]),
    );
  }),

  rest.post("/api/users", async (req, res, ctx) => {
    const body = await req.json();

    return res(
      ctx.status(201),
      ctx.json({ id: 3, ...body }),
    );
  }),

  rest.get("/api/health", (_req, res, ctx) => {
    return res(ctx.json({ status: "ok" }));
  }),
];
