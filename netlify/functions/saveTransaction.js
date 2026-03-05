export default async (req) => {
    const kv = await import("@netlify/kv");
    const body = await req.json();

    const amount = Number(body.amount);
    const type = body.type;
    const tag = body.tag;
    const moneyType = body.moneyType;
    const loggedBy = body.loggedBy || "Zephyr";

    let cleanBalance = Number(await kv.get("cleanBalance")) || 0;
    let dirtyBalance = Number(await kv.get("dirtyBalance")) || 0;

    // Update balances
    if (type === "income") cleanBalance += amount;
    if (type === "expense") cleanBalance -= amount;

    if (type === "dirty_income") dirtyBalance += amount;
    if (type === "dirty_expense") dirtyBalance -= amount;

    // Save balances
    await kv.set("cleanBalance", cleanBalance);
    await kv.set("dirtyBalance", dirtyBalance);

    // Determine balanceAfter
    const balanceAfter = moneyType === "Dirty" ? dirtyBalance : cleanBalance;

    // Build transaction object
    const transaction = {
        time: new Date().toLocaleString("en-AU"),
        loggedBy,
        type,
        moneyType,
        tag,
        amount,
        balanceAfter
    };

    // Save transaction list
    const transactions = await kv.get("transactions") || [];
    transactions.push(transaction);
    await kv.set("transactions", transactions);

    return Response.json({ success: true, transaction });
};
