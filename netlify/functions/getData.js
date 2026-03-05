import { getStore } from '@netlify/blobs';

export const handler = async () => {
  const store = getStore('eternals-store');

  // Try to read existing data
  let data = await store.get('eternals.json', { type: 'json' });

  // If no data yet, seed it from seed.json
  if (!data) {
    const seed = await import('./seed.json', { assert: { type: 'json' } });
    data = seed.default;
    await store.set('eternals.json', JSON.stringify(data));
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
