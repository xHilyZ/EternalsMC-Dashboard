function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

let data = null;

async function loadData() {
  const res = await fetch('/.netlify/functions/getData');
  data = await res.json();
  renderDashboard();
}

function renderDashboard() {
  document.getElementById("cleanMoney").innerText = "$" + data.funds.clean;
  document.getElementById("dirtyMoney").innerText = "$" + data.funds.dirty;
  document.getElementById("fundTotal").innerText = "$" + (data.funds.clean + data.funds.dirty);

  document.getElementById("memberCount").innerText = data.members.length;
  document.getElementById("memberList").innerHTML = data.members
    .map(m => `<li>${m.name} — ${m.rank}</li>`).join("");

  document.getElementById("inventoryCount").innerText = data.inventory.length;
  document.getElementById("inventoryList").innerHTML = data.inventory
    .map(i => `<li>${i.item} x${i.qty}</li>`).join("");

  document.getElementById("drugList").innerHTML = data.drugs
    .map(d => `<li>${d.type} x${d.qty}</li>`).join("");

  document.getElementById("weaponList").innerHTML = data.weapons
    .map(w => `<li>${w.weapon} (${w.serial})</li>`).join("");

  document.getElementById("territoryCount").innerText = data.territories.length;
  document.getElementById("territoryList").innerHTML = data.territories
    .map(t => `<li>${t.name} — $${t.income}</li>`).join("");

  document.getElementById("operationList").innerHTML = data.operations
    .map(o => `<li>${o.name} — ${o.status}</li>`).join("");
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function applyFundsChange() {
  const cleanDelta = Number(document.getElementById('cleanDelta').value || 0);
  const dirtyDelta = Number(document.getElementById('dirtyDelta').value || 0);

  const res = await fetch('/.netlify/functions/updateFunds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cleanDelta, dirtyDelta })
  });

  const updatedFunds = await res.json();
  data.funds = updatedFunds;
  renderDashboard();
}

// Load data on page load
loadData();
