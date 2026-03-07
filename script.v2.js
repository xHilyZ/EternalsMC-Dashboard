const API_BASE = "/api";
let editingMemberId = null;

// FORMAT NUMBER WITH COMMAS
function format(num) {
    return Number(num).toLocaleString();
}

// MELBOURNE TIME OFFSET (AEDT = UTC+11)
const MELBOURNE_OFFSET = 11;

// Keep latest members list for quota checklist
let currentMembers = [];

/* ============================================================
   WEEKLY QUOTA SYSTEM (FREE TEXT + MEMBER CHECKLIST)
============================================================ */

// Free-text quota description (stored in localStorage)
let WEEKLY_QUOTA_TEXT =
    localStorage.getItem("weeklyQuotaText") ||
    "Set this week's quota from the dashboard tile.";

// Load quota page
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

    // Checklist is members — tick who has completed quota
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

// Toggle member quota completion
function toggleQuota(key) {
    const saved = JSON.parse(localStorage.getItem("weeklyQuotaChecklist")) || {};
    saved[key] = !saved[key];
    localStorage.setItem("weeklyQuotaChecklist", JSON.stringify(saved));
}

// Weekly reset (Sunday, Melbourne time) — clears checklist only
function scheduleWeeklyQuotaReset() {
    const now = new Date();
    const mel = new Date(now.getTime() + MELBOURNE_OFFSET * 3600 * 1000);

    const nextSunday = new Date(mel);
    nextSunday.setDate(mel.getDate() + ((7 - mel.getDay()) % 7));
    nextSunday.setHours(0, 0, 0, 0);

    const msUntilReset = nextSunday - mel;

    setTimeout(() => {
        localStorage.removeItem("weeklyQuotaChecklist");
        scheduleWeeklyQuotaReset();
    }, msUntilReset);
}

scheduleWeeklyQuotaReset();

// Open quota modal
function openQuotaModal() {
    const input = document.getElementById("quotaTextInput");
    if (input) input.value = WEEKLY_QUOTA_TEXT;
    document.getElementById("quotaModal").style.display = "block";
}

// Close quota modal
function closeQuotaModal() {
    document.getElementById("quotaModal").style.display = "none";
}

// Save quota text
function saveQuota() {
    const text = document.getElementById("quotaTextInput").value || "";
    WEEKLY_QUOTA_TEXT = text.trim() || "Set this week's quota from the dashboard tile.";
    localStorage.setItem("weeklyQuotaText", WEEKLY_QUOTA_TEXT);

    closeQuotaModal();

    // If quota page is visible, refresh it
    const quotaPage = document.getElementById("page-quota");
    if (quotaPage && quotaPage.classList.contains("active")) {
        loadQuota();
    }
}

/* ============================================================
   ⭐ ARMORY SYSTEM (GROUPED, EDITABLE)
============================================================ */

// Default Armory Data (your list)
let ARMORY = JSON.parse(localStorage.getItem("armoryData")) || {

    "Armour": [
        { name: "Heavy Armour", amount: 57 },
        { name: "Body Armour", amount: 76 },
        { name: "Zephyr Joints", amount: 11 },
        { name: "Plain Jane Joints", amount: 231 },
        { name: "Blue Dream Joints", amount: 229 }
    ],

    "Bandages": [
        { name: "IFAK", amount: 4 },
        { name: "Heavy Bandage", amount: 40 },
        { name: "Oxy", amount: 79 }
    ],

    "Guns (Built)": [
        { name: "Vector", amount: 4 },
        { name: "Bullpup", amount: 5 },
        { name: "Pumpys", amount: 6 },
        { name: "Double Barrel", amount: 17 },
        { name: "Sawn Offs", amount: 9 },
        { name: "MP5X", amount: 15 }
    ],

    "Ammo": [
        { name: "5.56x45", amount: 24028 },
        { name: "9mm", amount: 32023 },
        { name: "12 Gauge", amount: 466 },
        { name: ".50 AE", amount: 3178 },
        { name: ".45 ACP + 192", amount: 1075 },
        { name: ".38 LC", amount: 9609 },
        { name: ".22 Long Rifle", amount: 45 },
        { name: ".44 Magnum", amount: 300 }
    ],

    "Ammo Cases": [
        { name: ".45", amount: 8 }
    ],

    "Attachments": [
        { name: "Suppressor", amount: 2 },
        { name: "Heavy Suppressor", amount: 1 }
    ],

    "Blueprints": [
        { name: "M270D", amount: 1 },
        { name: "SMG", amount: 1 },
        { name: "Vector", amount: 1 },
        { name: "Pumpys", amount: 4 },
        { name: "Sawn Off", amount: 50 },
        { name: "Double Barrel", amount: 1 },
        { name: "Marksman", amount: 94 },
        { name: "AP Pistol", amount: 10 },
        { name: "Extended Pistol", amount: 32 },
        { name: "Suppressor", amount: 15 }
    ]
};

// Save to localStorage
function saveArmory() {
    localStorage.setItem("armoryData", JSON.stringify(ARMORY));
}

