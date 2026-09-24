const modal = document.querySelector('#modal');
const modalContent = document.querySelector('#modalContent');
const registerButton = document.querySelector('#registerButton');

registerButton.addEventListener('click', () => {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modalContent.innerHTML = `
    <p class="eyebrow">Join Great HD</p>
    <h2>Create your account</h2>
    <form id="registerForm">
      <label for="register-name">Name</label>
      <input id="register-name" type="text" name="name" placeholder="Your name" autocomplete="name" required />

      <label for="register-email">Email</label>
      <input id="register-email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required />

      <label for="register-password">Password</label>
      <input id="register-password" type="password" name="password" placeholder="At least 6 characters" minlength="6" autocomplete="new-password" required />

      <button class="primary-button" type="submit">Create account →</button>
    </form>
    <div id="registerStatus" class="status-message" role="status"></div>
  `;

  document.querySelector('#registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      password: formData.get('password')
    };
    const status = document.querySelector('#registerStatus');
    status.textContent = 'Creating your account...';
    status.className = 'status-message';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Registration failed');

      localStorage.setItem('greathd-token', result.token);
      status.textContent = 'Registration successful! Welcome to Great HD.';
      status.classList.add('success');
      setTimeout(() => modal.classList.remove('open'), 1200);
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
    }
  });
});
