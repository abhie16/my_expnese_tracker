// State
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];

// DOM Elements
const dailySpendEl = document.getElementById('daily-spend');
const monthlySpendEl = document.getElementById('monthly-spend');
const expenseForm = document.getElementById('expense-form');
const categoryForm = document.getElementById('category-form');
const categorySelect = document.getElementById('expense-category');
const categoriesListEl = document.getElementById('categories-list');
const expenseListEl = document.getElementById('expense-list');

// Budget Bar Elements
const budgetBarContainer = document.getElementById('budget-bar-container');
const budgetCategoryName = document.getElementById('budget-category-name');
const budgetStatus = document.getElementById('budget-status');
const progressBarFill = document.getElementById('progress-bar-fill');
const budgetWarning = document.getElementById('budget-warning');
const expenseAmountInput = document.getElementById('expense-amount');

// Chart Instance
let expenseChart = null;

// Initialize App
function init() {
    // Set default date to today
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Default categories if empty
    if (categories.length === 0) {
        categories = [
            { id: generateId(), name: 'Food', budget: 500 },
            { id: generateId(), name: 'Transport', budget: 200 }
        ];
        saveData();
    }

    updateUI();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    categoryForm.addEventListener('submit', handleAddCategory);
    expenseForm.addEventListener('submit', handleAddExpense);
    
    categorySelect.addEventListener('change', updateBudgetBar);
    expenseAmountInput.addEventListener('input', updateBudgetBar);
}

// Handlers
function handleAddCategory(e) {
    e.preventDefault();
    const nameInput = document.getElementById('category-name');
    const budgetInput = document.getElementById('category-budget');

    const name = nameInput.value.trim();
    const budget = parseFloat(budgetInput.value);

    if (!name || isNaN(budget) || budget <= 0) return;

    // Check if category already exists
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert('Category already exists!');
        return;
    }

    const newCategory = {
        id: generateId(),
        name,
        budget
    };

    categories.push(newCategory);
    saveData();
    updateUI();

    nameInput.value = '';
    budgetInput.value = '';
}

function handleAddExpense(e) {
    e.preventDefault();
    const amount = parseFloat(expenseAmountInput.value);
    const date = document.getElementById('expense-date').value;
    const tag = document.getElementById('expense-tag').value.trim();
    const categoryId = categorySelect.value;

    if (isNaN(amount) || amount <= 0 || !date || !categoryId) return;

    const newExpense = {
        id: generateId(),
        amount,
        date,
        tag,
        categoryId
    };

    expenses.push(newExpense);
    saveData();
    updateUI();
    updateBudgetBar(); // Reset or update bar after adding

    expenseAmountInput.value = '';
    document.getElementById('expense-tag').value = '';
}

function deleteCategory(id) {
    categories = categories.filter(c => c.id !== id);
    // Optionally delete associated expenses or mark them uncategorized. For simplicity, just delete category.
    expenses = expenses.filter(e => e.categoryId !== id);
    saveData();
    updateUI();
    budgetBarContainer.classList.add('hidden');
}

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveData();
    updateUI();
    updateBudgetBar();
}

// UI Updates
function updateUI() {
    renderCategoryDropdown();
    renderCategoriesList();
    renderExpenseList();
    updateStats();
    renderChart();
}

function renderCategoryDropdown() {
    const selectedValue = categorySelect.value;
    categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
    // Restore selection if still exists
    if (categories.some(c => c.id === selectedValue)) {
        categorySelect.value = selectedValue;
    }
}

function renderCategoriesList() {
    categoriesListEl.innerHTML = '';
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="item-details">
                <span class="item-title">${cat.name}</span>
                <span class="item-subtitle">Budget: $${cat.budget.toFixed(2)}</span>
            </div>
            <button class="delete-btn" onclick="deleteCategory('${cat.id}')">Del</button>
        `;
        categoriesListEl.appendChild(item);
    });
}

function renderExpenseList() {
    expenseListEl.innerHTML = '';
    // Sort by date descending
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Only show recent 50 to avoid DOM overload
    sortedExpenses.slice(0, 50).forEach(exp => {
        const category = categories.find(c => c.id === exp.categoryId);
        const categoryName = category ? category.name : 'Unknown';
        
        const item = document.createElement('div');
        item.className = 'list-item';
        
        let tagHtml = exp.tag ? `<span class="item-tag">${exp.tag}</span>` : '';
        
        item.innerHTML = `
            <div class="item-details">
                <div class="item-title">${categoryName} ${tagHtml}</div>
                <span class="item-subtitle">${exp.date}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="item-amount">$${exp.amount.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteExpense('${exp.id}')">Del</button>
            </div>
        `;
        expenseListEl.appendChild(item);
    });
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7); // YYYY-MM

    let dailyTotal = 0;
    let monthlyTotal = 0;

    expenses.forEach(exp => {
        if (exp.date === today) {
            dailyTotal += exp.amount;
        }
        if (exp.date.startsWith(currentMonth)) {
            monthlyTotal += exp.amount;
        }
    });

    dailySpendEl.textContent = `$${dailyTotal.toFixed(2)}`;
    monthlySpendEl.textContent = `$${monthlyTotal.toFixed(2)}`;
}

// Budget Bar Logic
function updateBudgetBar() {
    const categoryId = categorySelect.value;
    if (!categoryId) {
        budgetBarContainer.classList.add('hidden');
        return;
    }

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    budgetBarContainer.classList.remove('hidden');

    // Calculate current month's spending for this category
    const currentMonth = new Date().toISOString().substring(0, 7);
    const spentThisMonth = expenses
        .filter(e => e.categoryId === categoryId && e.date.startsWith(currentMonth))
        .reduce((sum, e) => sum + e.amount, 0);

    const newAmount = parseFloat(expenseAmountInput.value) || 0;
    const projectedTotal = spentThisMonth + newAmount;

    budgetCategoryName.textContent = category.name;
    budgetStatus.textContent = `$${projectedTotal.toFixed(2)} / $${category.budget.toFixed(2)}`;

    let percentage = (projectedTotal / category.budget) * 100;
    
    // Update visuals
    progressBarFill.style.width = `${Math.min(percentage, 100)}%`;
    
    if (percentage > 100) {
        progressBarFill.style.backgroundColor = 'var(--danger-color)';
        budgetWarning.classList.remove('hidden');
    } else if (percentage > 85) {
        progressBarFill.style.backgroundColor = 'var(--warning-color)';
        budgetWarning.classList.add('hidden');
    } else {
        progressBarFill.style.backgroundColor = 'var(--success-color)';
        budgetWarning.classList.add('hidden');
    }
}

// Chart Logic
function renderChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    
    // Get current month spending per category
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    const categoryTotals = {};
    categories.forEach(c => categoryTotals[c.id] = 0);
    
    expenses.forEach(exp => {
        if (exp.date.startsWith(currentMonth) && categoryTotals[exp.categoryId] !== undefined) {
            categoryTotals[exp.categoryId] += exp.amount;
        }
    });

    const labels = categories.map(c => c.name);
    const data = categories.map(c => categoryTotals[c.id]);

    // Accent colors based on CSS vars
    const bgColors = data.map(() => 'rgba(110, 64, 201, 0.6)');
    const borderColors = data.map(() => 'rgba(137, 87, 229, 1)');

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Spent This Month ($)',
                data: data,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#8b949e'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#e6edf3'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e6edf3'
                    }
                }
            }
        }
    });
}

// Helpers
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Start App
init();
