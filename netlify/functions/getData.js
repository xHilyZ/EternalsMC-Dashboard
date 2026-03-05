import { getStore } from '@netlify/blobs';

export const handler = async () => {
    const store = getStore('eternals-store');

    let data = await store.get('eternals.json', { type: 'json' });

    if (!data) {
        data = {
            funds: { clean: 0, dirty: 0 },
            members: [],
            inventory: [],
            drugs: [],
            weapons: [],
            territories: [],
            operations: [],
            logs: []
        };

        await store.set('eternals.json', JSON.stringify(data));
    }

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
};
