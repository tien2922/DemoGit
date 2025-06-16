document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('work-container');
  const sideRectangle = document.querySelector('.side-rectangle');

  // Danh sách ảnh đại diện
  const images = [
    './images/hs11.png',
    './images/hs12.png',
    './images/hs13.png',
    './images/hs14.png',
    './images/hs15.png',
    './images/hs16.png',
  ];

  // Hiển thị số lượng task hoàn thành
  const completionCounter = document.createElement('div');
  completionCounter.className = 'completion-counter';
  sideRectangle.appendChild(completionCounter);

  // Lấy tasks từ localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Lấy completedTasks
  let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

  // Hàm cập nhật text hoàn thành
  function updateCompletionText() {
    completionCounter.textContent = `Hoàn Thành ${completedTasks.length}/${tasks.length}`;
  }

  // Hàm sắp xếp progress bars theo deadline
  function sortAndRenderProgress() {
    const progressBars = Array.from(sideRectangle.querySelectorAll('.progress-wrapper'));
    progressBars.sort((a, b) => {
      const da = new Date(a
        .querySelector('.progress-deadline')
        .textContent.replace('Deadline: ', '')
        .split('|')[0]
        .trim());
      const db = new Date(b
        .querySelector('.progress-deadline')
        .textContent.replace('Deadline: ', '')
        .split('|')[0]
        .trim());
      return da - db;
    });
    progressBars.forEach(pb => sideRectangle.appendChild(pb));
  }

  // Hàm tạo và render task
  function addTaskToDOM(task, index) {
    const div = document.createElement('div');
    div.className = 'task-box task-box--animate';
    setTimeout(() => div.classList.remove('task-box--animate'), 500);

    // Ảnh đại diện
    const imgIndex = index < images.length ? index : Math.floor(Math.random() * images.length);
    const img = document.createElement('img');
    img.src = images[imgIndex];
    img.alt = 'Task image';
    img.className = 'task-img';

    // Tên task
    const span = document.createElement('span');
    span.textContent = task.text;

    // Hộp deadline
    const deadlineBox = document.createElement('div');
    deadlineBox.className = 'deadline-box';

    // Nếu đã có deadline, chuyển ISO về định dạng "YYYY-MM-DDThh:mm" để input hiển thị
    let inputValue = '';
    if (task.deadline) {
      const d = new Date(task.deadline);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      inputValue = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }

    deadlineBox.innerHTML = `
      <label for="deadline-input-${index}">Deadline:</label>
      <input 
        type="datetime-local" 
        id="deadline-input-${index}" 
        class="deadline-input" 
        tabindex="0"
        value="${inputValue}"
      >
      <button class="save-deadline">Lưu</button>
      <select class="category-select">
        <option value="">Phân loại</option>
        <option value="Ưu tiên">Ưu tiên</option>
        <option value="Học tập">Học tập</option>
        <option value="Thể thao">Thể thao</option>
        <option value="Giải trí">Giải trí</option>
      </select>
    `;
    deadlineBox.style.display = 'none';
    deadlineBox.querySelector('.category-select').value = task.group || '';

    // Nút chỉnh sửa
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = `<img src="./images/pen12.png" alt="Sửa" style="width: 25px; height: 25px;">`;

    // Nút xóa
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.className = 'delete-btn';

    // Progress bar
    const progressWrapper = document.createElement('div');
    progressWrapper.className = 'progress-wrapper';
    progressWrapper.style.display = 'none';

    const taskName = document.createElement('div');
    taskName.className = 'progress-task';
    taskName.textContent = task.text;

    const deadlineText = document.createElement('div');
    deadlineText.className = 'progress-deadline';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `<div class="progress-fill" style="width: 0%;"></div>`;

    progressWrapper.appendChild(taskName);
    progressWrapper.appendChild(deadlineText);
    progressWrapper.appendChild(progressBar);

    // Checkbox hoàn thành
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.marginTop = '10px';

    // Kiểm tra xem task đã hoàn thành hay chưa
    const completed = completedTasks.some(t => t.id === index);
    if (completed) {
      checkbox.checked = true;
      div.classList.add('completed-task');
      progressWrapper.style.display = 'block';
      // Nếu đã hoàn thành, hiển thị thêm " | Đã hoàn thành" nếu muốn
      if (task.deadline) {
        const d = new Date(task.deadline);
        deadlineText.textContent = `Deadline: ${d.toLocaleString()} | Đã hoàn thành`;
      }
    }

    progressWrapper.appendChild(checkbox);
    sideRectangle.appendChild(progressWrapper);

    // Lưu intervalId để có thể clear khi hoàn thành
    let intervalId = null;

    // Hiển thị progress bar và countdown nếu có deadline và chưa hoàn thành
    if (task.deadline && !completed) {
      const deadline = new Date(task.deadline);
      deadlineText.textContent = `Deadline: ${deadline.toLocaleString()}`;
      progressWrapper.style.display = 'block';

      const startTime = new Date();
      intervalId = setInterval(() => {
        const current = new Date();
        const totalTime = deadline.getTime() - startTime.getTime();
        const elapsedTime = current.getTime() - startTime.getTime();
        const progress = Math.min((elapsedTime / totalTime) * 100, 100);
        progressBar.querySelector('.progress-fill').style.width = `${progress}%`;

        const timeLeft = deadline.getTime() - current.getTime();
        if (timeLeft > 0) {
          const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
          const seconds = Math.floor((timeLeft / 1000) % 60);
          deadlineText.textContent = `Deadline: ${deadline.toLocaleString()} | ⏳ ${hours}h ${minutes}m ${seconds}s`;
        } else {
          deadlineText.textContent = `⏰ Deadline Đã Hết!`;
          clearInterval(intervalId);
        }
      }, 1000);
    }

    // Lưu deadline & phân loại
    deadlineBox.querySelector('.save-deadline').addEventListener('click', () => {
      const datetime = deadlineBox.querySelector(`#deadline-input-${index}`).value;
      const selectedCategory = deadlineBox.querySelector('.category-select').value;

      if (!datetime) {
        alert('Vui lòng chọn thời hạn!');
        return;
      }

      const deadline = new Date(datetime);
      if (isNaN(deadline.getTime())) {
        alert('Thời hạn không hợp lệ!');
        return;
      }

      tasks[index].deadline = deadline.toISOString();
      if (selectedCategory) tasks[index].group = selectedCategory;

      localStorage.setItem('tasks', JSON.stringify(tasks));

      // Nếu có interval cũ, clear nó trước khi tạo mới
      if (intervalId) {
        clearInterval(intervalId);
      }

      deadlineText.textContent = `Deadline: ${deadline.toLocaleString()}`;
      progressWrapper.style.display = 'block';
      deadlineBox.style.display = 'none';

      // Nếu task vẫn chưa hoàn thành (checkbox chưa check), khởi tạo interval mới
      if (!checkbox.checked) {
        const now2 = new Date();
        intervalId = setInterval(() => {
          const current = new Date();
          const totalTime = deadline.getTime() - now2.getTime();
          const elapsedTime = current.getTime() - now2.getTime();
          const progress = Math.min((elapsedTime / totalTime) * 100, 100);

          progressBar.querySelector('.progress-fill').style.width = `${progress}%`;

          const timeLeft = deadline.getTime() - current.getTime();
          if (timeLeft > 0) {
            const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);
            deadlineText.textContent = `Deadline: ${deadline.toLocaleString()} | ⏳ ${hours}h ${minutes}m ${seconds}s`;
          } else {
            deadlineText.textContent = `⏰ Deadline Đã Hết!`;
            clearInterval(intervalId);
          }
        }, 1000);
      }

      let countdownStopped = false;
      deadlineText.addEventListener('click', () => {
        if (!countdownStopped) {
          clearInterval(intervalId);
          countdownStopped = true;
          deadlineText.textContent += ' | Đã hoàn thành';
          launchConfetti();
        }
      });
    });

    // Sửa task
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newTask = prompt('Nhập nội dung mới:', span.textContent);
      if (newTask !== null && newTask.trim() !== '') {
        span.textContent = newTask;
        taskName.textContent = newTask;
        tasks[index].text = newTask;
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
    });

    // Xóa task
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      tasks.splice(index, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      completedTasks = completedTasks.filter(t => t.id !== index);
      localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
      div.remove();
      progressWrapper.remove();
      updateCompletionText();
      if (tasks.length === 0) {
        container.innerHTML = '<p class="warning-text">Làm Đi Em Còn Do Dự, Ba Mẹ Già Mất !!!!!</p>';
      }
    });

    // Hiện/ẩn deadline box
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!deadlineBox.contains(e.target)) {
        deadlineBox.style.display = deadlineBox.style.display === 'none' ? 'flex' : 'none';
      }
    });

    // Ngăn click category-select lan truyền
    const categorySelect = deadlineBox.querySelector('.category-select');
    categorySelect.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Đảm bảo ô datetime-local click được
    const deadlineInput = deadlineBox.querySelector(`#deadline-input-${index}`);
    deadlineInput.addEventListener('click', (e) => {
      e.stopPropagation();
      deadlineInput.focus();
    });

    // Checkbox hoàn thành: dừng countdown khi click
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (intervalId) {
          clearInterval(intervalId);
        }
        if (!completedTasks.some(t => t.id === index)) {
          completedTasks.push({
            id: index,
            task: tasks[index].text,
            completedAt: new Date().toISOString()
          });
          div.classList.add('completed-task');
          // Nếu có deadline, thêm "| Đã hoàn thành" vào deadlineText
          if (task.deadline) {
            const d = new Date(task.deadline);
            deadlineText.textContent = `Deadline: ${d.toLocaleString()} | Đã hoàn thành`;
          }
          launchConfetti();
        }
      } else {
        completedTasks = completedTasks.filter(t => t.id !== index);
        div.classList.remove('completed-task');
        // Không khôi phục countdown để giữ logic đơn giản
      }
      localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
      updateCompletionText();
    });

    // Thêm các phần tử vào div task
    div.appendChild(img);
    div.appendChild(span);
    div.appendChild(editBtn);
    div.appendChild(deleteBtn);
    div.appendChild(deadlineBox);

    // Thêm div task vào container
    container.appendChild(div);
  }

  // Hàm tạo confetti
  function launchConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // Render tất cả task
  function renderAllTasks() {
    container.innerHTML = '';
    sideRectangle.querySelectorAll('.progress-wrapper').forEach(el => el.remove());

    if (tasks.length === 0) {
      container.innerHTML = '<p class="warning-text">Làm Đi Em Còn Do Dự, Ba Mẹ Già Mất !!!!!</p>';
      updateCompletionText();
      return;
    }

    tasks.forEach((task, idx) => {
      addTaskToDOM(task, idx);
    });

    updateCompletionText();
  }

  const box = document.createElement('div');
  box.classList.add('task-box');
  document.getElementById('work-container').appendChild(box);

  // Delay để tránh gây ảnh hưởng layout
  setTimeout(() => {
    box.classList.add('show');
  }, 10);

  // Gọi render khi load
  renderAllTasks();
});
