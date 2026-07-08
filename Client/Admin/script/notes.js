import { guardAndMount } from '/admin/script/admin.js';
import { initTable, initUploadForm } from '/admin/script/manage.js';

(async () => {
  if (!(await guardAndMount())) return;
  const table = initTable({ endpoint: 'notes' });
  initUploadForm({ endpoint: 'notes', onUploaded: () => table.reload() });
})();
