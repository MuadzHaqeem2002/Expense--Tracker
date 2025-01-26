$(document).ready(function () {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  const $defaultView = $("#defaultView");
  const $formView = $("#formView");
  const $expenseForm = $("#expenseForm");
  const $expenseList = $("#expenseList");
  const $filterYear = $("#filterYear");
  const $noExpensesMessage = $("#noExpensesMessage");
  const $showFormButton = $("#showFormButton");
  const $cancelButton = $("#cancelButton");

  $showFormButton.on("click", function () {
    $defaultView.hide();
    $formView.show();
  });

  $cancelButton.on("click", function () {
    $formView.hide();
    $defaultView.show();
  });

  const populateYears = () => {
    const years = [...new Set(expenses.map((exp) => new Date(exp.date).getFullYear()))];
    $filterYear.empty().append('<option value="all">All</option>');
    years.forEach((year) =>
      $filterYear.append(`<option value="${year}">${year}</option>`)
    );
  };

  const renderExpenses = () => {
  const selectedYear = $filterYear.val();
  const filteredExpenses =
    selectedYear === "all"
      ? expenses
      : expenses.filter(
          (exp) => new Date(exp.date).getFullYear().toString() === selectedYear
        );

  $expenseList.empty();

  if (filteredExpenses.length === 0) {
    $noExpensesMessage.show();
  } else {
    $noExpensesMessage.hide();

    filteredExpenses.forEach((exp, index) => {
      $expenseList.append(`
        <li class="list-group-item expense-item mb-3 d-flex justify-content-between align-items-center">
          <div class="expense-date-box text-center d-flex flex-column justify-content-center align-items-center">
            <span class="expense-month">${new Date(exp.date).toLocaleDateString("en-US", {
              month: "long",
            })}</span>
            <span class="expense-year">${new Date(exp.date).getFullYear()}</span>
            <span class="expense-day">${new Date(exp.date).getDate()}</span>
          </div>
          <span class="expense-title text-end">${exp.title}</span>
          <div class="d-flex align-items-center">
            <span class="expense-amount me-2">$${exp.amount.toFixed(2)}</span>
            <button class="btn btn-danger btn-sm delete-expense" data-index="${index}">
              Delete
            </button>
          </div>
        </li>
      `);
    });
  }

  updateChart(filteredExpenses);
  renderSummary(filteredExpenses);
};


  const renderSummary = (filteredExpenses) => {
    const summaryList = $("#summaryList");
    summaryList.empty();

    if (filteredExpenses.length === 0) {
      summaryList.append(`
        <li class="list-group-item text-center text-white">
          No expenses to summarize.
        </li>
      `);
      return;
    }

    const monthlyTotals = Array(12).fill(0);

    filteredExpenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth();
      monthlyTotals[month] += exp.amount;
    });

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

  const updateChart = (filteredExpenses) => {
    const monthlyTotals = Array(12).fill(0);

    filteredExpenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth();
      monthlyTotals[month] += exp.amount;
    });

    const maxExpense = Math.max(...monthlyTotals, 1);

    const chartContainer = $(".chart-container");
    chartContainer.empty();

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

  $expenseForm.on("submit", function (e) {
    e.preventDefault();

    const title = $("#title").val().trim();
    const amount = parseFloat($("#amount").val());
    const date = $("#date").val();

    if (!title || !amount || !date || amount <= 0) {
      alert("Please fill out all fields with valid data.");
      return;
    }

    expenses.push({ title, amount, date });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    $expenseForm[0].reset();
    $formView.hide();
    $defaultView.show();

    populateYears();
    renderExpenses();
  });

  $filterYear.on("change", renderExpenses);

  $expenseList.on("click", ".delete-expense", function () {
    const index = $(this).data("index");
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
    populateYears();
  });

  renderExpenses();
});
