const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const nodeFS = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows Commands List.')
        .setDMPermission(false),
    async execute(discordSlashCommandFilesDIR, discordEmbedDetails, discordInteractionResultDetails, discordInteractionDetails) {

        discordInteractionResultDetails.interactionFullCommand = `/${discordInteractionDetails.commandName}`;

        try {

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

            await discordInteractionDetails.editReply({ embeds: [helpEmbed], ephemeral: false }).then(() => {

                discordInteractionResultDetails.interactionResult = true;

            });
        } catch {
            await discordInteractionDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordInteractionResultDetails.interactionResult = 'ERROR';

            });
        }
        return discordInteractionResultDetails;
    }
};