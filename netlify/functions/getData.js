export default async () => {
    const kv = await import("@netlify/kv");

    const cleanBalance = Number(await kv.get("cleanBalance")) || 0;
    const dirtyBalance = Number(await kv.get("dirtyBalance")) || 0;

    const transactions = await kv.get("transactions") || [];

    return Response.json({
        cleanBalance,
        dirtyBalance,
        transactions
    });
};
