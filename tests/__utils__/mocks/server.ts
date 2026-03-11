import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server instance for use in tests
 * This mocks API calls at the network level
 */
export const server = setupServer(...handlers);
