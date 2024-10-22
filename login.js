const form = document.getElementById('login-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      console.log('Form submitted with username:', username, 'password:', password);

      try {
      const response = await window.electronAPI.login({ username, password });

      console.log('Login response:', response);

      if (response.success) {
        window.location = 'index.html';
      } else {
        document.getElementById('error-message').textContent = 'Login failed. Incorrect username or password.';
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
    });