document.getElementById('register-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const user = { username, email, password };
  // Lưu user dưới key 'loggedInUser'
  localStorage.setItem('loggedInUser', JSON.stringify(user));

  alert('Đăng ký thành công! Chuyển đến trang đăng nhập...');
  window.location.href = 'dangnhap.html';
});
