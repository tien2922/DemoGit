document.addEventListener('DOMContentLoaded', () => {
  const groupContainer = document.getElementById('group-container');

  // Các nhóm cần hiển thị
  const CATEGORIES = ['Ưu tiên', 'Học tập', 'Thể thao', 'Giải trí', 'Chưa phân loại'];

  // Lấy tasks và completedTasks từ localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

  // Nếu không có task nào, hiển thị cảnh báo
  if (tasks.length === 0) {
    groupContainer.innerHTML = '<p class="warning-text">Chưa có công việc nào!</p>';
    return;
  }

  // Tạo object chứa mảng task theo từng nhóm
  const grouped = {};
  CATEGORIES.forEach(cat => { grouped[cat] = []; });

  tasks.forEach((task, idx) => {
    const grp = task.group && task.group.trim() !== '' ? task.group : 'Chưa phân loại';
    if (!CATEGORIES.includes(grp)) {
      grouped['Chưa phân loại'].push({ index: idx, task });
    } else {
      grouped[grp].push({ index: idx, task });
    }
  });

  // Hàm tạo một task-box (chỉ có tên + deadline hoặc trạng thái "Đã hoàn thành")
  function createTaskBox(taskObj) {
    const { index, task } = taskObj;
    const div = document.createElement('div');
    div.className = 'task-box';

    // Kiểm tra nếu task đã hoàn thành
    const isCompleted = completedTasks.some(t => t.id === index);
    if (isCompleted) {
      div.classList.add('completed-task');
    }

    // Tên task
    const span = document.createElement('span');
    span.textContent = task.text;
    div.appendChild(span);

    // Hộp deadline
    const deadlineBox = document.createElement('div');
    deadlineBox.className = 'deadline-box';
    const deadlineText = document.createElement('div');
    deadlineText.className = 'progress-deadline';

    if (isCompleted) {
      // Nếu hoàn thành, không đếm ngược mà hiển thị "Đã hoàn thành"
      if (task.deadline) {
        const d = new Date(task.deadline);
        deadlineText.textContent = `Deadline: ${d.toLocaleString()} | Đã hoàn thành`;
      } else {
        deadlineText.textContent = 'Đã hoàn thành';
      }
      // Không tạo interval để đếm ngược
    } else {
      // Chưa hoàn thành => nếu có deadline thì đếm ngược, ngược lại hiển thị "Chưa đặt deadline"
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);

        function updateCountdown() {
          const now = new Date();
          const timeLeft = deadlineDate.getTime() - now.getTime();
          if (timeLeft > 0) {
            const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);
            deadlineText.textContent =
              `Deadline: ${deadlineDate.toLocaleString()} | ⏳ ${hours}h ${minutes}m ${seconds}s`;
          } else {
            deadlineText.textContent = `⏰ Deadline Đã Hết!`;
            clearInterval(intervalId);
          }
        }

        // Khởi tạo countdown
        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);
      } else {
        // Chưa có deadline
        deadlineText.textContent = 'Chưa đặt deadline';
      }
    }

    deadlineBox.appendChild(deadlineText);
    div.appendChild(deadlineBox);

    return div;
  }

  // Hàm tạo một section cho mỗi nhóm
  function renderSection(categoryName, taskArray) {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'group-section';

    // Tiêu đề nhóm
    const h2 = document.createElement('h2');
    h2.textContent = categoryName;
    sectionWrapper.appendChild(h2);

    // Container con chứa các task-box
    const innerContainer = document.createElement('div');
    innerContainer.className = 'work-container';

    if (taskArray.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'Chưa có công việc trong mục này.';
      p.style.fontStyle = 'italic';
      p.style.color = '#6a1b9a';
      innerContainer.appendChild(p);
    } else {
      taskArray.forEach(obj => {
        const box = createTaskBox(obj);
        innerContainer.appendChild(box);
      });
    }

    sectionWrapper.appendChild(innerContainer);
    return sectionWrapper;
  }

  // Vòng lặp render từng nhóm theo thứ tự đã định
  CATEGORIES.forEach(cat => {
    const section = renderSection(cat, grouped[cat]);
    groupContainer.appendChild(section);
  });
});
