// -------------------------------
// CONFIG
// -------------------------------
const API_BASE = "/api";

let editingMemberId = null;

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

        updateTopStats(data.funds, data.members, data.transactions);

    } catch (err) {
        console.error("Error loading dashboard:", err);
    }
}

// -------------------------------
// UPDATE TOP STATS
// -------------------------------
function updateTopStats(funds, members, transactions) {
    const totalMoney = (funds.clean || 0) + (funds.dirty || 0);
    document.getElementById("totalMoney").textContent = `$${totalMoney}`;
    document.getElementById("totalDeals").textContent = transactions.length;
    document.getElementById("activeMembers").textContent = members.length;
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
            <span>${member.role ?? "Member"}</span>
            <button onclick="openEditModal(${member.id}, '${member.name}', '${member.role}')">Edit</button>
            <button onclick="removeMember(${member.id})">Remove</button>
        `;
        container.appendChild(div);
    });
}

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
    const clean = parseFloat(document.getElementById("cleanInput").value) || 0;
    const dirty = parseFloat(document.getElementById("dirtyInput").value) || 0;

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
// ADD MEMBER
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

        document.getElementById("memberName").value = "";
        document.getElementById("memberRole").value = "";

        loadDashboard();
    } catch (err) {
        console.error("Error updating members:", err);
    }
}

// -------------------------------
// REMOVE MEMBER
// -------------------------------
async function removeMember(id) {
    try {
        await fetch(`${API_BASE}/updateMembers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ removeId: id })
        });

        loadDashboard();
    } catch (err) {
        console.error("Error removing member:", err);
    }
}

// -------------------------------
// EDIT MEMBER MODAL
// -------------------------------
function openEditModal(id, name, role) {
    editingMemberId = id;

    document.getElementById("editName").value = name;
    document.getElementById("editRole").value = role;

    document.getElementById("editModal").style.display = "block";
}

document.getElementById("cancelEditBtn").addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
});

document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const name = document.getElementById("editName").value;
    const role = document.getElementById("editRole").value;

    await fetch(`${API_BASE}/updateMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editId: editingMemberId, name, role })
    });

    document.getElementById("editModal").style.display = "none";
    loadDashboard();
});

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
