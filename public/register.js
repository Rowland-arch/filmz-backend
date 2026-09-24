const modal = document.querySelector('#modal');
const modalContent = document.querySelector('#modalContent');
const registerButton = document.querySelector('#registerButton');

if (modal && modalContent && registerButton) {
  registerButton.addEventListener('click', () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modalContent.innerHTML = `
      <p class="eyebrow">Join Great HD</p>
      <h2>Create your account</h2>
      <form id="registerForm">
        <label for="register-name">Name</label>
        <input id="register-name" type="text" name="name" placeholder="Your name" autocomplete="name" minlength="2" required />

        <label for="register-email">Email</label>
        <input id="register-email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required />

        <label for="register-password">Password</label>
        <input id="register-password" type="password" name="password" placeholder="At least 6 characters" minlength="6" autocomplete="new-password" required />

        <button class="primary-button" id="registerSubmit" type="submit">Create account →</button>
      </form>
      <div id="registerStatus" class="status-message" role="status" aria-live="polite"></div>
    `;

    const form = document.querySelector('#registerForm');
    const submitButton = document.querySelector('#registerSubmit');
    const status = document.querySelector('#registerStatus');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const password = String(formData.get('password') || '');

      if (name.length < 2) {
        status.textContent = 'Please enter your name.';
        status.className = 'status-message error';
        return;
      }

      if (password.length < 6) {
        status.textContent = 'Password must be at least 6 characters.';
        status.className = 'status-message error';
        return;
      }

      submitButton.disabled = true;
      status.textContent = 'Creating your account...';
      status.className = 'status-message';

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Registration failed');

        localStorage.setItem('greathd-token', result.token);
        status.textContent = 'Registration successful! Welcome to Great HD.';
        status.className = 'status-message success';
        setTimeout(() => modal.classList.remove('open'), 1200);
      } catch (error) {
        status.textContent = error.message || 'Registration failed. Please try again.';
        status.className = 'status-message error';
        submitButton.disabled = false;
      }
    });
  });
}
