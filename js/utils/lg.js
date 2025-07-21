document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginMessage = document.getElementById('loginMessage');
  const registerMessage = document.getElementById('registerMessage');
  const contenidoApp = document.getElementById('contenidoApp');

  // Cambiar a vista de registro
  document.getElementById('goToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    loginMessage.classList.add('hidden');
  });

  // Cambiar a vista de login
  document.getElementById('goToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
    registerMessage.classList.add('hidden');
  });

  // Manejar registro
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = registerForm.regUsername.value.trim();
    const password = registerForm.regPassword.value;

    if (username && password) {
      localStorage.setItem('user', JSON.stringify({ username, password }));
      registerMessage.textContent = 'Registro exitoso. Ahora puedes iniciar sesión.';
      registerMessage.className = 'success';
      setTimeout(() => {
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
      }, 1500);
    } else {
      registerMessage.textContent = 'Completa todos los campos.';
      registerMessage.className = 'error';
    }
    registerMessage.classList.remove('hidden');
  });

  // Manejar login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser && storedUser.username === username && storedUser.password === password) {
      loginMessage.textContent = '¡Bienvenido!';
      loginMessage.className = 'success';
      setTimeout(() => {
        document.getElementById('authWrapper').classList.add('hidden');
        contenidoApp.classList.remove('hidden');
      }, 800);
    } else {
      loginMessage.textContent = 'Usuario o clave incorrectos.';
      loginMessage.className = 'error';
    }
    loginMessage.classList.remove('hidden');
  });
});
