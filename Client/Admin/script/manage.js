// ------------------------------------------------------------
//  Shared admin manager: upload form + management table.
//  Config-driven so Papers and Notes reuse the same code.
// ------------------------------------------------------------
import { api, toast, esc, formatBytes, formatDate } from '/script/api.js';

const SEM_OPTIONS = [1, 2, 3, 4, 5, 6];
const SUBJECTS_BY_SEM = {
  1: ['Fundamental of Computers', 'Mathematics - I', 'Digital Design', 'Communicative English and Personality Development', 'Programming with C'],
  2: ['Mathematics - II', 'Data Structures', 'Accounting And Financial Management', 'Computer Architecture & Organisation', 'Object Oriented Programming Using Java', 'Environmental Studies'],
  3: ['Mathematics III', 'Formal Language and Automata Theory', 'Software Engineering', 'Introduction to System Software', 'Operating System'],
  4: ['Introduction to Artificial Intelligence', 'Database Management System', 'Data Communication and Computer Network', 'Scientific Computing using Mathematical Software'],
  5: ['Introduction to Computer Graphics', 'Operations Research', 'Internet & Web Programming Technology', 'Cloud Computing'],
  6: ['Major Project']
};
const EXAM_TYPES = ['End Term', 'Mid Term', 'Practical', 'Back/Supplementary', 'Other'];
const UNIVERSITY_OPTIONS = [
  'Dibrugarh University, Assam',
  'Guahati University, Assam',
  'Assam Kaziranga University, Assam',
  'Royal Global University, Assam',
  'Assam Downtown University, Assam',
  'Others'
];

// ---- Form field definitions per resource type ----
const FORM_FIELDS = {
  papers: [
    { name: 'university', label: 'Name of the University', type: 'select', required: true, options: UNIVERSITY_OPTIONS.map((u) => ({ value: u, label: u })), col: 2 },
    { name: 'title', label: 'Subject title', type: 'text', required: true, placeholder: 'e.g. DBMS End Term 2023', col: 2 },
    { name: 'course', label: 'Course', type: 'select', options: [{value: 'BCA', label: 'BCA'}, {value: 'Others', label: 'Others'}] },
    { name: 'semester', label: 'Semester', type: 'select', options: SEM_OPTIONS.map((s) => ({ value: s, label: `Semester ${s}` })) },
    { name: 'subject', label: 'Subject', type: 'select', options: [] },
    { name: 'year', label: 'Exam year', type: 'number', placeholder: 'e.g. 2023' },
    { name: 'exam_type', label: 'Exam type', type: 'select', options: EXAM_TYPES.map((t) => ({ value: t, label: t })) },
  ],
  notes: [
    { name: 'title', label: 'Notes title', type: 'text', required: true, placeholder: 'e.g. OS Unit 3 — Deadlocks', col: 2 },
    { name: 'course', label: 'Course', type: 'text', placeholder: 'BCA', value: 'BCA' },
    { name: 'semester', label: 'Semester', type: 'select', options: SEM_OPTIONS.map((s) => ({ value: s, label: `Semester ${s}` })) },
    { name: 'subject', label: 'Subject', type: 'select', options: [] },
    { name: 'unit', label: 'Unit (optional)', type: 'text', placeholder: 'e.g. Unit 3' },
    { name: 'description', label: 'Description', type: 'text', placeholder: 'Brief summary', col: 2 },
  ],
  'external-notes': [
    { name: 'title', label: 'Resource title', type: 'text', required: true, placeholder: 'e.g. Learn C++ from Scratch', col: 2 },
    { name: 'topic', label: 'Topic / Category', type: 'text', required: true, placeholder: 'e.g. C++, Networking, Boolean Algebra' },
    { name: 'description', label: 'Description', type: 'text', placeholder: 'Brief summary', col: 2 },
  ]
};

function fieldHtml(f) {
  const span = f.col === 2 ? 'sm:col-span-2' : '';
  const req = f.required ? 'required' : '';
  let control;
  if (f.type === 'select') {
    control = `<select name="${f.name}" class="select" ${req}>
      <option value="">Select…</option>
      ${f.options.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}
    </select>`;
  } else if (f.type === 'textarea') {
    control = `<textarea name="${f.name}" class="textarea" placeholder="${esc(f.placeholder || '')}" ${req}></textarea>`;
  } else {
    control = `<input name="${f.name}" type="${f.type}" value="${esc(f.value || '')}" class="input" placeholder="${esc(f.placeholder || '')}" ${req} />`;
  }
  return `<div class="${span}" data-field="${f.name}"><label class="label">${esc(f.label)}${f.required ? ' *' : ''}</label>${control}</div>`;
}

