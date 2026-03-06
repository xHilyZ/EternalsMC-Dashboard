async function loadData() {
  const res = await fetch("/api/getData");
  const data = await res.json();

  document.getElementById("cleanBalance").innerText = data.funds.clean;
  document.getElementById("dirtyBalance").innerText = data.funds.dirty;

  const membersList = document.getElementById("membersList");
  membersList.innerHTML = "";

  data.members.forEach((m, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${m.name} — ${m.rank}
      <button onclick="removeMember(${i})">Remove</button>`;
    membersList.appendChild(li);
  });

  const txList = document.getElementById("transactionList");
  txList.innerHTML = "";

  data.transactions.forEach(tx => {
    const li = document.createElement("li");
    li.innerHTML = `${tx.created_at} — ${tx.type} — ${tx.direction} — ${tx.amount} — ${tx.logged_by}`;
    txList.appendChild(li);
  });
}

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

async function removeMember(index) {
  await fetch("/api/updateMembers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "remove", index })
  });

  loadData();
}

async function addTransaction() {
  const amount = parseInt(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const direction = document.getElementById("direction").value;
  const logged_by = document.getElementById("loggedBy").value;
  const description = document.getElementById("description").value;

  let cleanDelta = 0;
  let dirtyDelta = 0;

  if (type === "clean") {
    cleanDelta = direction === "income" ? amount : -amount;
  } else {
    dirtyDelta = direction === "income" ? amount : -amount;
  }

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
