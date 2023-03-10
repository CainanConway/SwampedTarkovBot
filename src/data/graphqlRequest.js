const got = require("got");

const url = 'https://api.tarkov.dev/graphql';

async function graphqlRequest (options) {
    if (!options.hasOwnProperty('graphql')) {
        return Promise.reject(new Error('You must provide a graphql query'));
    }

    return got.post(url, {
        responseType: 'json',
        body: JSON.stringify({
            query: options.graphql,
        }),
        headers: { "user-agent": "swamphacks2023" },
        resolveBodyOnly: true,
    });
};

module.exports.graphqlRequest = graphqlRequest