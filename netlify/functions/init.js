export default async () => {
    const kv = await import("@netlify/kv");

    // Initialize balances if missing
    const clean = await kv.get("cleanBalance");
    const dirty = await kv.get("dirtyBalance");
    const tx = await kv.get("transactions");

    if (clean === null || clean === undefined) {
        await kv.set("cleanBalance", 0);
    }

    if (dirty === null || dirty === undefined) {
        await kv.set("dirtyBalance", 0);
    }

    if (!Array.isArray(tx)) {
        await kv.set("transactions", []);
    }

    return Response.json({
        success: true,
        cleanBalance: await kv.get("cleanBalance"),
        dirtyBalance: await kv.get("dirtyBalance"),
        transactions: await kv.get("transactions")
    });
};
