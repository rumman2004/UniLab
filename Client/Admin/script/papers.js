import { guardAndMount } from '/admin/script/admin.js';
import { initTable, initUploadForm } from '/admin/script/manage.js';

(async () => {
  if (!(await guardAndMount())) return;
  const table = initTable({ endpoint: 'papers' });
  initUploadForm({ endpoint: 'papers', onUploaded: () => table.reload() });
})();
