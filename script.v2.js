// -------------------------------
// CONFIG
// -------------------------------
const API_BASE = "/api";

// -------------------------------
// FETCH INITIAL DATA
// -------------------------------
async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/getData`);
        const data = await res.json();

        updateFundsUI(data.funds);
        updateMembersUI(data.members);
        updateTransactionsUI(data.transactions);
    } catch (err) {
        console.error("Error loading dashboard:", err);
    }
}

// -------------------------------
// UPDATE UI SECTIONS
// -------------------------------
function updateFundsUI(funds) {
    document.getElementById("cleanBalance").innerText = funds.clean;
    document.getElementById("dirtyBalance").innerText = funds.dirty;
}

function updateMembersUI(members) {
    const container = document.getElementById("membersList");
    container.innerHTML = "";

    members.forEach(member => {
        const div = document.createElement("div");
        div.className = "member-item";
        div.innerHTML = `
            <span>${member.name}</span>
            <span>${member.role}</span>
        `;
        container.appendChild(div);
    });
}

function updateTransactionsUI(transactions) {
    const container = document.getElementById("transactionsList");
    container.innerHTML = "";

    transactions.forEach(tx => {
        const div = document.createElement("div");
        div.className = "transaction-item";

        const sign = tx.type === "income" ? "+" : "-";
        const color = tx.type === "income" ? "green" : "red";

        div.innerHTML = `
            <span>${tx.description}</span>
            <span style="color:${color}">${sign}$${tx.amount}</span>
        `;

        container.appendChild(div);
    });
}

// -------------------------------
// ADD TRANSACTION
// -------------------------------
async function addTransaction() {
    const description = document.getElementById("txDescription").value;
    const amount = parseFloat(document.getElementById("txAmount").value);
    const type = document.getElementById("txType").value;

    if (!description || isNaN(amount)) {
        alert("Enter valid description and amount.");
        return;
    }

    try {
        await fetch(`${API_BASE}/addTransaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description, amount, type })
        });

        loadDashboard();
    } catch (err) {
        console.error("Error adding transaction:", err);
    }
}

// -------------------------------
// UPDATE FUNDS
// -------------------------------
async function updateFunds() {
    const clean = parseFloat(document.getElementById("cleanInput").value);
    const dirty = parseFloat(document.getElementById("dirtyInput").value);

    if (isNaN(clean) || isNaN(dirty)) {
        alert("Enter valid numbers.");
        return;
    }

    try {
        await fetch(`${API_BASE}/updateFunds`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clean, dirty })
        });

        loadDashboard();
    } catch (err) {
        console.error("Error updating funds:", err);
    }
}

// -------------------------------
// UPDATE MEMBERS
// -------------------------------
async function updateMembers() {
    const name = document.getElementById("memberName").value;
    const role = document.getElementById("memberRole").value;

    if (!name || !role) {
        alert("Enter valid member name and role.");
        return;
    }

    try {
        await fetch(`${API_BASE}/updateMembers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, role })
        });

        loadDashboard();
    } catch (err) {
        console.error("Error updating members:", err);
    }
}

// -------------------------------
// EVENT LISTENERS
// -------------------------------
document.getElementById("addTxBtn").addEventListener("click", addTransaction);
document.getElementById("updateFundsBtn").addEventListener("click", updateFunds);
document.getElementById("updateMembersBtn").addEventListener("click", updateMembers);

// -------------------------------
// INIT
// -------------------------------
loadDashboard();
