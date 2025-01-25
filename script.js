$(document).ready(function () {
  // Array to store all expense data
  const expenses = [];
  
  // DOM element references
  const $defaultView = $("#defaultView"); // Default view with "Add New Expense" button
  const $formView = $("#formView"); // Expense form view
  const $expenseForm = $("#expenseForm"); // Form element for expense submission
  const $expenseList = $("#expenseList"); // List to display expenses
  const $filterYear = $("#filterYear"); // Year filter dropdown
  const $noExpensesMessage = $("#noExpensesMessage"); // Message displayed when no expenses are found
  const $showFormButton = $("#showFormButton"); // Button to show the expense form
  const $cancelButton = $("#cancelButton"); // Button to hide the expense form

  // Show the Expense Form
  $showFormButton.on("click", function () {
    $defaultView.hide(); // Hide the default view
    $formView.show(); // Show the form view
  });

  // Hide the Expense Form
  $cancelButton.on("click", function () {
    $formView.hide(); // Hide the form view
    $defaultView.show(); // Show the default view
  });

  // Populate year dropdown with unique years from expense data
  const populateYears = () => {
    const years = [
      ...new Set(expenses.map((exp) => new Date(exp.date).getFullYear())),
    ];
    $filterYear.empty().append('<option value="all">All</option>');
    years.forEach((year) =>
      $filterYear.append(`<option value="${year}">${year}</option>`)
    );
  };

  // Render expenses in the expense list
  const renderExpenses = () => {
    const selectedYear = $filterYear.val();
    const filteredExpenses =
      selectedYear === "all"
        ? expenses
        : expenses.filter(
            (exp) => new Date(exp.date).getFullYear().toString() === selectedYear
          );

    $expenseList.empty(); // Clear the list before appending new data

    if (filteredExpenses.length === 0) {
      $noExpensesMessage.show(); // Show "no expenses" message
    } else {
      $noExpensesMessage.hide(); // Hide "no expenses" message

      // Append each expense to the list
      filteredExpenses.forEach((exp) => {
        $expenseList.append(`
          <li class="list-group-item expense-item mb-3 d-flex justify-content-between align-items-center">
            <div class="expense-date-box text-center d-flex flex-column justify-content-center align-items-center">
              <span class="expense-month">${new Date(exp.date).toLocaleDateString('en-US', { month: 'long' })}</span>
              <span class="expense-year">${new Date(exp.date).getFullYear()}</span>
              <span class="expense-day">${new Date(exp.date).getDate()}</span>
            </div>
            <span class="expense-title text-end">${exp.title}</span>
            <span class="expense-amount">$${exp.amount.toFixed(2)}</span>
          </li>
        `);
      });
    }

    updateChart(filteredExpenses); // Update the chart with filtered data
    renderSummary(filteredExpenses); // Update the monthly spending summary
  };

  // Render monthly spending summary
  const renderSummary = (filteredExpenses) => {
    const summaryList = $("#summaryList");
    summaryList.empty(); // Clear the summary list

    if (filteredExpenses.length === 0) {
      summaryList.append(`
        <li class="list-group-item text-center text-white">
          No expenses to summarize.
        </li>
      `);
      return;
    }

    const monthlyTotals = Array(12).fill(0); // Initialize totals for all months

    // Calculate total spending by month
    filteredExpenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth(); // 0 for Jan, 1 for Feb, etc.
      monthlyTotals[month] += exp.amount;
    });

    // Append the monthly totals to the summary
    monthlyTotals.forEach((total, index) => {
      if (total > 0) {
        const monthName = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][index];

        summaryList.append(`
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span class="text-white">${monthName}</span>
            <span class="expense-amount">$${total.toFixed(2)}</span>
          </li>
        `);
      }
    });
  };

  // Update the chart with filtered data
  const updateChart = (filteredExpenses) => {
    const monthlyTotals = Array(12).fill(0);

    filteredExpenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth();
      monthlyTotals[month] += exp.amount;
    });

    const maxExpense = Math.max(...monthlyTotals, 1); // Prevent division by zero

    const chartContainer = $(".chart-container");
    chartContainer.empty(); // Clear previous chart content

    monthlyTotals.forEach((total, index) => {
      const monthName = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][index];
      const percentage = (total / maxExpense) * 100;

      chartContainer.append(`
        <div class="d-flex">
          <div class="progress">
            <div
              class="progress-bar"
              role="progressbar"
              style="height: ${percentage}%;"
              aria-valuenow="${percentage}"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <span>${monthName}</span>
        </div>
      `);
    });
  };

  // Handle form submission to add a new expense
  $expenseForm.on("submit", function (e) {
    e.preventDefault();

    const title = $("#title").val().trim();
    const amount = parseFloat($("#amount").val());
    const date = $("#date").val();

    // Validate inputs
    if (!title || !amount || !date || amount <= 0) {
      alert("Please fill out all fields with valid data.");
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

  // Handle year filter changes
  $filterYear.on("change", renderExpenses);

  // Initial rendering of expenses and chart
  renderExpenses();
});
