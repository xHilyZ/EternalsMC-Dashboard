// =========================
// LOAD DATA ON PAGE START
// =========================

async function loadData() {
    try {
        const res = await fetch("/.netlify/functions/getData");
        const data = await res.json();

        // Update balances
        document.getElementById("cleanBalance").textContent = data.cleanBalance;
        document.getElementById("dirtyBalance").textContent = data.dirtyBalance;

        // ⭐ FIX: Update Total Funds
        const total = data.cleanBalance + data.dirtyBalance;
        document.getElementById("totalFunds").textContent = total;

        // Update status snapshot
        const status = document.getElementById("statusMessage");
        status.textContent = data.transactions.length === 0
            ? "No transactions yet"
            : "Active financial activity";

        // Update transaction table
        const table = document.getElementById("transactionLog");
        table.innerHTML = "";

        data.transactions.forEach(t => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${t.time}</td>
                <td>${t.loggedBy || "Zephyr"}</td>
                <td>${t.type}</td>
                <td>${t.moneyType}</td>
                <td>${t.tag}</td>
                <td>$${t.amount}</td>
                <td>$${t.balanceAfter}</td>
            `;

            table.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load data:", err);
    }
}

loadData();


// =========================
// MODAL OPEN / CLOSE
// =========================

const modal = document.getElementById("transactionModal");
const openBtn = document.getElementById("addTransactionBtn");
const closeBtn = document.getElementById("closeModal");

openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});


// =========================
// SAVE TRANSACTION
// =========================

document.getElementById("saveTransaction").addEventListener("click", async () => {
    const type = document.getElementById("transactionType").value;
    const amount = Number(document.getElementById("transactionAmount").value);
    const tag = document.getElementById("transactionTag").value;

    if (!amount || amount <= 0) {
        alert("Enter a valid amount.");
        return;
    }

    // Determine clean/dirty type
    let moneyType = "Clean";
    if (type.includes("dirty")) moneyType = "Dirty";

    const payload = {
        type,
        amount,
        tag,
        moneyType,
        loggedBy: "Zephyr" // default for now
    };

    try {
        const res = await fetch("/.netlify/functions/saveTransaction", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        console.log("Saved:", result);

        modal.style.display = "none";
        loadData();

    } catch (err) {
        console.error("Failed to save transaction:", err);
    }
});
