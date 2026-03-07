/* ============================================================
   GLOBAL CONFIG
============================================================ */

const API_BASE = "/api";
let editingMemberId = null;

function format(num) {
    return Number(num).toLocaleString();
}

const MELBOURNE_OFFSET = 11;
let currentMembers = [];

/* ============================================================
   PAGE SWITCHING
============================================================ */

function openPage(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page-" + page).classList.add("active");

    if (page === "checklist") loadChecklist();
    if (page === "quota") loadQuota();
    if (page === "armory") loadArmory();
    if (page === "pricelist") loadPriceList();
}

/* ============================================================
   DASHBOARD LOADING
============================================================ */

async function loadDashboard() {
    const res = await fetch(`${API_BASE}/getData2`);
    const data = await res.json();

    updateFundsUI(data.funds);
    updateMembersUI(data.members);
    updateTransactionsUI(data.transactions);
    updateDealsTransactionsUI(data.transactions);
    updateTopStats(data.funds, data.members, data.transactions);
}

function updateTopStats(funds, members, transactions) {
    const totalMoney = (funds.clean || 0) + (funds.dirty || 0);

    document.getElementById("totalMoney").textContent = `$${format(totalMoney)}`;
    document.getElementById("totalDeals").textContent = format(transactions.length);
    document.getElementById("activeMembers").textContent = format(members.length);
}

/* ============================================================
   FUNDS SYSTEM
============================================================ */

function updateFundsUI(funds) {
    document.getElementById("cleanMoney").innerText = `$${format(funds.clean)}`;
    document.getElementById("dirtyMoney").innerText = `$${format(funds.dirty)}`;
}

async function addClean() {
    const amount = Number(document.getElementById("fundAmount").value);
    if (!amount) return;

    await fetch(`${API_BASE}/updateFunds2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addClean: amount })
    });

    loadDashboard();
}

async function removeClean() {
    const amount = Number(document.getElementById("fundAmount").value);
    if (!amount) return;

    await fetch(`${API_BASE}/updateFunds2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeClean: amount })
    });

    loadDashboard();
}

async function addDirty() {
    const amount = Number(document.getElementById("fundAmount").value);
    if (!amount) return;

    await fetch(`${API_BASE}/updateFunds2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addDirty: amount })
    });

    loadDashboard();
}

async function removeDirty() {
    const amount = Number(document.getElementById("fundAmount").value);
    if (!amount) return;

    await fetch(`${API_BASE}/updateFunds2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeDirty: amount })
    });

    loadDashboard();
}

// Your choice: Update Funds = refresh only
function updateFunds() {
    loadDashboard();
}

/* ============================================================
   MEMBERS SYSTEM
============================================================ */

function updateMembersUI(members) {
    currentMembers = members || [];

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

async function updateMembers() {
    const name = document.getElementById("memberName").value;
    const rank = document.getElementById("memberRank").value;

    if (!name || !rank) return alert("Enter valid member name and rank.");

    await fetch(`${API_BASE}/updateMembers2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rank })
    });

    document.getElementById("memberName").value = "";
    document.getElementById("memberRank").value = "";

    loadDashboard();
}

async function removeMember(id) {
    await fetch(`${API_BASE}/updateMembers2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeId: id })
    });

    loadDashboard();
}

/* ============================================================
   EDIT MEMBER MODAL
============================================================ */

function openEditModal(id, name, rank) {
    editingMemberId = id;

    document.getElementById("editName").value = name;
    document.getElementById("editRank").value = rank;

    document.getElementById("editModal").style.display = "block";
}

document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
});

