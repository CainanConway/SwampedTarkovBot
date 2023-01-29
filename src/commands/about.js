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
        iconURL: 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/e/e6/Tetriz_ins.png/revision/latest?cb=20181231052932',
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