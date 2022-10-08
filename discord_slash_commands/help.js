const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const nodeFS = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows Commands List.')
        .setDMPermission(false),
    async execute(discordSlashCommandFilesDIR, discordEmbedDetails, discordSlashCommandHandlerResultDetails, discordSlashCommandDetails) {
        try {

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName}`;

            const discordSlashCommandFilesName = nodeFS.readdirSync(discordSlashCommandFilesDIR).filter(discordSlashCommandFileName => discordSlashCommandFileName.endsWith('.js') && discordSlashCommandFileName !== 'help.js');

            let helpEmbedDescription = '';

            discordSlashCommandFilesName.forEach((discordSlashCommandFileName) => {

                const discordSlashCommandFile = require(`./${discordSlashCommandFileName}`);

                helpEmbedDescription = `${helpEmbedDescription} /${discordSlashCommandFile.data.name} -> ${discordSlashCommandFile.data.description}\n\n`;

            });

            const helpEmbed = new EmbedBuilder()
                .setTitle('COMMANDS LIST')
                .setColor(discordEmbedDetails.color)
                .setThumbnail(discordEmbedDetails.thumbnail)
                .setDescription(helpEmbedDescription)
                .setFooter(discordEmbedDetails.footer)
                .setTimestamp();

            await discordSlashCommandDetails.editReply({ embeds: [helpEmbed], ephemeral: false }).then(() => {

                discordSlashCommandHandlerResultDetails.result = true;

            });
        } catch {
            await discordSlashCommandDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordSlashCommandHandlerResultDetails.result = 'ERROR';

            });
        }
        return discordSlashCommandHandlerResultDetails;
    }
};