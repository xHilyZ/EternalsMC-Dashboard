const API_BASE = "/api";
let editingMemberId = null;

// FORMAT NUMBER WITH COMMAS
function format(num) {
    return Number(num).toLocaleString();
}

// MELBOURNE TIME OFFSET (AEDT = UTC+11)
const MELBOURNE_OFFSET = 11;

// DAILY TASKS
const DAILY_TASKS = [
    "Collect club dues",
    "Check weapon stock",
    "Refill drug lab supplies",
    "Update member activity",
    "Review deals for the day"
];

// LOAD DASHBOARD
async function loadDashboard() {
    const res = await fetch(`${API_BASE}/getData`);
    const data = await res.json();

    updateFundsUI(data.funds);
    updateMembersUI(data.members);
    updateTransactionsUI(data.transactions);
    updateTopStats(data.funds, data.members, data.transactions);
}

// TOP STATS
function updateTopStats(funds, members, transactions) {
    const totalMoney = (funds.clean || 0) + (funds.dirty || 0);

    document.getElementById("totalMoney").textContent = `$${format(totalMoney)}`;
    document.getElementById("totalDeals").textContent = format(transactions.length);
    document.getElementById("activeMembers").textContent = format(members.length);
}

// FUNDS UI
function updateFundsUI(funds) {
    document.getElementById("cleanBalance").innerText = format(funds.clean);
    document.getElementById("dirtyBalance").innerText = format(funds.dirty);
}

// MEMBERS UI
function updateMembersUI(members) {
    const container = document.getElementById("membersList");
    container.innerHTML = "";

    members.forEach(member => {
        const div = document.createElement("div");
        div.className = "member-item";
        div.innerHTML = `
            <span>${member.name}</span>
            <span>${member.rank ?? "Member"}</span>
            <button onclick="openEditModal('${member.id}', '${member.name}', '${member.rank}')">Edit</button>
            <button onclick="removeMember('${member.id}')">Remove</button>
        `;
        container.appendChild(div);
    });
}

// TRANSACTIONS UI
function updateTransactionsUI(transactions) {
    const container = document.getElementById("transactionsList2");
    container.innerHTML = "";

    transactions.forEach(tx => {
        const div = document.createElement("div");
        div.className = "transaction-item";

        const sign = tx.type === "income" ? "+" : "-";
        const color = tx.type === "income" ? "green" : "red";

        div.innerHTML = `
            <span>${tx.description}</span>
            <span style="color:${color}">${sign}$${format(tx.amount)}</span>
        `;

        container.appendChild(div);
    });
}

// ADD TRANSACTION
async function addTransaction() {
    const description = document.getElementById("txDescription").value;
    const amount = parseFloat(document.getElementById("txAmount").value);
    const type = document.getElementById("txType").value;

    if (!description || isNaN(amount)) return alert("Enter valid description and amount.");

    await fetch(`${API_BASE}/addTransaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount, type })
    });

    loadDashboard();
}

// UPDATE FUNDS
async function updateFunds() {
    const clean = parseFloat(document.getElementById("cleanInput").value) || 0;
    const dirty = parseFloat(document.getElementById("dirtyInput").value) || 0;

    await fetch(`${API_BASE}/updateFunds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clean, dirty })
    });

    loadDashboard();
}

// ADD MEMBER
async function updateMembers() {
    const name = document.getElementById("memberName").value;
    const rank = document.getElementById("memberRank").value;

    if (!name || !rank) return alert("Enter valid member name and rank.");

    await fetch(`${API_BASE}/updateMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rank })
    });

    document.getElementById("memberName").value = "";
    document.getElementById("memberRank").value = "";

    loadDashboard();
}

// REMOVE MEMBER
async function removeMember(id) {
    await fetch(`${API_BASE}/updateMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeId: id })
    });

    loadDashboard();
}

// CHECKLIST LOGIC
function loadChecklist() {
    const container = document.getElementById("checklistContainer");
    container.innerHTML = "";

    const saved = JSON.parse(localStorage.getItem("dailyChecklist")) || {};

    DAILY_TASKS.forEach(task => {
        const checked = saved[task] || false;

        const div = document.createElement("div");
        div.className = "check-item";
        div.innerHTML = `
            <input type="checkbox" ${checked ? "checked" : ""} onchange="toggleTask('${task}')">
            <label>${task}</label>
        `;
        container.appendChild(div);
    });
}

function toggleTask(task) {
    const saved = JSON.parse(localStorage.getItem("dailyChecklist")) || {};
    saved[task] = !saved[task];
    localStorage.setItem("dailyChecklist", JSON.stringify(saved));
}

function scheduleDailyReset() {
    const now = new Date();
    const melbourneNow = new Date(now.getTime() + MELBOURNE_OFFSET * 3600 * 1000);

    const tomorrow = new Date(melbourneNow);
    tomorrow.setHours(24, 0, 0, 0);

    const msUntilReset = tomorrow - melbourneNow;

    setTimeout(() => {
        localStorage.removeItem("dailyChecklist");
        loadChecklist();
        scheduleDailyReset();
    }, msUntilReset);
}

function openChecklist() {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page-checklist").classList.add("active");
    loadChecklist();
}

scheduleDailyReset();

// EDIT MODAL
function openEditModal(id, name, rank) {
    editingMemberId = id;

    document.getElementById("editName").value = name;
    document.getElementById("editRank").value = rank;

    document.getElementById("editModal").style.display = "block";
}

document.getElementById("cancelEditBtn").addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
});

document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const name = document.getElementById("editName").value;
    const rank = document.getElementById("editRank").value;

    await fetch(`${API_BASE}/updateMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editId: editingMemberId, name, rank })
    });

    document.getElementById("editModal").style.display = "none";
    loadDashboard();
});

// EVENT LISTENERS
document.getElementById("addTxBtn").addEventListener("click", addTransaction);
document.getElementById("updateFundsBtn").addEventListener("click", updateFunds);
document.getElementById("updateMembersBtn").addEventListener("click", updateMembers);

// INIT
loadDashboard();
