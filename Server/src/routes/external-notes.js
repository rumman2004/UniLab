import { createResourceRouter } from './resources.js';

// External notes.
export default createResourceRouter({
  table: 'external_notes',
  folder: 'external_notes',
  fields: ['title', 'topic', 'description'],
});
