/* ============================================================
   ROLE + LOGIN SYSTEM
============================================================ */

// Load role
const ROLE = localStorage.getItem("role") || "member";
document.body.classList.add(ROLE);

// Logout
function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}


/* ============================================================
   PAGE SWITCHING
============================================================ */

function openPage(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page-" + page).classList.add("active");
}


/* ============================================================
   RADIO CHANNEL SYSTEM
============================================================ */

// Load saved radio channel
let radioChannel = localStorage.getItem("radioChannel") || "68.53";
const radioLabel = document.getElementById("radioLabel");
if (radioLabel) radioLabel.innerText = radioChannel;

// Open modal (admin only)
function openRadioModal() {
    if (ROLE !== "admin") return;
    document.getElementById("radioInput").value = radioChannel;
    document.getElementById("radioModal").style.display = "flex";
}

// Close modal
function closeRadioModal() {
    document.getElementById("radioModal").style.display = "none";
}

// Save new channel
function saveRadio() {
    const newChannel = document.getElementById("radioInput").value.trim();
    if (!newChannel) return;

    radioChannel = newChannel;
    localStorage.setItem("radioChannel", radioChannel);

    document.getElementById("radioLabel").innerText = radioChannel;

    closeRadioModal();
}


/* ============================================================
   FETCH INITIAL DATA FROM BACKEND
============================================================ */

async function loadData() {
    try {
        const res = await fetch("/api/getData");
        const data = await res.json();

        // Dashboard stats
        document.getElementById("totalDeals").innerText = data.totalDeals;
        document.getElementById("activeMembers").innerText = data.members.length;

        if (ROLE === "admin") {
            document.getElementById("totalMoney").innerText = "$" + data.totalMoney;
            document.getElementById("cleanMoney").innerText = "$" + data.clean;
            document.getElementById("dirtyMoney").innerText = "$" + data.dirty;
        }

        // Members
        renderMembers(data.members);

        // Transactions
        renderTransactions(data.transactions);

        // Armory
        renderArmory(data.armory);

        // Checklist
        renderChecklist(data.checklist);

        // Quota
        document.getElementById("quotaHeader").innerText = data.quota || "No quota set.";
        document.getElementById("quotaContainer").innerHTML = data.quotaText || "";

        // Price List
        document.getElementById("priceListContainer").innerHTML = data.priceListHTML || "";

    } catch (err) {
        console.error("Error loading data:", err);
    }
}

loadData();


/* ============================================================
   DEALS / TRANSACTIONS
============================================================ */

async function addTransaction() {
    const desc = document.getElementById("dealDesc").value;
    const amount = Number(document.getElementById("dealAmount").value);
    const type = document.getElementById("dealType").value;

    if (!desc || !amount) return;

    await fetch("/api/addTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc, amount, type })
    });

    loadData();
}

function renderTransactions(list) {
    const container = document.getElementById("transactionsList");
    const container2 = document.getElementById("transactionsList2");

    if (container) container.innerHTML = "";
    if (container2) container2.innerHTML = "";

    list.forEach(t => {
        const div = document.createElement("div");
        div.className = "transaction-item";
        div.innerHTML = `
            <span>${t.desc}</span>
            <span>${t.type === "income" ? "+" : "-"}$${t.amount}</span>
        `;

        if (container) container.appendChild(div);
        if (container2) container2.appendChild(div.cloneNode(true));
    });
}


/* ============================================================
   FUNDS (ADMIN ONLY)
============================================================ */

async function updateFunds() {
    await fetch("/api/updateFunds", { method: "POST" });
    loadData();
}

async function addClean() {
    const amount = Number(document.getElementById("fundAmount").value);
    if (!amount) return;

    await fetch("/api/addClean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });

    loadData();
}

async function removeClean() {
    const amount = Number(document.getElementById("fundAmount").value);
    if (!amount) return;

    await fetch("/api/removeClean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });

    loadData();
}

async function addDirty() {
    const amount = Number(document.getElementById("fundAmount").value);
    if (!amount) return;

    await fetch("/api/addDirty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });

    loadData();
}

async function removeDirty() {
    const amount = Number(document.getElementById("fundAmount").value);
    if (!amount) return;

    await fetch("/api/removeDirty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });

    loadData();
}


/* ============================================================
   MEMBERS
============================================================ */

async function updateMembers() {
    const name = document.getElementById("memberName").value;
    const rank = document.getElementById("memberRank").value;

    if (!name || !rank) return;

    await fetch("/api/updateMembers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rank })
    });

    loadData();
}

function renderMembers(list) {
    const container = document.getElementById("membersList");
    container.innerHTML = "";

    list.forEach((m, index) => {
        const div = document.createElement("div");
        div.className = "member-item";
        div.innerHTML = `
            <span>${m.name} — ${m.rank}</span>
            <div>
                <button onclick="editMember(${index})">Edit</button>
                <button onclick="deleteMember(${index})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function editMember(index) {
    document.getElementById("editModal").style.display = "flex";
    window.editIndex = index;
}

async function deleteMember(index) {
    await fetch("/api/deleteMember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index })
    });

    loadData();
}


/* ============================================================
   ARMORY
============================================================ */

async function addArmoryItem() {
    const name = document.getElementById("armoryName").value;
    const amount = Number(document.getElementById("armoryAmount").value);
    const group = document.getElementById("armoryGroup").value;

    if (!name || !amount) return;

    await fetch("/api/addArmory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, group })
    });

    loadData();
}

function renderArmory(list) {
    const container = document.getElementById("armoryList");
    container.innerHTML = "";

    list.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "armory-item";
        div.innerHTML = `
            <span>${item.name} (${item.amount})</span>
            <button onclick="deleteArmory(${index})">Delete</button>
        `;
        container.appendChild(div);
    });
}

async function deleteArmory(index) {
    await fetch("/api/deleteArmory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index })
    });

    loadData();
}


/* ============================================================
   CHECKLIST
============================================================ */

function renderChecklist(list) {
    const container = document.getElementById("checklistContainer");
    container.innerHTML = list || "";
}


/* ============================================================
   QUOTA
============================================================ */

function openQuotaModal() {
    document.getElementById("quotaModal").style.display = "flex";
}

function closeQuotaModal() {
    document.getElementById("quotaModal").style.display = "none";
}

async function saveQuota() {
    const text = document.getElementById("quotaTextInput").value;

    await fetch("/api/saveQuota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    loadData();
    closeQuotaModal();
}
