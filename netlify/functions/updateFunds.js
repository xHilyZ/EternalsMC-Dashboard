import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const store = getStore('eternals-store');
  let data = await store.get('eternals.json', { type: 'json' });

  if (!data) {
    return { statusCode: 500, body: 'Data not initialized' };
  }

  const { cleanDelta = 0, dirtyDelta = 0 } = JSON.parse(event.body || '{}');

  data.funds.clean += cleanDelta;
  data.funds.dirty += dirtyDelta;

  await store.set('eternals.json', JSON.stringify(data));

  return {
    statusCode: 200,
    body: JSON.stringify(data.funds)
  };
};
