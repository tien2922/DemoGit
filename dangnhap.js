document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const storedUser = JSON.parse(localStorage.getItem('loggedInUser')); // ✅ Đúng key

  if (storedUser && email === storedUser.email && password === storedUser.password) {
    alert('Đăng nhập thành công!');
    window.location.href = 'work.html';
  } else {
    alert('Email hoặc mật khẩu không đúng.');
  }
});
