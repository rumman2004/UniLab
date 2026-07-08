import { createResourceRouter } from './resources.js';

// Subject notes.
export default createResourceRouter({
  table: 'notes',
  folder: 'notes',
  fields: ['title', 'subject', 'course', 'semester', 'unit', 'description'],
});
