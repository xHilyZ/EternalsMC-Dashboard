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
}

// Switch pages
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Apply fund changes
async function applyFundsChange() {
    const cleanDelta = Number(document.getElementById('cleanDelta').value || 0);
    const dirtyDelta = Number(document.getElementById('dirtyDelta').value || 0);

    try {
        const res = await fetch('/api/updateFunds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cleanDelta, dirtyDelta })
        });

        data.funds = await res.json();
        renderDashboard();
    } catch (err) {
        console.error("Failed to update funds:", err);
    }
}

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
async function addMember() {
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
}

// Remove a member
async function removeMember(index) {
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
}

// Start
loadData();
