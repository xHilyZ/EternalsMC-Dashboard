import { neon } from "@netlify/neon";

const sql = neon();

export default async () => {
    const balanceRows = await sql`SELECT * FROM balances LIMIT 1`;
    const balance = balanceRows[0] || { clean_balance: 0, dirty_balance: 0 };

    const transactions = await sql`
        SELECT * FROM transactions ORDER BY id ASC
    `;

    return Response.json({
        cleanBalance: balance.clean_balance,
        dirtyBalance: balance.dirty_balance,
        transactions
    });
};
