const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staffmode')
        .setDescription('Toggle Staffmode Ingame. [Trusted+ User Command]')
        .setDMPermission(false),
    async execute(discordEmbedDetails, discordInteractionResultDetails, discordInteractionDetails, configValue, staffBot) {

        discordInteractionResultDetails.interactionFullCommand = `/${discordInteractionDetails.commandName}`;

        try {

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin, configValue.role_id.bot_trusted];

            if (discordInteractionDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordInteractionDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = 'User has insufficient permission!';

                });
            } else {

                const staffmodeToggledMessageRegex = RegExp(/^STAFF \» Successfully (enabled|disabled) staff mode\!/);

                const toggleStaffmode = staffBot.findMessage(10000, staffmodeToggledMessageRegex).then(async (toggleStaffmodeResult) => {
                    if (toggleStaffmodeResult === false) {
                        await discordInteractionDetails.editReply({ content: '```Error occured while toggling staffmode!```', ephemeral: false }).then(() => {

                            discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = 'Error occured while toggling staffmode!';

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

                        await discordInteractionDetails.editReply({ embeds: [staffmodeToggledEmbed], ephemeral: false }).then(() => {

                            discordInteractionResultDetails.interactionResult = true;

                        });
                    }
                });

                staffBot.chat('/staffmode');
                await toggleStaffmode;
            }
        } catch {
            await discordInteractionDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordInteractionResultDetails.interactionResult = 'ERROR';

            });
        }
        return discordInteractionResultDetails;
    }
};