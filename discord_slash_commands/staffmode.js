const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staffmode')
        .setDescription('Toggle Staffmode Ingame. [Trusted+ User Command]')
        .setDMPermission(false),
    async execute(discordEmbedDetails, discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, staffBot) {
        try {

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName}`;

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin, configValue.role_id.bot_trusted];

            if (discordSlashCommandDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User has insufficient permission!';

                });
            } else {

                const staffmodeToggledMessageRegex = RegExp(/^STAFF \» Successfully (enabled|disabled) staff mode\!/);

                const toggleStaffmode = staffBot.findMessage(8000, staffmodeToggledMessageRegex).then(async (toggleStaffmodeResult) => {
                    if (toggleStaffmodeResult === false) {
                        await discordSlashCommandDetails.editReply({ content: '```Failed to toggle staffmode!```', ephemeral: false }).then(() => {

                            discordSlashCommandHandlerResultDetails.result = 'ERROR';

                        });
                    } else {

                        const staffBotUsername = String(staffBot.username);

                        const staffmodeToggledDetails = String(toggleStaffmodeResult).match(staffmodeToggledMessageRegex);

                        const staffmodeStatus = staffmodeToggledDetails[1].toUpperCase();

                        const staffmodeToggledEmbedDescription = `IGN: ${staffBotUsername.replace(RegExp(/[\_]/, 'g'), '\\_')}\n` + `STATUS: ${staffmodeStatus}`;

                        const staffmodeToggledEmbed = new EmbedBuilder()
                            .setTitle('STAFFMODE TOGGLED')
                            .setColor(discordEmbedDetails.color)
                            .setThumbnail(discordEmbedDetails.thumbnail)
                            .setDescription(staffmodeToggledEmbedDescription)
                            .setFooter(discordEmbedDetails.footer)
                            .setTimestamp();

                        await discordSlashCommandDetails.editReply({ embeds: [staffmodeToggledEmbed], ephemeral: false }).then(() => {

                            discordSlashCommandHandlerResultDetails.result = true;

                        });
                    }
                });

                staffBot.chat('/staffmode');
                await toggleStaffmode;
            }
        } catch {
            await discordSlashCommandDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordSlashCommandHandlerResultDetails.result = 'ERROR';

            });
        }
        return discordSlashCommandHandlerResultDetails;
    }
};