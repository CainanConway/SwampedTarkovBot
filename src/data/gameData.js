const got = require("got");
const graphQlRequest = require("./graphqlRequest.js").graphqlRequest;

const gameData = {
    items: false,
    itemNames: {},
    flea: false,
    languages: [
        'cs',
        'de',
        'en',
        'es',
        'fr',
        'hu',
        'it',
        'ja',
        'pl',
        'pt',
        'ru',
        'sk',
        'tr',
        'zh',
    ],
};

function validateLanguage(langCode) {
    if (!langCode || typeof langCode !== 'string') {
        return 'en';
    }
    langCode = langCode.split('-')[0];
    if (!gameData.languages.includes(langCode)) {
        return 'en';
    }
    return langCode;
}

async function updateItemNames(lang = 'en') {
    lang = validateLanguage(lang);
    const query = `query {
        items(lang: ${lang}) {
            id
            name
            shortName
        }
    }`;
    const response = await graphQlRequest({ graphql: query });

    gameData.itemNames[lang] = response.data.items.reduce((langData, item) => {
        langData[item.id] = item;
        return langData;
    }, {});

    return gameData.itemNames[lang];
}

async function getItemNames(lang = 'en') {
    if (gameData.itemNames[lang]) {
        return gameData.itemNames[lang];
    }
    
    return updateItemNames(lang);
}

async function findItems() {
    const query = `query {
        items {
            id
            name
            shortName
            normalizedName
            updated
            width
            height
            weight
            iconLink
            link
            category {
                name
                id
            }
            properties {
                ...on ItemPropertiesAmmo {
                    caliber
                    penetrationPower
                    damage
                    armorDamage
                    fragmentationChance
                    initialSpeed
                }
                ...on ItemPropertiesStim {
                    cures
                    stimEffects {
                        type
                        chance
                        delay
                        duration
                        value
                        percent
                        skillName
                    }
                }
                ...on ItemPropertiesWeapon {
                    defaultPreset {
                        iconLink
                        width
                        height
                        traderPrices {
                            price
                            priceRUB
                            currency
                            trader {
                                id
                                name
                            }
                        }
                        sellFor {
                            price
                            currency
                            priceRUB
                            vendor {
                                name
                                normalizedName
                                ...on TraderOffer {
                                    trader {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            }
            avg24hPrice
            lastLowPrice
            traderPrices {
                price
                priceRUB
                currency
                trader {
                    id
                    name
                }
            }
            buyFor {
                price
                currency
                priceRUB
                vendor {
                    name
                    ...on TraderOffer {
                        trader {
                            id
                        }
                        minTraderLevel
                        taskUnlock {
                            id
                        }
                    }
                }
            }
            sellFor {
                price
                currency
                priceRUB
                vendor {
                    name
                    ...on TraderOffer {
                        trader {
                            id
                        }
                    }
                }
            }
            types
            basePrice
            craftsFor {
                id
            }
            craftsUsing {
                id
            }
            bartersFor {
                id
            }
            bartersUsing {
                id
            }
        }
    }`;
    let response;
    try {
        response = await graphQlRequest({ graphql: query });
    } catch (error) {
        console.log(error);
    }
    response.data?.items.forEach(item => {
        if (item.properties?.defaultPreset) {
            item.iconLink = item.properties.defaultPreset.iconLink;
            item.width = item.properties.defaultPreset.height;
            item.traderPrices = item.properties.defaultPreset.traderPrices;
            item.sellFor = item.sellFor.filter(sellFor => sellFor.vendor.normalizedName === 'flea-market');
            item.properties.defaultPreset.sellFor.forEach(sellFor => {
                if (sellFor.vendor.normalizedName !== 'flea-market') {
                    item.sellFor.push(sellFor);
                }
            });
        }
    });
    gameData.items = response.data.items;

    return gameData.items;
}

async function getItems(lang = 'en') {
    lang = validateLanguage(lang);
    if(!gameData.items) {
        await findItems();
    }
    if (lang == 'en') {
        return gameData.items;
    }
    const itemNames = await getItemNames(lang).catch(error => {
        console.log(`Error getting ${lang} item names: ${error.message}`);
        return {};
    });
    return gameData.items.map(item => {
        return {
            ...item,
            ...itemNames[item.id],
        }
    });
}

module.exports.getItems = getItems;
module.exports.findItems = findItems;
module.exports.getItemNames = getItemNames;
module.exports.updateItemNames = updateItemNames;

module.exports = {
    items: {
        getAll: getItems,
        get: async(id, lang = 'en') => {
            const items = await getItems(lang);
            return items.find(item => item.id === id);
        }
    },
};

