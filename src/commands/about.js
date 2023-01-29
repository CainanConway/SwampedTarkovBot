const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const got = require('got');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Information about the bot'),
    async execute(interaction) {
        await interaction.deferReply();
        const embed = new EmbedBuilder();
        let data;

        try {
            data = await got ('https://api.github.com/repos/SwampedTarkovBot/contributors', {
                responseType: 'json',
                headers: { "user-agent": "swamphacks2023" }
            });
        } catch (error) {
            console.log(error);
        }
    

    embed.setURL('https://github.com/CainanConway/SwampedTarkovBot');
    embed.setDescription('Discord bot for Escape from Tarkov. Built during Swamphacks2023 using the Tarkov.dev API');
    embed.setAuthor({
        name: ('Swamped - Escape from Tarkov Discord Bot.'),
        iconURL: 'https://swamphacks.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F48712983-e6c4-4ca9-a493-8de1bfacf558%2Ficon.svg?table=block&id=455b6b9e-5ddd-4973-be28-35eec3ef9f8d&spaceId=549e2db5-f787-486b-9c04-9f3bfc79c5ee&userId=&cache=v2',
        url: 'https://github.com/CainanConway',
    });
    embed.addFields({
        name: 'Thanks to Tarkov.dev for this making this project possible', value: 'https://tarkov.dev/api/', inline: true,
    });

    embed.setFooter({
        text: `Stop Rats 2023 🐀!`
    });

    return interaction.editReply({ embeds: [embed] });
   },
};