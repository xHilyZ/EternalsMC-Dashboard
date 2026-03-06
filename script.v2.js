// ---------------------------
// PAGE SWITCHING
// ---------------------------
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
}

// ---------------------------
// LOAD DATA ON START
// ---------------------------
document.addEventListener("DOMContentLoaded", loadData);

async function loadData() {
    try {
        const res = await fetch("/api/getData");
        const data = await res.json();

        updateFundsUI(data.funds.clean, data.funds.dirty);
        updateMembersUI(data.members);

        // Dashboard counters
        document.getElementById("fundTotal").textContent = "$" + (data.funds.clean + data.funds.dirty);
        document.getElementById("memberCount").textContent = data.members.length;

    } catch (err) {
        console.error("Failed to load data:", err);
    }
}

// ---------------------------
// FUNDS UI
// ---------------------------
function updateFundsUI(clean, dirty) {
    document.getElementById("cleanMoney").textContent = "$" + clean;
    document.getElementById("dirtyMoney").textContent = "$" + dirty;
}

// ---------------------------
// APPLY FUNDS CHANGE (NO LOGS)
// ---------------------------
async function applyFundsChange() {
    const cleanDelta = parseInt(document.getElementById("cleanDelta").value) || 0;
    const dirtyDelta = parseInt(document.getElementById("dirtyDelta").value) || 0;

    try {
        const res = await fetch("/api/updateFunds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cleanDelta, dirtyDelta })
        });

        const data = await res.json();
        updateFundsUI(data.clean, data.dirty);

        // Clear inputs
        document.getElementById("cleanDelta").value = "";
        document.getElementById("dirtyDelta").value = "";

    } catch (err) {
        console.error("Failed to update funds:", err);
    }
}

// ---------------------------
// MEMBERS UI
// ---------------------------
function updateMembersUI(members) {
    const list = document.getElementById("memberList");
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
// ADD MEMBER
// ---------------------------
async function addMember() {
    const name = document.getElementById("memberName").value.trim();
    const rank = document.getElementById("memberRank").value.trim();

    if (!name || !rank) return;

    try {
        const res = await fetch("/api/updateMembers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add", name, rank })
        });

        const data = await res.json();
        updateMembersUI(data.members);

        document.getElementById("memberName").value = "";
        document.getElementById("memberRank").value = "";

    } catch (err) {
        console.error("Failed to add member:", err);
    }
}

// ---------------------------
// REMOVE MEMBER
// ---------------------------
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
