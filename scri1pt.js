document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.todos-container');
    
  
    const toggleEmptyState = () => {
      emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
      todosContainer.style.width = taskList.children.length > 0 ? '100%' : '50%';
    };
  
    const addTask = (event) => {
      event.preventDefault();
      const taskText = taskInput.value.trim();
      if (!taskText) return;
  
      const li = document.createElement('li');
      li.innerHTML = `
        <input type="checkbox" class="checkbox">
        <span>${taskText}</span>
        <div class="task-buttons">
          <button class="edit-btn"><i class="fa fa-pen"></i></button>
          <button class="delete-btn"><i class="fa fa-trash"></i></button>
        </div>
      `;
  
      const checkbox = li.querySelector('.checkbox');
      const editBtn = li.querySelector('.edit-btn');
      const deleteBtn = li.querySelector('.delete-btn');
  
      editBtn.addEventListener('click', () => {
        if (!checkbox.checked) {
          taskInput.value = li.querySelector('span').textContent;
          li.remove();
          toggleEmptyState();
        }
      });
  
      deleteBtn.addEventListener('click', () => {
        li.remove();
        toggleEmptyState();
      });
  
      taskList.appendChild(li);
      taskInput.value = '';
      toggleEmptyState();
    };
  
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTask(e);
      }
    });
  });

  document.getElementById('add-work-btn').addEventListener('click', () => {
  // Lấy tất cả công việc trong task-list
  const tasks = [];
  document.querySelectorAll('#task-list li span').forEach(span => {
    tasks.push(span.textContent);
  });

  
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  
  window.location.href = 'work.html';
});

  