import { createResourceRouter } from './resources.js';

// Previous Year Question papers.
export default createResourceRouter({
  table: 'papers',
  folder: 'papers',
  fields: ['title', 'subject', 'course', 'semester', 'year', 'exam_type'],
});
