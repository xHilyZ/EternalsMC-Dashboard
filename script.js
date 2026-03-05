// =========================
// INITIAL DATA LOAD
// =========================

async function loadData() {
    try {
        const res = await fetch("/.netlify/functions/getData");
        const data = await res.json();

        document.getElementById("cleanBalance").textContent = data.cleanBalance;
        document.getElementById("dirtyBalance").textContent = data.dirtyBalance;

        const logContainer = document.getElementById("transactionLog");
        logContainer.innerHTML = "";

        data.transactions.forEach(t => {
            const item = document.createElement("div");
            item.className = "transaction-item";

            item.innerHTML = `
                <span class="t-type ${t.type}">${t.type.toUpperCase()}</span>
                <span class="t-amount">$${t.amount}</span>
                <span class="t-tag">${t.tag}</span>
                <span class="t-time">${t.time}</span>
            `;

            logContainer.appendChild(item);
        });

    } catch (err) {
        console.error("Failed to load data:", err);
    }
}

loadData();


// =========================
// OPEN / CLOSE MODAL
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

    const payload = { type, amount, tag };

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
