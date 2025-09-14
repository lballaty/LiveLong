// LiveLong app bootstrap
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const btn = document.getElementById('cta');
const status = document.getElementById('status');
if (btn && status) {
  btn.addEventListener('click', () => {
    status.textContent = 'Hello from LiveLong!';
    setTimeout(() => (status.textContent = ''), 2000);
  });
}

console.log('LiveLong loaded');

