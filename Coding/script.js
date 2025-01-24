$(document).ready(function () {
  const expenses = []; // Store all expense data
  const $defaultView = $('#defaultView');
  const $formView = $('#formView');
  const $expenseForm = $('#expenseForm');
  const $expenseList = $('#expenseList');
  const $filterYear = $('#filterYear');
  const $noExpensesMessage = $('#noExpensesMessage');
  const $chartCanvas = $('#expenseChart');
  const $showFormButton = $('#showFormButton');
  const $cancelButton = $('#cancelButton');
  let chart;

  // Show the Expense Form in the same box
  $showFormButton.on('click', function () {
    $defaultView.hide();
    $formView.show();
  });

  // Hide the Expense Form and show the button
  $cancelButton.on('click', function () {
    $formView.hide();
    $defaultView.show();
  });

  // Populate year dropdown
  const populateYears = () => {
    const years = [...new Set(expenses.map(exp => new Date(exp.date).getFullYear()))];
    $filterYear.empty().append('<option value="all">All</option>');
    years.forEach(year => $filterYear.append(`<option value="${year}">${year}</option>`));
  };

  // Render expenses
  const renderExpenses = () => {
    const selectedYear = $filterYear.val();
    const filteredExpenses = selectedYear === 'all'
      ? expenses
      : expenses.filter(exp => new Date(exp.date).getFullYear().toString() === selectedYear);

    $expenseList.empty(); // Clear the list before appending
    if (filteredExpenses.length === 0) {
      $noExpensesMessage.show();
    } else {
      $noExpensesMessage.hide();
      filteredExpenses.forEach(exp => {
        $expenseList.append(`
          <li class="list-group-item d-flex justify-content-between align-items-center">
            ${exp.title} - $${exp.amount.toFixed(2)} 
            <span class="text-muted">${new Date(exp.date).toLocaleDateString()}</span>
          </li>
        `);
      });
    }

    updateChart(filteredExpenses); // Update chart with filtered data
  };

  // Update Chart with progress bars
  const updateChart = (filteredExpenses) => {
    const monthlyTotals = Array(12).fill(0); // Initialize totals for each month
    filteredExpenses.forEach(exp => {
      const month = new Date(exp.date).getMonth();
      monthlyTotals[month] += exp.amount;
    });
  
    const maxExpense = Math.max(...monthlyTotals, 1); // Prevent division by zero
  
    // Select or create the wrapper for the progress bars
    let progressBarsWrapper = $('.chart-container .progress-bars-wrapper');
    if (progressBarsWrapper.length === 0) {
      progressBarsWrapper = $('<div class="progress-bars-wrapper p-3 mb-4"></div>');
      $('.chart-container').prepend(progressBarsWrapper); // Add it above the list/message
    }
  
    progressBarsWrapper.empty(); // Clear only the progress bars
  
    monthlyTotals.forEach((total, index) => {
      const monthName = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ][index];
      const percentage = (total / maxExpense) * 100;
  
      // Add a progress bar for each month
      progressBarsWrapper.append(`
        <div class="mb-3">
          <div class="d-flex justify-content-between">
            <span>${monthName}</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <div class="progress">
            <div
              class="progress-bar"
              role="progressbar"
              style="width: ${percentage}%;"
              aria-valuenow="${percentage}"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      `);
    });
  };
  

  // Handle Form Submission
  $expenseForm.on('submit', function (e) {
    e.preventDefault();

    const title = $('#title').val().trim();
    const amount = parseFloat($('#amount').val());
    const date = $('#date').val();

    // Validate inputs
    if (!title || !amount || !date || amount <= 0) {
      alert('Please fill out all fields with valid data.');
      return;
    }

    // Add expense to array
    expenses.push({ title, amount, date });

    // Reset the form and toggle the view
    $expenseForm[0].reset();
    $formView.hide();
    $defaultView.show();

    populateYears(); // Update year dropdown
    renderExpenses(); // Refresh the expense list and chart
  });

  // Handle Year Filter
  $filterYear.on('change', renderExpenses);

  // Initial call to ensure UI renders correctly
  renderExpenses();
});
