/**
 * Mock API response fixtures
 */

export const mockApiResponses = {
  success: {
    status: 'success',
    message: 'Operation completed successfully',
    data: {},
  },
  error: {
    status: 'error',
    message: 'An error occurred',
    error: {
      code: 'INTERNAL_ERROR',
      details: 'Something went wrong',
    },
  },
  notFound: {
    status: 'error',
    message: 'Resource not found',
    error: {
      code: 'NOT_FOUND',
      details: 'The requested resource does not exist',
    },
  },
  unauthorized: {
    status: 'error',
    message: 'Unauthorized',
    error: {
      code: 'UNAUTHORIZED',
      details: 'Authentication required',
    },
  },
  validation: {
    status: 'error',
    message: 'Validation failed',
    error: {
      code: 'VALIDATION_ERROR',
      details: {
        email: 'Invalid email format',
        password: 'Password must be at least 8 characters',
      },
    },
  },
};

export const mockPaginationResponse = {
  data: [],
  pagination: {
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10,
  },
};
