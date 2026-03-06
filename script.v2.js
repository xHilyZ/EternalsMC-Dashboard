// Load everything on page load
document.addEventListener("DOMContentLoaded", loadData);

async function loadData() {
    try {
        const res = await fetch("/api/getData");
        const data = await res.json();

        updateFundsUI(data.funds.clean, data.funds.dirty);
        updateMembersUI(data.members);

    } catch (err) {
        console.error("Failed to load data:", err);
    }
}

// ---------------------------
// FUNDS UI
// ---------------------------

function updateFundsUI(clean, dirty) {
    document.getElementById("cleanBalance").textContent = clean;
    document.getElementById("dirtyBalance").textContent = dirty;
}

// ---------------------------
// UPDATE FUNDS (NO LOGS)
// ---------------------------

async function updateFunds(cleanDelta = 0, dirtyDelta = 0) {
    try {
        const res = await fetch("/api/updateFunds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cleanDelta, dirtyDelta })
        });

        const data = await res.json();

        updateFundsUI(data.clean, data.dirty);

    } catch (err) {
        console.error("Failed to update funds:", err);
    }
}

// Buttons
document.getElementById("addClean").addEventListener("click", () => {
    const amount = parseInt(prompt("Add Clean Amount:"));
    if (!isNaN(amount)) updateFunds(amount, 0);
});

document.getElementById("removeClean").addEventListener("click", () => {
    const amount = parseInt(prompt("Remove Clean Amount:"));
    if (!isNaN(amount)) updateFunds(-amount, 0);
});

document.getElementById("addDirty").addEventListener("click", () => {
    const amount = parseInt(prompt("Add Dirty Amount:"));
    if (!isNaN(amount)) updateFunds(0, amount);
});

document.getElementById("removeDirty").addEventListener("click", () => {
    const amount = parseInt(prompt("Remove Dirty Amount:"));
    if (!isNaN(amount)) updateFunds(0, -amount);
});

// ---------------------------
// MEMBERS UI
// ---------------------------

function updateMembersUI(members) {
    const list = document.getElementById("membersList");
    list.innerHTML = "";

    members.forEach((m, index) => {
        const li = document.createElement("li");
        li.textContent = `${m.name} — ${m.rank}`;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.style.marginLeft = "10px";
        removeBtn.onclick = () => removeMember(index);

        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

// ---------------------------
// UPDATE MEMBERS (NO LOGS)
// ---------------------------

async function addMember() {
    const name = prompt("Member Name:");
    const rank = prompt("Member Rank:");

    if (!name || !rank) return;

    try {
        const res = await fetch("/api/updateMembers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add", name, rank })
        });

        const data = await res.json();
        updateMembersUI(data.members);

    } catch (err) {
        console.error("Failed to add member:", err);
    }
}

async function removeMember(index) {
    try {
        const res = await fetch("/api/updateMembers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "remove", index })
        });

        const data = await res.json();
        updateMembersUI(data.members);

    } catch (err) {
        console.error("Failed to remove member:", err);
    }
}

document.getElementById("addMember").addEventListener("click", addMember);