document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
    const name = document.getElementById("editName").value;
    const rank = document.getElementById("editRank").value;

    await fetch(`${API_BASE}/updateMembers2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editId: editingMemberId, name, rank })
    });

    document.getElementById("editModal").style.display = "none";
    loadDashboard();
});

/* ============================================================
   DEALS / TRANSACTIONS
============================================================ */

async function addTransaction() {
    const description = document.getElementById("dealDesc").value;
    const amount = parseFloat(document.getElementById("dealAmount").value);
    const type = document.getElementById("dealType").value;

    if (!description || isNaN(amount)) return alert("Enter valid description and amount.");

    await fetch(`${API_BASE}/addTransaction2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount, type })
    });

    document.getElementById("dealDesc").value = "";
    document.getElementById("dealAmount").value = "";

    loadDashboard();
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
            <span style="color:${color}">${sign}$${format(tx.amount)}</span>
        `;

        container.appendChild(div);
    });
}

function updateDealsTransactionsUI(transactions) {
    const container = document.getElementById("transactionsList");
    if (!container) return;

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

/* ============================================================
   DAILY CHECKLIST
============================================================ */

const DAILY_TASKS = [
    { group: "Legal Operations", task: "Mining Runs — 30–60 minutes of mining" },
    { group: "Legal Operations", task: "Scrapyard Work — 30–60 minutes salvaging" },
    { group: "Legal Operations", task: "Dumpster Sweeps — 20 minutes of bin diving" },
    { group: "Legal Operations", task: "Electrician Contracts — 10–45 minutes depending on level" },
    { group: "Legal Operations", task: "Metal Detecting — 30–60 minutes searching" },

    { group: "Illegal Operations", task: "Meth Supply Pickups — PC:1005, collect crates, do NOT open" },
    { group: "Illegal Operations", task: "Crime Tablet Missions — avoid graffiti & laundering missions" },
    { group: "Illegal Operations", task: "Door Heist Jobs — PC:645, best bullet casing payout" },
    { group: "Illegal Operations", task: "Chop Shop Runs — Chop 2–10 cars at PC:102" }
];

function loadChecklist() {
    const container = document.getElementById("checklistContainer");
    container.innerHTML = "";

    const saved = JSON.parse(localStorage.getItem("dailyChecklist")) || {};
    let currentGroup = "";

    DAILY_TASKS.forEach(item => {
        if (item.group !== currentGroup) {
            currentGroup = item.group;

            const header = document.createElement("h3");
            header.className = "checklist-group";
            header.textContent = currentGroup;
            container.appendChild(header);
        }

        const checked = saved[item.task] || false;

        const div = document.createElement("div");
        div.className = "check-item";
        div.innerHTML = `
            <input type="checkbox" ${checked ? "checked" : ""} onchange="toggleTask('${item.task}')">
            <label>${item.task}</label>
        `;
        container.appendChild(div);
    });
}

function toggleTask(task) {
    const saved = JSON.parse(localStorage.getItem("dailyChecklist")) || {};
    saved[task] = !saved[task];
    localStorage.setItem("dailyChecklist", JSON.stringify(saved));
}

/* ============================================================
   DAILY RESET COUNTDOWN
============================================================ */

function updateCountdown() {
    const now = new Date();
    const mel = new Date(now.getTime() + MELBOURNE_OFFSET * 3600 * 1000);

    const reset = new Date(mel);
    reset.setHours(17, 0, 0, 0);

    if (mel > reset) reset.setDate(reset.getDate() + 1);

    const diff = reset - mel;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    document.getElementById("checklistHeader").innerHTML =
        `Resets in ${hours}h ${mins}m ${secs}s`;

    setTimeout(updateCountdown, 1000);
}

function scheduleDailyReset() {
    const now = new Date();
    const mel = new Date(now.getTime() + MELBOURNE_OFFSET * 3600 * 1000);

    const tomorrow = new Date(mel);
    tomorrow.setHours(24, 0, 0, 0);

    const msUntilReset = tomorrow - mel;

    setTimeout(() => {
        localStorage.removeItem("dailyChecklist");
        loadChecklist();
        scheduleDailyReset();
    }, msUntilReset);
}

scheduleDailyReset();

/* ============================================================
   WEEKLY QUOTA SYSTEM
============================================================ */

let WEEKLY_QUOTA_TEXT = localStorage.getItem("weeklyQuotaText") 
    || "Set this week's quota from the dashboard tile.";

function loadQuota() {
    const header = document.getElementById("quotaHeader");
    const container = document.getElementById("quotaContainer");

    header.innerHTML = `
        <div class="quota-box">
            <p><strong>Current Quota:</strong></p>
            <p>${WEEKLY_QUOTA_TEXT}</p>
            <p style="color:#C2B59B; margin-top:8px;">Resets every Sunday</p>
        </div>
    `;

    const saved = JSON.parse(localStorage.getItem("weeklyQuotaChecklist")) || {};
    container.innerHTML = "";

    currentMembers.forEach(member => {
        const key = member.id || member.name;
        const checked = saved[key] || false;

        const div = document.createElement("div");
        div.className = "check-item";
        div.innerHTML = `
            <input type="checkbox" ${checked ? "checked" : ""} onchange="toggleQuota('${key}')">
            <label>${member.name}</label>
        `;
        container.appendChild(div);
    });
}

function toggleQuota(key) {
    const saved = JSON.parse(localStorage.getItem("weeklyQuotaChecklist")) || {};
    saved[key] = !saved[key];
    localStorage.setItem("weeklyQuotaChecklist", JSON.stringify(saved));
}

function openQuotaModal() {
    document.getElementById("quotaTextInput").value = WEEKLY_QUOTA_TEXT;
    document.getElementById("quotaModal").style.display = "flex";
}

function closeQuotaModal() {
    document.getElementById("quotaModal").style.display = "none";
}

function saveQuota() {
    const text = document.getElementById("quotaTextInput").value.trim();
    WEEKLY_QUOTA_TEXT = text || "Set this week's quota from the dashboard tile.";
    localStorage.setItem("weeklyQuotaText", WEEKLY_QUOTA_TEXT);

    closeQuotaModal();

    if (document.getElementById("page-quota").classList.contains("active")) {
        loadQuota();
    }
}

/* ============================================================
   ARMORY SYSTEM
============================================================ */

let ARMORY = JSON.parse(localStorage.getItem("armoryData")) || {
    "Armour": [
        { name: "Heavy Armour", amount: 57 },
        { name: "Body Armour", amount: 76 }
    ],
    "Bandages": [
        { name: "IFAK", amount: 4 },
        { name: "Bandage", amount: 12 }
    ],
    "Guns (Built)": [
        { name: "Vector", amount: 4 },
        { name: "AK-47", amount: 2 }
    ],
    "Ammo": [
        { name: "9mm", amount: 200 },
        { name: "5.56", amount: 150 }
    ],
    "Ammo Cases": [
        { name: "Small Ammo Case", amount: 3 },
        { name: "Large Ammo Case", amount: 1 }
    ],
    "Attachments": [
        { name: "Suppressor", amount: 5 },
        { name: "Red Dot", amount: 7 }
    ],
    "Blueprints": [
        { name: "Vector Blueprint", amount: 1 },
        { name: "AK-47 Blueprint", amount: 1 }
    ]
};

function saveArmory() {
    localStorage.setItem("armoryData", JSON.stringify(ARMORY));
}

function loadArmory() {
    const container = document.getElementById("armoryList");

    const search = document.getElementById("armorySearch");
    if (search) search.value = "";

    container.innerHTML = "";

    Object.keys(ARMORY).forEach(group => {
        const header = document.createElement("h3");
        header.className = "checklist-group";
        header.textContent = group;
        container.appendChild(header);

        ARMORY[group].forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "armory-item";

            div.innerHTML = `
                <span>${item.name} — <strong>${format(item.amount)}</strong></span>
                <div>
                    <button onclick="editArmoryItem('${group}', ${index})">Edit</button>
                    <button onclick="removeArmoryItem('${group}', ${index})">Remove</button>
                </div>
            `;

            container.appendChild(div);
        });
    });
}

function filterArmory() {
    const query = document.getElementById("armorySearch").value.toLowerCase();
    const container = document.getElementById("armoryList");

    container.innerHTML = "";

    Object.keys(ARMORY).forEach(group => {
        const filtered = ARMORY[group].filter(item =>
            item.name.toLowerCase().includes(query)
        );

        if (filtered.length === 0) return;

        const header = document.createElement("h3");
        header.className = "checklist-group";
        header.textContent = group;
        container.appendChild(header);

        filtered.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "armory-item";

            div.innerHTML = `
                <span>${item.name} — <strong>${format(item.amount)}</strong></span>
                <div>
                    <button onclick="editArmoryItem('${group}', ${index})">Edit</button>
                    <button onclick="removeArmoryItem('${group}', ${index})">Remove</button>
                </div>
            `;

            container.appendChild(div);
        });
    });
}

document.getElementById("addArmoryBtn").addEventListener("click", () => {
    const name = document.getElementById("armoryName").value.trim();
    const amount = parseInt(document.getElementById("armoryAmount").value);
    const group = document.getElementById("armoryGroup").value;

    if (!name || isNaN(amount)) return alert("Enter valid name and amount.");

    ARMORY[group].push({ name, amount });
    saveArmory();
    loadArmory();

    document.getElementById("armoryName").value = "";
    document.getElementById("armoryAmount").value = "";
});

function editArmoryItem(group, index) {
    const current = ARMORY[group][index];

    const newName = prompt("New name:", current.name);
    const newAmount = prompt("New amount:", current.amount);

    if (!newName || isNaN(parseInt(newAmount))) return;

    ARMORY[group][index].name = newName;
    ARMORY[group][index].amount = parseInt(newAmount);

    saveArmory();
    loadArmory();
}

function removeArmoryItem(group, index) {
    if (!confirm("Remove this item?")) return;

    ARMORY[group].splice(index, 1);
    saveArmory();
    loadArmory();
}

/* ============================================================
   PRICE LIST SYSTEM
============================================================ */

const PRICE_LIST = [
    {
        group: "14K Triads",
        items: [
            { what: "Heavy SMG BP", price: 1000000, relationship: "Own Vendor" },
            { what: "Pump Shotgun MK2 BP", price: 850000, relationship: "Own Vendor" }
        ]
    },
    {
        group: "B13",
        items: [
            { what: "SCAR BP", price: 1800000, relationship: "Own Vendor" }
        ]
    },
    {
        group: "ETERNALS MC",
        items: [
            { what: "Sawn-Off Shotgun BP", price: 0, relationship: "Own Vendor" },
            { what: "MPX BP", price: 0, relationship: "Own Vendor" }
        ]
    },
    {
        group: "FDK",
        items: [
            { what: "PPSH BP", price: 0, relationship: "Own Vendor" }
        ]
    },
    {
        group: "UMBRA",
        items: [
            { what: "Deagle BP", price: 400000, relationship: "Own Vendor" },
            { what: "V-17 BP (Auto Pistol)", price: 650000, relationship: "Own Vendor" }
        ]
    }
];

function loadPriceList() {
    const container = document.getElementById("priceListContainer");
    container.innerHTML = "";

    PRICE_LIST.forEach(section => {
        const header = document.createElement("h3");
        header.className = "price-group";
        header.textContent = section.group;
        container.appendChild(header);

        section.items.forEach(item => {
            const row = document.createElement("div");
            row.className = "price-item";

            row.innerHTML = `
                <span>${item.what}</span>
                <span>$${format(item.price)}</span>
                <span>${item.relationship}</span>
            `;

            container.appendChild(row);
        });
    });
}

function logout() {
    window.location.href = "/api/auth/logout";
}

/* ============================================================
   INIT
============================================================ */

updateCountdown();
loadDashboard();
