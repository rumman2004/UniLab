import { createResourceRouter } from './resources.js';

// Previous Year Question papers.
export default createResourceRouter({
  table: 'papers',
  folder: 'papers',
  fields: ['title', 'university', 'subject', 'course', 'semester', 'year', 'exam_type'],
});
