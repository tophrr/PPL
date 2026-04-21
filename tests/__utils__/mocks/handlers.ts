import { http, HttpResponse } from "msw";

/**
 * MSW request handlers for mocking API endpoints
 * Add your API mocks here as you develop features
 */

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ]);
  }),

  http.post("/api/users", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;

    return HttpResponse.json(
      { id: 3, ...body },
      { status: 201 }
    );
  }),

  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),
];