export function initUploadForm({ endpoint, onUploaded }) {
  const host = document.getElementById('upload-form-host');
  if (!host) return;
  const fields = FORM_FIELDS[endpoint];

  host.innerHTML = `
    <form id="upload-form" class="space-y-5">
      <div class="grid gap-4 sm:grid-cols-2">${fields.map(fieldHtml).join('')}</div>

      <div>
        <label class="label">PDF file *</label>
        <label id="drop" class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 bg-white/50 backdrop-blur-sm px-4 py-10 text-center transition-all hover:border-brand-400 hover:bg-brand-50/50 hover:shadow-inner group">
          <span class="text-brand-500 group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg></span>
          <span id="file-label" class="text-sm font-bold text-ink-700">Click to choose a PDF, or drag it here</span>
          <span class="text-xs text-ink-400">Max 25 MB · PDF only</span>
          <input id="file-input" name="file" type="file" accept="application/pdf,.pdf" class="hidden" required />
        </label>
      </div>

      <div class="flex items-center gap-3">
        <button id="upload-btn" type="submit" class="btn-primary px-6 py-3">Upload</button>
        <button type="reset" id="reset-btn" class="btn-ghost">Reset</button>
      </div>
    </form>`;

  const form = document.getElementById('upload-form');
  const fileInput = document.getElementById('file-input');
  const fileLabel = document.getElementById('file-label');
  const drop = document.getElementById('drop');
  const btn = document.getElementById('upload-btn');
  const semSelect = form.querySelector('[name="semester"]');
  const subjSelect = form.querySelector('[name="subject"]');

  if (semSelect && subjSelect) {
    semSelect.addEventListener('change', (e) => {
      const sem = e.target.value;
      const subjects = SUBJECTS_BY_SEM[sem] || [];
      subjSelect.innerHTML = '<option value="">Select subject…</option>' + 
        subjects.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
    });
  }

  const courseSelect = form.querySelector('[name="course"]');
  const titleWrap = form.querySelector('[data-field="title"]');
  const subjectWrap = form.querySelector('[data-field="subject"]');
  const titleInput = form.querySelector('[name="title"]');
  const subjectInput = form.querySelector('[name="subject"]');

  if (endpoint === 'papers' && courseSelect) {
    courseSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'BCA') {
        if (titleWrap) titleWrap.style.display = 'none';
        if (titleInput) titleInput.required = false;
        
        if (subjectWrap) subjectWrap.style.display = 'block';
        if (subjectInput) subjectInput.required = true;
        
        if (semSelect) semSelect.innerHTML = '<option value="">Select…</option>' + [1,2,3,4,5,6].map(s => `<option value="${s}">Semester ${s}</option>`).join('');
      } else {
        if (titleWrap) titleWrap.style.display = 'block';
        if (titleInput) titleInput.required = true;
        
        if (subjectWrap) subjectWrap.style.display = 'none';
        if (subjectInput) subjectInput.required = false;
        
        if (semSelect) semSelect.innerHTML = '<option value="">Select…</option>' + [1,2,3,4,5,6,7,8].map(s => `<option value="${s}">Semester ${s}</option>`).join('');
      }
    });
    // Trigger initially to set correct state
    courseSelect.dispatchEvent(new Event('change'));
  }

  fileInput.addEventListener('change', () => {
    fileLabel.textContent = fileInput.files[0]?.name || 'Click to choose a PDF, or drag it here';
  });

  ['dragover', 'dragenter'].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add('border-brand-400', 'bg-brand-50/40');
    })
  );
  ['dragleave', 'drop'].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.remove('border-brand-400', 'bg-brand-50/40');
    })
  );
  drop.addEventListener('drop', (e) => {
    if (e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;
      fileLabel.textContent = fileInput.files[0].name;
    }
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    setTimeout(() => (fileLabel.textContent = 'Click to choose a PDF, or drag it here'), 0);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files[0]) return toast('Please choose a PDF file.', 'error');
    
    // Auto-generate title for BCA
    if (endpoint === 'papers' && courseSelect && courseSelect.value === 'BCA') {
      const s = subjectInput?.value;
      const y = form.querySelector('[name="year"]')?.value;
      const t = form.querySelector('[name="exam_type"]')?.value;
      if (titleInput) titleInput.value = `${s || 'Paper'} ${t || ''} ${y || ''}`.trim();
    }
    
    const fd = new FormData(form);
    btn.disabled = true;
    btn.textContent = 'Uploading…';
    try {
      await api(`/${endpoint}`, { method: 'POST', body: fd, isForm: true });
      toast('Uploaded successfully!', 'success');
      form.reset();
      fileLabel.textContent = 'Click to choose a PDF, or drag it here';
      onUploaded?.();
    } catch (ex) {
      toast(ex.message || 'Upload failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Upload';
    }
  });
}

