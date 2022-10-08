const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart Staff Bot. [Admin User Command]')
        .setDMPermission(false),
    async execute(discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, discordBot, staffBot, logDiscordSlashCommandUsage) {
        try {

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName}`;

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin];

            if (discordSlashCommandDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User has insufficient permission!';

                }).then(async () => {
                    await logDiscordSlashCommandUsage(discordSlashCommandDetails, discordSlashCommandHandlerResultDetails);
                });
            } else {
                await discordSlashCommandDetails.editReply({ content: '```Restarting staff bot...```', ephemeral: false }).then(async () => {
                    try {
                        staffBot.end();

                        discordSlashCommandHandlerResultDetails.result = true;

                        await logDiscordSlashCommandUsage(discordSlashCommandDetails, discordSlashCommandHandlerResultDetails);

                        discordBot.destroy();
                    } catch {
                        await discordSlashCommandDetails.editReply({ content: '```Error occured while restarting staff bot! Force restarting staff bot...```', ephemeral: false }).then(() => {

                            discordSlashCommandHandlerResultDetails.result = 'ERROR';

                        }).then(async () => {
                            await logDiscordSlashCommandUsage(discordSlashCommandDetails, discordSlashCommandHandlerResultDetails);
                        });
                    }
                    return process.exit(0);
                });
            }
        } catch {
            await discordSlashCommandDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordSlashCommandHandlerResultDetails.result = 'ERROR';

            }).then(async () => {
                await logDiscordSlashCommandUsage(discordSlashCommandDetails, discordSlashCommandHandlerResultDetails);
            });
        }
        return;
    }
};