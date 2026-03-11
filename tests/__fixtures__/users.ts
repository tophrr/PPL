/**
 * Mock user fixtures for testing
 */

export const mockUsers = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  user: {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    createdAt: '2024-01-15T00:00:00Z',
  },
  guest: {
    id: '3',
    name: 'Guest User',
    email: 'guest@example.com',
    role: 'guest',
    createdAt: '2024-02-01T00:00:00Z',
  },
};

export const mockUsersList = Object.values(mockUsers);
