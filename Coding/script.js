$(document).ready(function () {
  const expenses = []; // Store all expense data
  const $defaultView = $("#defaultView");
  const $formView = $("#formView");
  const $expenseForm = $("#expenseForm");
  const $expenseList = $("#expenseList");
  const $filterYear = $("#filterYear");
  const $noExpensesMessage = $("#noExpensesMessage");
  const $chartCanvas = $("#expenseChart");
  const $showFormButton = $("#showFormButton");
  const $cancelButton = $("#cancelButton");
  let chart;

  // Show the Expense Form in the same box
  $showFormButton.on("click", function () {
    $defaultView.hide();
    $formView.show();
  });

  // Hide the Expense Form and show the button
  $cancelButton.on("click", function () {
    $formView.hide();
    $defaultView.show();
  });

  // Populate year dropdown
  const populateYears = () => {
    const years = [
      ...new Set(expenses.map((exp) => new Date(exp.date).getFullYear())),
    ];
    $filterYear.empty().append('<option value="all">All</option>');
    years.forEach((year) =>
      $filterYear.append(`<option value="${year}">${year}</option>`)
    );
  };

  // Render expenses
  const renderExpenses = () => {
    const selectedYear = $filterYear.val();
    const filteredExpenses =
      selectedYear === "all"
        ? expenses
        : expenses.filter(
            (exp) =>
              new Date(exp.date).getFullYear().toString() === selectedYear
          );

    console.log("Filtered Expenses:", filteredExpenses); // Debugging

    $expenseList.empty(); // Clear the list before appending
    if (filteredExpenses.length === 0) {
      $noExpensesMessage.show();
    } else {
      $noExpensesMessage.hide();
      filteredExpenses.forEach((exp, index) => {
        $expenseList.append(`
          <li class="list-group-item expense-item mb-3 d-flex justify-content-between align-items-center" id="expense-${index}">
            <span class="expense-date">${new Date(
              exp.date
            ).toLocaleDateString()}</span>
            <span class="expense-amount">$${exp.amount.toFixed(2)}</span>
            <span class="expense-title text-end">${exp.title}</span>
          </li>
        `);
      });
    }

    updateChart(filteredExpenses); // Update chart with filtered data
  };

  // Ensure `updateChart` does not remove the message
  const updateChart = (filteredExpenses) => {
    const monthlyTotals = Array(12).fill(0);
    filteredExpenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth();
      monthlyTotals[month] += exp.amount;
    });

    const maxExpense = Math.max(...monthlyTotals, 1); // Prevent division by zero

    const chartContainer = $(".chart-container");
    chartContainer.empty(); // Clear previous content

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

      // Add a vertical progress bar for each month
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

  // Handle Form Submission
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

  // Handle Year Filter
  $filterYear.on("change", renderExpenses);

  // Initial call to ensure UI renders correctly
  renderExpenses();
});