export function initTable({ endpoint }) {
  const host = document.getElementById('table-host');
  const countEl = document.getElementById('table-count');
  if (!host) return { reload: () => {} };

  async function reload() {
    host.innerHTML = `<div class="p-8 text-center text-ink-400">Loading…</div>`;
    try {
      const { data } = await api(`/${endpoint}?limit=200`);
      if (countEl) countEl.textContent = `${data.length} item${data.length === 1 ? '' : 's'}`;
      if (!data.length) {
        host.innerHTML = `<div class="p-10 text-center text-ink-500">Nothing uploaded yet. Use the form above to add one.</div>`;
        return;
      }
      host.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th class="px-4 py-3 font-semibold">Title</th>
                <th class="px-4 py-3 font-semibold">Subject</th>
                <th class="px-4 py-3 font-semibold">Sem</th>
                <th class="px-4 py-3 font-semibold">Size</th>
                <th class="px-4 py-3 font-semibold">Added</th>
                <th class="px-4 py-3 font-semibold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-ink-400"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg></th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-100">
              ${data.map(rowHtml).join('')}
            </tbody>
          </table>
        </div>`;

      host.querySelectorAll('[data-del]').forEach((b) =>
        b.addEventListener('click', () => remove(b.dataset.del, b.dataset.title))
      );
      host.querySelectorAll('.edit-btn').forEach((b) =>
        b.addEventListener('click', () => {
          const row = data.find(d => d.id == b.dataset.id);
          if (row) openEditModal(row);
        })
      );
    } catch (ex) {
      host.innerHTML = `<div class="p-8 text-center text-red-500">${esc(ex.message)}</div>`;
    }
  }

  function openEditModal(r) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4';
    
    overlay.innerHTML = `
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-ink-900">Edit ${endpoint.replace('-', ' ')}</h2>
          <button class="modal-close text-ink-400 hover:text-ink-600"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <form id="edit-form" class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          ${FORM_FIELDS[endpoint].map(fieldHtml).join('')}
          <div class="sm:col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" class="modal-close btn-secondary btn-md">Cancel</button>
            <button type="submit" class="btn-primary btn-md">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    const form = overlay.querySelector('#edit-form');
    // Pre-fill values
    FORM_FIELDS[endpoint].forEach(f => {
      const input = form.querySelector(`[name="${f.name}"]`);
      if (input && r[f.name] !== undefined && r[f.name] !== null) {
        input.value = r[f.name];
      }
    });

    if (endpoint === 'papers') {
      const courseSelect = form.querySelector('[name="course"]');
      const titleWrap = form.querySelector('[name="title"]')?.closest('div');
      const subjectWrap = form.querySelector('[name="subject"]')?.closest('div');
      const semesterSelect = form.querySelector('[name="semester"]');
      const subjectSelect = form.querySelector('[name="subject"]');
      
      function updateSubjectOptions(sem) {
         if(!subjectSelect) return;
         subjectSelect.innerHTML = '<option value="">Select…</option>';
         if (!sem || !SUBJECTS_BY_SEM[sem]) return;
         SUBJECTS_BY_SEM[sem].forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub; opt.textContent = sub;
            subjectSelect.appendChild(opt);
         });
      }

      function updatePaperForm() {
        const val = courseSelect?.value;
        if (val === 'BCA') {
          if (titleWrap) titleWrap.style.display = 'none';
          if (subjectWrap) subjectWrap.style.display = 'block';
          if (semesterSelect) {
            Array.from(semesterSelect.options).forEach(opt => {
              opt.style.display = (opt.value && parseInt(opt.value) > 6) ? 'none' : 'block';
            });
            if (semesterSelect.value > 6) semesterSelect.value = '';
          }
        } else if (val === 'Others') {
          if (titleWrap) titleWrap.style.display = 'block';
          if (subjectWrap) subjectWrap.style.display = 'none';
          if (semesterSelect) {
            Array.from(semesterSelect.options).forEach(opt => opt.style.display = 'block');
          }
        }
      }
      
      if (semesterSelect) {
        semesterSelect.addEventListener('change', () => {
          updateSubjectOptions(semesterSelect.value);
        });
        if (r.semester) {
           updateSubjectOptions(r.semester);
           if (r.subject) subjectSelect.value = r.subject;
        }
      }
      if (courseSelect) {
        courseSelect.addEventListener('change', updatePaperForm);
        updatePaperForm();
      }
    } else if (endpoint === 'notes') {
      const semesterSelect = form.querySelector('[name="semester"]');
      const subjectSelect = form.querySelector('[name="subject"]');
      if (semesterSelect && subjectSelect) {
        semesterSelect.addEventListener('change', () => {
           subjectSelect.innerHTML = '<option value="">Select…</option>';
           const sem = semesterSelect.value;
           if (!sem || !SUBJECTS_BY_SEM[sem]) return;
           SUBJECTS_BY_SEM[sem].forEach(sub => {
              const opt = document.createElement('option');
              opt.value = sub; opt.textContent = sub;
              subjectSelect.appendChild(opt);
           });
        });
        if (r.semester) {
           semesterSelect.dispatchEvent(new Event('change'));
           if (r.subject) subjectSelect.value = r.subject;
        }
      }
    }

    const closeBtns = overlay.querySelectorAll('.modal-close');
    closeBtns.forEach(b => b.addEventListener('click', () => overlay.remove()));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Auto-generate title for BCA
      if (endpoint === 'papers' && form.querySelector('[name="course"]')?.value === 'BCA') {
        const s = form.querySelector('[name="subject"]')?.value;
        const y = form.querySelector('[name="year"]')?.value;
        const t = form.querySelector('[name="exam_type"]')?.value;
        const titleInput = form.querySelector('[name="title"]');
        if (titleInput) titleInput.value = `${s || 'Paper'} ${t || ''} ${y || ''}`.trim();
      }
      
      const payload = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';
      try {
        await api(`/${endpoint}/${r.id}`, {
          method: 'PATCH',
          body: payload
        });
        toast('Updated successfully!', 'success');
        overlay.remove();
        reload();
      } catch (ex) {
        toast(ex.message || 'Update failed.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }
    });
  }

  function rowHtml(r) {
    return `<tr class="hover:bg-ink-50">
      <td class="px-4 py-3">
        <a href="${esc(r.file_url)}" target="_blank" rel="noopener" class="font-medium text-ink-900 hover:text-brand-600">${esc(r.title)}</a>
      </td>
      <td class="px-4 py-3 text-ink-600">${esc(r.subject || '—')}</td>
      <td class="px-4 py-3 text-ink-600">${r.semester ? esc(r.semester) : '—'}</td>
      <td class="px-4 py-3 text-ink-500">${formatBytes(r.file_size)}</td>
      <td class="px-4 py-3 text-ink-500">${formatDate(r.created_at)}</td>
      <td class="px-4 py-3 text-ink-500">${r.downloads || 0}</td>
      <td class="px-4 py-3 text-right space-x-2">
        <button data-id="${r.id}" class="edit-btn btn-secondary btn-sm">Edit</button>
        <button data-del="${r.id}" data-title="${esc(r.title)}" class="btn-danger btn-sm">Delete</button>
      </td>
    </tr>`;
  }

  async function remove(id, title) {
    if (!confirm(`Delete "${title}"? This also removes the PDF and cannot be undone.`)) return;
    try {
      await api(`/${endpoint}/${id}`, { method: 'DELETE' });
      toast('Deleted.', 'success');
      reload();
    } catch (ex) {
      toast(ex.message || 'Delete failed.', 'error');
    }
  }

  reload();
  return { reload };
}
