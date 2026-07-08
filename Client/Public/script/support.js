import { api, toast } from './api.js';

const form = document.getElementById('support-form');
const submitBtn = document.getElementById('submit-btn');
const originalBtnText = submitBtn?.innerHTML;

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const msg = document.getElementById('s-msg').value.trim();
  
  if (!name || !email || !msg) {
    toast('error', 'Please fill in all fields.');
    return;
  }

  try {
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;
    
    await api('/support', {
      method: 'POST',
      body: { name, email, msg }
    });

    toast('success', 'Message sent successfully!');
    form.reset();
  } catch (error) {
    console.error(error);
    toast('error', 'Failed to send message. Please try again.');
  } finally {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
});
