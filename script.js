let data = null;

async function loadData() {
    const res = await fetch('/api/getData');
    data = await res.json();
    renderDashboard();
}

function renderDashboard() {
    document.getElementById("cleanMoney").innerText = "$" + data.funds.clean;
    document.getElementById("dirtyMoney").innerText = "$" + data.funds.dirty;
    document.getElementById("fundTotal").innerText = "$" + (data.funds.clean + data.funds.dirty);

    document.getElementById("memberCount").innerText = data.members.length;
    renderMembers();
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

async function applyFundsChange() {
    const cleanDelta = Number(document.getElementById('cleanDelta').value || 0);
    const dirtyDelta = Number(document.getElementById('dirtyDelta').value || 0);

    const res = await fetch('/api/updateFunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleanDelta, dirtyDelta })
    });

    data.funds = await res.json();
    renderDashboard();
}

function renderMembers() {
    document.getElementById("memberList").innerHTML = data.members
        .map((m, index) => `
            <li>
                <span>${m.name} — ${m.rank}</span>
                <button onclick="removeMember(${index})">Remove</button>
            </li>
        `)
        .join("");
}

async function addMember() {
    const name = document.getElementById("memberName").value.trim();
    const rank = document.getElementById("memberRank").value.trim();

    if (!name || !rank) return;

    const res = await fetch('/api/updateMembers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "add", name, rank })
    });

    data.members = (await res.json()).members;
    renderMembers();
}

async function removeMember(index) {
    const res = await fetch('/api/updateMembers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "remove", index })
    });

    data.members = (await res.json()).members;
    renderMembers();
}

loadData();
