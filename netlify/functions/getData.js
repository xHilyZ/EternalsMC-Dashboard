export default async (req, context) => {
  const db = context.env.ETERNALS_DB;

  const cleanBalance = Number(await db.get("cleanBalance")) || 0;
  const dirtyBalance = Number(await db.get("dirtyBalance")) || 0;
  const transactions = JSON.parse(await db.get("transactions") || "[]");

  return Response.json({
    cleanBalance,
    dirtyBalance,
    transactions
  });
};
