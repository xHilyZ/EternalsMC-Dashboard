import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const store = getStore('eternals-store');
    let data = await store.get('eternals.json', { type: 'json' });

    const body = JSON.parse(event.body || '{}');

    if (body.action === "add") {
        data.members.push({ name: body.name, rank: body.rank });
    }

    if (body.action === "remove") {
        data.members.splice(body.index, 1);
    }

    await store.set('eternals.json', JSON.stringify(data));

    return {
        statusCode: 200,
        body: JSON.stringify({ members: data.members })
    };
};
