export default async (req, context) => {
  const db = context.env.ETERNALS_DB;
  const body = await req.json();

  let cleanBalance = Number(await db.get("cleanBalance")) || 0;
  let dirtyBalance = Number(await db.get("dirtyBalance")) || 0;
  let transactions = JSON.parse(await db.get("transactions") || "[]");

  const { amount, direction, type, description, loggedBy, date } = body;

  const signedAmount = direction === "income" ? amount : -amount;

  if (type === "clean") cleanBalance += signedAmount;
  else dirtyBalance += signedAmount;

  const balanceAfter = cleanBalance + dirtyBalance;

  const newTx = {
    amount: signedAmount,
    direction,
    type,
    description,
    loggedBy,
    date,
    balanceAfter
  };

  transactions.push(newTx);

  await db.put("cleanBalance", cleanBalance.toString());
  await db.put("dirtyBalance", dirtyBalance.toString());
  await db.put("transactions", JSON.stringify(transactions));

  return Response.json({ success: true, cleanBalance, dirtyBalance, transactions });
};
