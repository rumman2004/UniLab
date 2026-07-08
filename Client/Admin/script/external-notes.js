import { guardAndMount } from '/admin/script/admin.js';
import { initUploadForm, initTable } from '/admin/script/manage.js';

(async () => {
  if (!(await guardAndMount())) return;
  const table = initTable({ endpoint: 'external-notes' });
  initUploadForm({ endpoint: 'external-notes', onUploaded: () => table.reload() });
})();
