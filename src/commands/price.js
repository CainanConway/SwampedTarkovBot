const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const gameData = require('../data/gameData.js');
//const i18next = require('i18next').getFixedT;
const moment = require('moment/min/moment-with-locales.js');

const MAX_ITEMS = 2;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('price')
        .setDescription('Get an item\'s flea and trader value')
        .addStringOption(option => {
            return option.setName('name')
                .setDescription('Item name to search for')
                .setAutocomplete(true)
                .setRequired(true);
        }),

    async execute(interaction) {
        await interaction.deferReply();

        const searchString = interaction.options.getString('name');
        //const t = i18next.(interaction.locale);

        const [items] = await Promise.all([
            gameData.items.getAll(interaction.locale),
        ]);
        const matchedItems = items.filter(i => i.name.toLowerCase().includes(searchString.toLowerCase()));

        if (matchedItems.length == 0) {
            return interaction.editReply({
                content: t('Found no results for {{searchString}}"', {
                    searchString: searchString
                }),
                ephemeral: true,
            });
        }
        let embeds = [];

        for (const item of matchedItems) {
            if (item.shortName.toLowerCase() === searchString) {
                matchedItems.length = 0;
                matchedItems.push(item);
                break;
            }
        }

        for (let i = 0; i < matchedItems.length; i = i + 1) {
            const item = matchedItems[i];
            const embed = new EmbedBuilder();

            let body = `🔹Price and Item Details🔹\n`;
            embed.setTitle(item.name);
            embed.setURL(item.link);
            moment.locale(interaction.locale);
            embed.setFooter({text: `🕑 'Last Updated': ${moment(item.updated).fromNow()}`});

            embed.setThumbnail(item.iconLink);

            const SIZE = parseInt(item.width) * parseInt(item.height);
            let bestTraderName = false;
            let bestTraderPrice = -1;
            let bestTraderCurrency = false;
            let optimalPrice = -1;

            for (const traderPrice of item.traderPrices) {
                if (traderPrice.priceRUB > bestTraderPrice) {
                    bestTraderPrice = traderPrice.priceRUB;
                    bestTraderName = traderPrice.trader.name;

                    switch(traderPrice.currency) {
                        case 'RUB':
                            bestTraderCurrency = "₽";
                            break;
                        case 'USD':
                            bestTraderCurrency = "$";
                            break;
                        case 'EUR':
                            bestTraderCurrency = "€";
                            break;
                        default:
                            bestTraderCurrency = "";
                            break;
                    }
                }
            }

            const FLEA_PRICE_AVG = parseInt(item.avg24hPrice)
            const FLEA_PRICE_LOW = parseInt(item.lastLowPrice)
            let sellTo = ''

            if (FLEA_PRICE_AVG > 0) {
                let tempPrice = FLEA_PRICE_AVG.toLocaleString(
                    interaction.locale) + "₽";

                let pricePerSlot = (FLEA_PRICE_AVG / SIZE).toLocaleString(
                    interaction.locale) + "₽/slot";

                if (SIZE > 1) {
                    tempPrice += `\r\n \`${pricePerSlot}\``;
                }
                
                embed.addFields({name: 'Flea Price (avg)', value: tempPrice, inline: true});
            }

            if (FLEA_PRICE_LOW > 0) {
                

                let tempPrice = FLEA_PRICE_LOW.toLocaleString(
                    interaction.locale) + "₽";

                let pricePerSlot = (FLEA_PRICE_LOW / SIZE).toLocaleString(
                    interaction.locale) + "₽/slot";

                if (SIZE > 1) {
                    tempPrice += `\r\n \`${pricePerSlot}\``;
                }

                embed.addFields({name: 'Flea Price (low)', value: tempPrice, inline: true});
                
                if(FLEA_PRICE_LOW > optimalPrice){
                    optimalPrice = FLEA_PRICE_LOW
                    sellTo = 'Flea Market'
                }

            }

            if(bestTraderPrice > 0 && bestTraderName) {
                let tempPrice = parseInt(bestTraderPrice).toLocaleString(
                    interaction.locale) + bestTraderCurrency;
        
                let pricePerSlot = (bestTraderPrice / SIZE).toLocaleString(
                    interaction.locale) + bestTraderCurrency + "/slot";

                if (SIZE > 1) {
                    tempPrice += `\r\n \`${pricePerSlot}\``;
                }

                embed.addFields({name: bestTraderName, value: tempPrice, inline: true});

                if(bestTraderPrice > optimalPrice){
                    optimalPrice = bestTraderPrice
                    sellTo = bestTraderName
                }
            }
            
            // Add quicksell price
            body += `• 'Sell to  \`${sellTo}\` for': \`${parseInt(optimalPrice).toLocaleString(
                interaction.locale) + "₽"
            }\`\n`;

            if (embed.data.fields?.length == 0) {
                embed.setDescription(t('No prices available.'));
            }
            
            // Add the item weight
            body += `• 'Weight': \`${item.weight} 'kg'\`\n`;
    
            // Add the item description
            embed.setDescription(body);
    
            embeds.push(embed);

            if (i >= MAX_ITEMS - 1) {
                break;
            }
        }


        if (MAX_ITEMS < matchedItems.length) {
            const ending = new EmbedBuilder();

            ending.setTitle("+" + (matchedItems.length - MAX_ITEMS) + ` 'more' `);
            ending.setURL("https://tarkov.dev/?search=" + encodeURIComponent(searchString));

            let otheritems = '';
            for (let i = MAX_ITEMS; i < matchedItems.length; i = i + 1) {
                const item = matchedItems[i];
                const itemname = `[${matchedItems[i].name}](${matchedItems[i].link})`;

                if (itemname.length + 2 + otheritems.length > 2048) {
                    ending.setFooter({text: `${matchedItems.length-i} 'additional results not shown.' `});

                    break;
                }

                otheritems += itemname + "\n";
            }

            ending.setDescription(otheritems);

            embeds.push(ending);
        }
        
        return await interaction.editReply({ embeds: embeds });
    },
};