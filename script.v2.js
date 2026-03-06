// PAGE SWITCHING
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
}

// LOAD ALL DATA
async function loadData() {
    const res = await fetch("/api/getData");
    const data = await res.json();

    // FUNDS
    document.getElementById("cleanMoney").innerText = "$" + data.funds.clean;
    document.getElementById("dirtyMoney").innerText = "$" + data.funds.dirty;

    // DASHBOARD TOTAL FUNDS
    document.getElementById("fundTotal").innerText = "$" + (data.funds.clean + data.funds.dirty);

    // MEMBERS
    const memberList = document.getElementById("memberList");
    memberList.innerHTML = "";
    data.members.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `${m.name} — ${m.rank} 
            <button onclick="removeMember(${i})">Remove</button>`;
        memberList.appendChild(li);
    });

    // DASHBOARD MEMBER COUNT
    document.getElementById("memberCount").innerText = data.members.length;

    // TRANSACTIONS
    const txBody = document.getElementById("transactionTableBody");
    txBody.innerHTML = "";
    data.transactions.forEach(tx => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${new Date(tx.created_at).toLocaleString()}</td>
            <td>${tx.logged_by || "-"}</td>
            <td>${tx.type}</td>
            <td>${tx.direction}</td>
            <td>${tx.delta}</td>
            <td>${tx.balance_after}</td>
            <td>${tx.description || "-"}</td>
        `;
        txBody.appendChild(row);
    });
}

// ADD MEMBER
async function addMember() {
    const name = document.getElementById("memberName").value;
    const rank = document.getElementById("memberRank").value;

    await fetch("/api/updateMembers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", name, rank })
    });

    loadData();
}

// REMOVE MEMBER
async function removeMember(index) {
    await fetch("/api/updateMembers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", index })
    });

    loadData();
}

// APPLY FUNDS CHANGE
async function applyFundsChange() {
    const cleanDelta = parseInt(document.getElementById("cleanDelta").value) || 0;
    const dirtyDelta = parseInt(document.getElementById("dirtyDelta").value) || 0;
    const logged_by = document.getElementById("txLoggedBy").value || "Unknown";
    const description = document.getElementById("txDescription").value || "";

    await fetch("/api/addTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cleanDelta,
            dirtyDelta,
            logged_by,
            description
        })
    });

    loadData();
}

window.onload = loadData;
