document.addEventListener('DOMContentLoaded', () => {
  // 1. Lấy mảng task (tất cả) và completedTasks
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

  // 2. Lấy tháng & năm ban đầu (tháng hiện tại)
  const now = new Date();
  let displayMonth = now.getMonth(); // 0–11
  let displayYear = now.getFullYear();

  // 3. Chuẩn bị dữ liệu cho biểu đồ đường (số công việc hoàn thành mỗi ngày)
  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }
  function prepareLineChartData(month, year) {
    const daysCount = getDaysInMonth(month, year);
    const labels = [];
    for (let d = 1; d <= daysCount; d++) labels.push(d.toString());
    const dataCounts = new Array(daysCount).fill(0);

    completedTasks.forEach(item => {
      if (!item.completedAt) return;
      const date = new Date(item.completedAt);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const idx = date.getDate() - 1;
        if (idx >= 0 && idx < daysCount) dataCounts[idx]++;
      }
    });

    return { labels, dataCounts };
  }

  // 4. Vẽ biểu đồ đường
  function renderLineChart(month, year) {
    const { labels, dataCounts } = prepareLineChartData(month, year);
    const ctx = document.getElementById('completionLineChart').getContext('2d');
    if (window.myLineChart) window.myLineChart.destroy();

    window.myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Số Công Việc Hoàn Thành',
          data: dataCounts,
          fill: false,
          borderColor: '#4a148c',
          backgroundColor: '#7e57c2',
          tension: 0.2,
          pointRadius: 4,
          pointBackgroundColor: '#4a148c',
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: `Ngày trong tháng ${month + 1}/${year}`
            }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Số công việc' },
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => `Hoàn thành: ${context.parsed.y}`
            }
          }
        }
      }
    });
  }

  // 5. Render danh sách công việc đã hoàn thành và chưa hoàn thành
  function renderCompletedList(month, year) {
    const completedList = document.getElementById('completed-tasks-list');
    completedList.innerHTML = '';

    // --- A. Danh sách đã hoàn thành ---
    const doneHeader = document.createElement('li');
    doneHeader.textContent = '◾︎ Công việc đã hoàn thành trong tháng:';
    doneHeader.style.fontWeight = '600';
    doneHeader.style.marginTop = '10px';
    completedList.appendChild(doneHeader);

    // Lọc completedTasks theo tháng-năm
    const doneItems = completedTasks.filter(item => {
      if (!item.completedAt) return false;
      const date = new Date(item.completedAt);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    if (doneItems.length === 0) {
      const li = document.createElement('li');
      li.textContent = '— Chưa có công việc nào được hoàn thành.';
      li.style.fontStyle = 'italic';
      completedList.appendChild(li);
    } else {
      doneItems.forEach(item => {
        const li = document.createElement('li');
        const date = new Date(item.completedAt);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        // dấu ✓ cùng thời gian hoàn thành
        li.textContent = `✓ ${item.task} — Đã hoàn thành lúc ${dateStr}`;
        completedList.appendChild(li);
      });
    }

    // --- B. Danh sách những công việc đã hết hạn nhưng chưa hoàn thành ---
    const pendingHeader = document.createElement('li');
    pendingHeader.textContent = '◾︎ Công việc hết hạn (chưa hoàn thành) trong tháng:';
    pendingHeader.style.fontWeight = '600';
    pendingHeader.style.marginTop = '20px';
    completedList.appendChild(pendingHeader);

    // Tạo tập hợp các ID đã hoàn thành để loại ra
    const doneIdSet = new Set(completedTasks.map(item => item.id));

    // Lọc tasks có deadline trong tháng-năm, đã qua thời điểm hiện tại,
    // nhưng không có trong doneIdSet => chưa hoàn thành
    const expiredItems = tasks
      .map((t, idx) => ({ idx, task: t }))
      .filter(o => {
        if (!o.task.deadline) return false;
        const dl = new Date(o.task.deadline);
        return (
          dl.getFullYear() === year &&
          dl.getMonth() === month &&
          dl.getTime() < now.getTime() &&
          !doneIdSet.has(o.idx)
        );
      });

    if (expiredItems.length === 0) {
      const li = document.createElement('li');
      li.textContent = '— Không có công việc nào hết hạn (chưa hoàn thành).';
      li.style.fontStyle = 'italic';
      completedList.appendChild(li);
    } else {
      expiredItems.forEach(o => {
        const dl = new Date(o.task.deadline);
        const dlStr = `${dl.getDate()}/${dl.getMonth() + 1}/${dl.getFullYear()} ${String(dl.getHours()).padStart(2, '0')}:${String(dl.getMinutes()).padStart(2, '0')}`;
        const li = document.createElement('li');
        // dấu ✗ và ghi trạng thái
        li.textContent = `✗ ${o.task.text} — Deadline: ${dlStr} — Chưa hoàn thành`;
        completedList.appendChild(li);
      });
    }
  }

  // 6. Xây dựng lịch và đánh dấu
  const calendarGrid = document.getElementById('calendar-grid');
  const monthYearLabel = document.getElementById('month-year');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  function buildCalendar(month, year) {
    calendarGrid.innerHTML = '';
    monthYearLabel.textContent = `${month + 1}/${year}`;

    const firstDay = new Date(year, month, 1).getDay(); // 0=CN,1=T2,...6=T7
    const daysInMonth = getDaysInMonth(month, year);

    // Các ô trống trước ngày 1
    const startIndex = firstDay === 0 ? 0 : firstDay;
    for (let i = 0; i < startIndex; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.classList.add('other-month');
      calendarGrid.appendChild(emptyDiv);
    }

    // Mỗi ngày trong tháng
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.textContent = d;
      cell.style.position = 'relative'; // cần cho tooltip

      // "today"
      if (year === now.getFullYear() && month === now.getMonth() && d === now.getDate()) {
        cell.classList.add('today');
      }

      // Tìm tất cả task có deadline vào ngày này
      const matchingTasks = tasks.filter(item => {
        if (!item.deadline) return false;
        const dt = new Date(item.deadline);
        return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d;
      });

      if (matchingTasks.length > 0) {
        // Nếu có ít nhất 1 task, tô màu xanh
        cell.classList.add('completed');

        // Tạo tooltip nội dung
        const titles = matchingTasks.map(i => i.text).join('\n');
        cell.dataset.tooltip = titles; // sử dụng CSS dựa trên data-tooltip
      }

      calendarGrid.appendChild(cell);
    }
  }

  prevBtn.addEventListener('click', () => {
    displayMonth--;
    if (displayMonth < 0) {
      displayMonth = 11;
      displayYear--;
    }
    renderAll(displayMonth, displayYear);
  });
  nextBtn.addEventListener('click', () => {
    displayMonth++;
    if (displayMonth > 11) {
      displayMonth = 0;
      displayYear++;
    }
    renderAll(displayMonth, displayYear);
  });

  // 7. Hàm tổng hợp: vẽ chart, liệt kê, xây lịch
  function renderAll(month, year) {
    renderLineChart(month, year);
    renderCompletedList(month, year);
    buildCalendar(month, year);
  }

  // 8. Chạy lần đầu
  renderAll(displayMonth, displayYear);
});
