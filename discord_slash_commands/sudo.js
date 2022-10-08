const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sudo')
        .setDescription('Run A Command Ingame. [Admin User Command]')
        .setDMPermission(false)
        .addStringOption(commandToRun =>
            commandToRun.setName('command-to-run')
                .setDescription('Command To Run.')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(192)),
    async execute(discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, staffBot) {
        try {

            const commandToRun = String(discordSlashCommandDetails.options.getString('command-to-run'));

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName} command-to-run:${commandToRun}`;

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin];

            if (discordSlashCommandDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User has insufficient permission!';

                });
            } else {
                staffBot.chat(`/${commandToRun}`);
                await discordSlashCommandDetails.editReply({ content: '```' + `Successfully ran "/${commandToRun}" ingame.` + '```', ephemeral: false }).then(() => {

                    discordSlashCommandHandlerResultDetails.result = true;

                });
            }
        } catch {
            await discordSlashCommandDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordSlashCommandHandlerResultDetails.result = 'ERROR';

            });
        }
        return discordSlashCommandHandlerResultDetails;
    }
};