let data = null;

// Load initial data
async function loadData() {
    try {
        const res = await fetch('/api/getData');
        data = await res.json();
        renderDashboard();
    } catch (err) {
        console.error("Failed to load data:", err);
    }
}

// Render dashboard values
function renderDashboard() {
    if (!data) return;

    document.getElementById("cleanMoney").innerText = "$" + data.funds.clean.toLocaleString();
    document.getElementById("dirtyMoney").innerText = "$" + data.funds.dirty.toLocaleString();
    document.getElementById("fundTotal").innerText = "$" + (data.funds.clean + data.funds.dirty).toLocaleString();

    document.getElementById("memberCount").innerText = data.members.length;

    renderMembers();
    renderTransactions();
}

// Switch pages
window.showPage = function (id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
};

// Apply fund changes + log transaction
window.applyFundsChange = async function () {
    const cleanDelta = Number(document.getElementById('cleanDelta').value || 0);
    const dirtyDelta = Number(document.getElementById('dirtyDelta').value || 0);
    const loggedBy = document.getElementById('txLoggedBy')?.value.trim() || "";
    const description = document.getElementById('txDescription')?.value.trim() || "";

    try {
        // Clean
        if (cleanDelta !== 0) {
            const res = await fetch('/api/addTransaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'clean',
                    delta: cleanDelta,
                    logged_by: loggedBy,
                    description
                })
            });

            const result = await res.json();
            data.funds.clean = result.funds.clean;
            data.transactions.unshift(result.transaction);
        }

        // Dirty
        if (dirtyDelta !== 0) {
            const res = await fetch('/api/addTransaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'dirty',
                    delta: dirtyDelta,
                    logged_by: loggedBy,
                    description
                })
            });

            const result = await res.json();
            data.funds.dirty = result.funds.dirty;
            data.transactions.unshift(result.transaction);
        }

        // Clear inputs
        document.getElementById('cleanDelta').value = "";
        document.getElementById('dirtyDelta').value = "";

        renderDashboard();
    } catch (err) {
        console.error("Failed to update funds:", err);
    }
};

// Render members list
function renderMembers() {
    const list = document.getElementById("memberList");

    list.innerHTML = data.members
        .map((m, index) => `
            <li class="member-item">
                <span>${m.name} — ${m.rank}</span>
                <button class="remove-btn" onclick="removeMember(${index})">Remove</button>
            </li>
        `)
        .join("");
}

// Add a member
window.addMember = async function () {
    const name = document.getElementById("memberName").value.trim();
    const rank = document.getElementById("memberRank").value.trim();

    if (!name || !rank) return;

    try {
        const res = await fetch('/api/updateMembers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "add", name, rank })
        });

        data.members = (await res.json()).members;
        renderMembers();

        document.getElementById("memberName").value = "";
        document.getElementById("memberRank").value = "";
    } catch (err) {
        console.error("Failed to add member:", err);
    }
};

// Remove a member
window.removeMember = async function (index) {
    try {
        const res = await fetch('/api/updateMembers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "remove", index })
        });

        data.members = (await res.json()).members;
        renderMembers();
    } catch (err) {
        console.error("Failed to remove member:", err);
    }
};

// Render transaction log
function renderTransactions() {
    const tbody = document.getElementById("transactionTableBody");
    if (!tbody || !data.transactions) return;

    tbody.innerHTML = data.transactions
        .map(t => `
            <tr>
                <td>${new Date(t.created_at).toLocaleString()}</td>
                <td>${t.logged_by || "—"}</td>
                <td>${t.type}</td>
                <td>${t.direction}</td>
                <td>${t.delta > 0 ? "+" : ""}${t.delta.toLocaleString()}</td>
                <td>${t.balance_after.toLocaleString()}</td>
                <td>${t.description || ""}</td>
            </tr>
        `)
        .join("");
}

// Start
loadData();
