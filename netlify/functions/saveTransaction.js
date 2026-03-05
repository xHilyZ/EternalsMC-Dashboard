import { neon } from "@netlify/neon";

const sql = neon();

export default async (req) => {
    const body = await req.json();

    const amount = Number(body.amount);
    const type = body.type;
    const tag = body.tag;
    const moneyType = body.moneyType;
    const loggedBy = body.loggedBy || "Zephyr";

    const balanceRows = await sql`SELECT * FROM balances LIMIT 1`;
    let balance = balanceRows[0];

    if (!balance) {
        await sql`INSERT INTO balances (clean_balance, dirty_balance) VALUES (0, 0)`;
        balance = { clean_balance: 0, dirty_balance: 0 };
    }

    let clean = balance.clean_balance;
    let dirty = balance.dirty_balance;

    if (type === "income") clean += amount;
    if (type === "expense") clean -= amount;

    if (type === "dirty_income") dirty += amount;
    if (type === "dirty_expense") dirty -= amount;

    await sql`
        UPDATE balances
        SET clean_balance = ${clean}, dirty_balance = ${dirty}
        WHERE id = 1
    `;

    const balanceAfter = moneyType === "Dirty" ? dirty : clean;

    await sql`
        INSERT INTO transactions (time, logged_by, type, money_type, tag, amount, balance_after)
        VALUES (
            ${new Date().toLocaleString("en-AU")},
            ${loggedBy},
            ${type},
            ${moneyType},
            ${tag},
            ${amount},
            ${balanceAfter}
        )
    `;

    return Response.json({ success: true });
};
