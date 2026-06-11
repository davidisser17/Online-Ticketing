// ============================================================
// Concert Ticket Jastip — MSW Browser Worker setup
// ============================================================

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