// Load Armory Page
function loadArmory() {
    const container = document.getElementById("armoryList");
    if (!container) return;

    container.innerHTML = "";

    Object.keys(ARMORY).forEach(group => {
        // Group Header
        const header = document.createElement("h3");
        header.className = "checklist-group";
        header.textContent = group;
        container.appendChild(header);

        // Items
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

// Add new item
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addArmoryBtn");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
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
    }
});

// Edit item (name + amount)
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

// Remove item
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
            { what: "Double barrel shotgun BP", price: 0, relationship: "Own Vendor" },
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
    if (!container) return;

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

/* ============================================================
   DASHBOARD DATA
============================================================ */

// LOAD DASHBOARD
async function loadDashboard() {
    const res = await fetch(`${API_BASE}/getData`);
    const data = await res.json();

    updateFundsUI(data.funds);
    updateMembersUI(data.members);
    updateTransactionsUI(data.transactions);
    updateDealsTransactionsUI(data.transactions);
    updateTopStats(data.funds, data.members, data.transactions);
}

// TOP STATS
function updateTopStats(funds, members, transactions) {
    const totalMoney = (funds.clean || 0) + (funds.dirty || 0);

    document.getElementById("totalMoney").textContent = `$${format(totalMoney)}`;
    document.getElementById("totalDeals").textContent = format(transactions.length);
    document.getElementById("activeMembers").textContent = format(members.length);
}

// FUNDS UI
function updateFundsUI(funds) {
    document.getElementById("cleanBalance").innerText = format(funds.clean);
    document.getElementById("dirtyBalance").innerText = format(funds.dirty);
}

// MEMBERS UI
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

// TRANSACTIONS PAGE UI
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

// DEALS PAGE LOG RENDERER
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

// ADD TRANSACTION
async function addTransaction() {
    const description = document.getElementById("txDescription").value;
    const amount = parseFloat(document.getElementById("txAmount").value);
    const type = document.getElementById("txType").value;

    if (!description || isNaN(amount)) return alert("Enter valid description and amount.");

    await fetch(`${API_BASE}/addTransaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount, type })
    });

    document.getElementById("txDescription").value = "";
    document.getElementById("txAmount").value = "";

    loadDashboard();
}

// UPDATE FUNDS
async function updateFunds() {
    const clean = parseFloat(document.getElementById("cleanInput").value) || 0;
    const dirty = parseFloat(document.getElementById("dirtyInput").value) || 0;

    await fetch(`${API_BASE}/updateFunds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clean, dirty })
    });

    loadDashboard();
}

// ADD MEMBER
async function updateMembers() {
    const name = document.getElementById("memberName").value;
    const rank = document.getElementById("memberRank").value;

    if (!name || !rank) return alert("Enter valid member name and rank.");

    await fetch(`${API_BASE}/updateMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rank })
    });

    document.getElementById("memberName").value = "";
    document.getElementById("memberRank").value = "";

    loadDashboard();
}

// REMOVE MEMBER
async function removeMember(id) {
    await fetch(`${API_BASE}/updateMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeId: id })
    });

    loadDashboard();
}

/* ============================================================
   DAILY CHECKLIST SYSTEM
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
            header.textContent = currentGroup;
            header.className = "checklist-group";
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

// DAILY RESET COUNTDOWN
function updateCountdown() {
    const now = new Date();
    const mel = new Date(now.getTime() + MELBOURNE_OFFSET * 3600 * 1000);

    const reset = new Date(mel);
    reset.setHours(17, 0, 0, 0);

    if (mel > reset) {
        reset.setDate(reset.getDate() + 1);
    }

    const diff = reset - mel;

    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    document.getElementById("checklistHeader").innerHTML =
        `Resets in ${hours}h ${mins}m ${secs}s`;

    setTimeout(updateCountdown, 1000);
}

// DAILY RESET
function scheduleDailyReset() {
    const now = new Date();
    const melbourneNow = new Date(now.getTime() + MELBOURNE_OFFSET * 3600 * 1000);

    const tomorrow = new Date(melbourneNow);
    tomorrow.setHours(24, 0, 0, 0);

    const msUntilReset = tomorrow - melbourneNow;

    setTimeout(() => {
        localStorage.removeItem("dailyChecklist");
        loadChecklist();
        scheduleDailyReset();
    }, msUntilReset);
}

scheduleDailyReset();

/* ============================================================
   EDIT MEMBER MODAL
============================================================ */

function openEditModal(id, name, rank) {
    editingMemberId = id;

    document.getElementById("editName").value = name;
    document.getElementById("editRank").value = rank;

    document.getElementById("editModal").style.display = "block";
}

document.getElementById("cancelEditBtn").addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
});

document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const name = document.getElementById("editName").value;
    const rank = document.getElementById("editRank").value;

    await fetch(`${API_BASE}/updateMembers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editId: editingMemberId, name, rank })
    });

    document.getElementById("editModal").style.display = "none";
    loadDashboard();
});

/* ============================================================
   EVENT LISTENERS
============================================================ */

document.getElementById("addTxBtn").addEventListener("click", addTransaction);
document.getElementById("updateFundsBtn").addEventListener("click", updateFunds);
document.getElementById("updateMembersBtn").addEventListener("click", updateMembers);

/* ============================================================
   INIT
============================================================ */

loadDashboard();
