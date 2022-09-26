const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblacklist')
        .setDescription('Unblacklist A Discord User From Using This Staff Bot. [Admin User Command]')
        .setDMPermission(false)
        .addStringOption(discordUserID =>
            discordUserID.setName('discord-user-id')
                .setDescription('Discord User ID.')
                .setRequired(true)
                .setMinLength(1)),
    async execute(discordInteractionResultDetails, discordInteractionDetails, configValue, guildID, clientID, discordBot) {

        const discordUserID = String(discordInteractionDetails.options.getString('discord-user-id'));

        discordInteractionResultDetails.interactionFullCommand = `/${discordInteractionDetails.commandName} discord-user-id:${discordUserID}`;

        try {

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin];

            if (discordInteractionDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordInteractionDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = 'User has insufficient permission!';

                });
            } else {

                const discordUserIDRegex = RegExp(/^[0-9]+$/);

                switch (discordUserIDRegex.test(discordUserID)) {
                    default:
                        await discordInteractionDetails.editReply({ content: '```Error occured while verifying Discord User ID provided!```', ephemeral: false }).then(() => {

                            discordInteractionResultDetails.interactionResult = 'ERROR';

                        });
                        break;
                    case false:
                        await discordInteractionDetails.editReply({ content: '```' + `${discordUserID} is not a Discord User ID!` + '```', ephemeral: false }).then(() => {

                            discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = `${discordUserID} is not a Discord User ID!`;

                        });
                        break;
                    case true:

                        const discordUser = await discordBot.guilds.cache.get(guildID).members.fetch(discordUserID).catch(() => {
                            return undefined;
                        });

                        if (discordUser === undefined) {
                            await discordInteractionDetails.editReply({ content: '```' + `${discordUserID} is not a valid Discord User ID!` + '```', ephemeral: false }).then(() => {

                                discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = `${discordUserID} is not a valid Discord User ID!`;

                            });
                        } else {

                            const staffBotBlacklistedUserRoleID = [configValue.role_id.bot_blacklisted];

                            if (discordUser.roles.cache.some(discordUserRoles => staffBotBlacklistedUserRoleID.includes(discordUserRoles.id)) !== true) {
                                await discordInteractionDetails.editReply({ content: '```The user is not blacklisted from using this staff bot!```', ephemeral: false }).then(() => {

                                    discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = 'The user is not blacklisted from using this staff bot!';

                                });
                            } else {
                                if (discordBot.guilds.cache.get(guildID).members.cache.get(clientID).permissions.has('ManageRoles', true) !== true) {
                                    await discordInteractionDetails.editReply({ content: '```Staff bot has insufficient permission to manage roles!```', ephemeral: false }).then(() => {

                                        discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = 'Staff bot has insufficient permission to manage roles!';

                                    });
                                } else {
                                    await discordUser.roles.remove(staffBotBlacklistedUserRoleID).then(async () => {
                                        await discordInteractionDetails.editReply({ content: '```Successfully unblacklisted the user from using this staff bot.```', ephemeral: false }).then(() => {

                                            discordInteractionResultDetails.interactionResult = true;

                                        });
                                    }).catch(async () => {
                                        await discordInteractionDetails.editReply({ content: '```Error occured while unblacklisting the user from using this staff bot!```', ephemeral: false }).then(() => {

                                            discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = 'Error occured while unblacklisting the user from using this staff bot!';

                                        });
                                    });
                                }
                            }
                        }
                        break;
                }
            }
        } catch {
            await discordInteractionDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordInteractionResultDetails.interactionResult = 'ERROR';

            });
        }
        return discordInteractionResultDetails;
    }
};