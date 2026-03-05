// =========================
// LOAD DATA ON PAGE START
// =========================

async function loadData() {
    try {
        const res = await fetch("/.netlify/functions/getData");
        const data = await res.json();

        const clean = Number(data.cleanBalance) || 0;
        const dirty = Number(data.dirtyBalance) || 0;

        document.getElementById("cleanBalance").textContent = clean;
        document.getElementById("dirtyBalance").textContent = dirty;

        // FIX: Total Funds
        document.getElementById("totalFunds").textContent = clean + dirty;

        // Status Snapshot
        document.getElementById("statusMessage").textContent =
            data.transactions.length === 0
                ? "No transactions yet"
                : "Active financial activity";

        // Transaction Table
        const table = document.getElementById("transactionLog");
        table.innerHTML = "";

        data.transactions.forEach(t => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${t.time}</td>
                <td>${t.loggedBy}</td>
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
document.getElementById("addTransactionBtn").onclick = () => modal.style.display = "flex";
document.getElementById("closeModal").onclick = () => modal.style.display = "none";

window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};


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

    const moneyType = type.includes("dirty") ? "Dirty" : "Clean";

    const payload = {
        type,
        amount,
        tag,
        moneyType,
        loggedBy: "Zephyr"
    };

    try {
        await fetch("/.netlify/functions/saveTransaction", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        modal.style.display = "none";
        loadData();

    } catch (err) {
        console.error("Failed to save transaction:", err);
    }
});
