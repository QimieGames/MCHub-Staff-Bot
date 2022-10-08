const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prunehist')
        .setDescription("Prune A Player's History. [Admin User Command]")
        .setDMPermission(false)
        .addStringOption(playerIGN =>
            playerIGN.setName('player-ign')
                .setDescription('Minecraft Username.')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(17))
        .addStringOption(prunehistTime =>
            prunehistTime.setName('prunehist-time')
                .setDescription('How Long Should The Hist Be Pruned.')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(16)),
    async execute(discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, staffBot, isMinecraftUsernameValid) {
        try {

            const playerIGN = String(discordSlashCommandDetails.options.getString('player-ign'));

            const prunehistTime = String(discordSlashCommandDetails.options.getString('prunehist-time'));

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName} player-ign:${playerIGN} prunehist-time:${prunehistTime}`;

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin];

            if (discordSlashCommandDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User has insufficient permission!';

                });
            } else {
                switch (isMinecraftUsernameValid(playerIGN)) {
                    default:
                        await discordSlashCommandDetails.editReply({ content: '```Error occured while executing isMinecraftUsernameValid function!```', ephemeral: false }).then(() => {

                            discordSlashCommandHandlerResultDetails.result = 'ERROR';

                        });
                        break;
                    case false:
                        await discordSlashCommandDetails.editReply({ content: '```' + `${playerIGN} is not a valid Minecraft Username!` + '```', ephemeral: false }).then(() => {

                            discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = `${playerIGN} is not a valid Minecraft Username!`;

                        });
                        break;
                    case true:

                        const prunehistTimeRegex = RegExp(/^[0-9]+[A-Za-z]{1}$/);

                        switch (prunehistTimeRegex.test(prunehistTime)) {
                            default:
                                await discordSlashCommandDetails.editReply({ content: '```Error occured while validating prunehist-time!```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                });
                                break;
                            case false:
                                await discordSlashCommandDetails.editReply({ content: '```' + `${prunehistTime} is not a valid input!` + '```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = `${prunehistTime} is not a valid input!`;

                                });
                                break;
                            case true:

                                const prunehistMessageRegex = RegExp(/^History pruned\.|^No history found\./);

                                const prunehistPlayerIGN = staffBot.findMessage(8000, prunehistMessageRegex).then(async (prunehistPlayerIGNResult) => {
                                    if (prunehistPlayerIGNResult === false) {
                                        await discordSlashCommandDetails.editReply({ content: '```Failed to prunehist!```', ephemeral: false }).then(() => {

                                            discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                        });
                                    } else {
                                        await discordSlashCommandDetails.editReply({ content: '```' + prunehistPlayerIGNResult + '```', ephemeral: false }).then(() => {

                                            discordSlashCommandHandlerResultDetails.result = true;

                                        });
                                    }
                                });

                                staffBot.chat(`/prunehistory ${playerIGN} ${prunehistTime}`);
                                await prunehistPlayerIGN;
                                break;
                        }
                        break;
                }
            }
        } catch {
            await discordSlashCommandDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordSlashCommandHandlerResultDetails.result = 'ERROR';

            });
        }
        return discordSlashCommandHandlerResultDetails;
    }
};