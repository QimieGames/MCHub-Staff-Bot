const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hist')
        .setDescription("Shows A Player's Punishment History. (Maximum: 20 Latest Punishment) [Trusted+ User Command]")
        .setDMPermission(false)
        .addStringOption(playerIGN =>
            playerIGN.setName('player-ign')
                .setDescription('Minecraft Username.')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(17)),
    async execute(discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, staffBot, isMinecraftUsernameValid) {
        try {

            const playerIGN = String(discordSlashCommandDetails.options.getString('player-ign'));

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName} player-ign:${playerIGN}`;

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin, configValue.role_id.bot_trusted];

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

                        const realmName = String(configValue.staff_bot.realm_name).toLowerCase();

                        const regexExcludedCharactersOne = ['*', '_', '(', ':', ')'];

                        const regexExcludedCharactersTwo = ['*', '_'];

                        let playerIGNForRegex = playerIGN;

                        regexExcludedCharactersTwo.forEach((regexExcludedCharacterTwo) => {

                            playerIGNForRegex = playerIGNForRegex.replace(new RegExp(`\\${regexExcludedCharacterTwo}`, 'g'), `\\${regexExcludedCharacterTwo}`);

                        });

                        let histPlayerIGNMessageStringRegex, punishmentIssuedTimeMessageStringRegex, punishmentInformationMessageStringRegex, activePunishmentDurationMessageStringRegex, punishmentRevertedInformationMessageStringRegex;

                        switch (realmName) {
                            default:
                                await discordSlashCommandDetails.editReply({ content: '```Invalid realm name was provided in config.json!```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                });
                                return discordSlashCommandHandlerResultDetails;
                                break;
                            case 'hubm':

                                histPlayerIGNMessageStringRegex = `^History for ${playerIGN} (Limit: [0-9]+):`;

                                regexExcludedCharactersOne.forEach((regexExcludedCharacterOne) => {

                                    histPlayerIGNMessageStringRegex = histPlayerIGNMessageStringRegex.replace(RegExp(`[\\${regexExcludedCharacterOne}]`, 'g'), `\\${regexExcludedCharacterOne}`);

                                });

                                punishmentIssuedTimeMessageStringRegex = `^ \\-\\- \\[[0-9a-z\\, ]+\\] \\-\\-`;

                                punishmentInformationMessageStringRegex = `^ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]+\\:(| \\'.+\\'| \\'\\')(| \\[Active\\]| \\[Expired\\])`;

                                activePunishmentDurationMessageStringRegex = `^Expires in [0-9a-z\\, ]+\\.`;

                                punishmentRevertedInformationMessageStringRegex = `^ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]{3,17}\\.`;

                                break;
                            case 'atlantic':

                                histPlayerIGNMessageStringRegex = `^History for ${playerIGN} (Limit: [0-9]+):`;

                                regexExcludedCharactersOne.forEach((regexExcludedCharacterOne) => {

                                    histPlayerIGNMessageStringRegex = histPlayerIGNMessageStringRegex.replace(RegExp(`[\\${regexExcludedCharacterOne}]`, 'g'), `\\${regexExcludedCharacterOne}`);

                                });

                                punishmentIssuedTimeMessageStringRegex = `^ \\-\\- \\[[0-9a-z\\, ]+\\] \\-\\-`;

                                punishmentInformationMessageStringRegex = `^ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]+\\:(| \\'.+\\'| \\'\\')(| \\[Active\\]| \\[Expired\\])`;

                                activePunishmentDurationMessageStringRegex = `^Expires in [0-9a-z\\, ]+\\.`;

                                punishmentRevertedInformationMessageStringRegex = `^ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]{3,17}\\.`;

                                break;
                            case 'sun':

                                histPlayerIGNMessageStringRegex = `^History for ${playerIGN} (Limit: [0-9]+):`;

                                regexExcludedCharactersOne.forEach((regexExcludedCharacterOne) => {

                                    histPlayerIGNMessageStringRegex = histPlayerIGNMessageStringRegex.replace(RegExp(`[\\${regexExcludedCharacterOne}]`, 'g'), `\\${regexExcludedCharacterOne}`);

                                });

                                punishmentIssuedTimeMessageStringRegex = `^.+\\: \\[([0-9a-z\\, ]+)\\]`;

                                punishmentInformationMessageStringRegex = `^ \\▎ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]+\\:(| .+)(| \\[ACTIVE\\]| \\[EXPIRED\\])`;

                                activePunishmentDurationMessageStringRegex = `^ \\▎ Expires in [0-9a-z\\, ]+\.`;

                                punishmentRevertedInformationMessageStringRegex = `^ \\▎ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]+\\.`;

                                break;
                            case 'survival':

                                histPlayerIGNMessageStringRegex = `^History for ${playerIGN} (Limit: [0-9]+):`;

                                regexExcludedCharactersOne.forEach((regexExcludedCharacterOne) => {

                                    histPlayerIGNMessageStringRegex = histPlayerIGNMessageStringRegex.replace(RegExp(`[\\${regexExcludedCharacterOne}]`, 'g'), `\\${regexExcludedCharacterOne}`);

                                });

                                punishmentIssuedTimeMessageStringRegex = `^ \\-\\- \\[[0-9a-z\\, ]+\\] \\-\\-`;

                                punishmentInformationMessageStringRegex = `^ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]+\\:(| \\'.+\\'| \\'\\')(| \\[Active\\]| \\[Expired\\])`;

                                activePunishmentDurationMessageStringRegex = `^Expires in [0-9a-z\\, ]+\\.`;

                                punishmentRevertedInformationMessageStringRegex = `^ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]{3,17}\\.`;

                                break;
                            case 'pixelmon':

                                histPlayerIGNMessageStringRegex = `^History for ${playerIGN} (Limit: [0-9]+):`;

                                regexExcludedCharactersOne.forEach((regexExcludedCharacterOne) => {

                                    histPlayerIGNMessageStringRegex = histPlayerIGNMessageStringRegex.replace(RegExp(`[\\${regexExcludedCharacterOne}]`, 'g'), `\\${regexExcludedCharacterOne}`);

                                });

                                punishmentIssuedTimeMessageStringRegex = `^ \\-\\- \\[[0-9a-z\\, ]+\\] \\-\\-`;

                                punishmentInformationMessageStringRegex = `^ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]+\\:(| \\'.+\\'| \\'\\')(| \\[Active\\]| \\[Expired\\])`;

                                activePunishmentDurationMessageStringRegex = `^Expires in [0-9a-z\\, ]+\\.`;

                                punishmentRevertedInformationMessageStringRegex = `^ ${playerIGNForRegex} was .+ by [0-9A-Za-z\\_\\*]{3,17}\\.`;

                                break;
                        }

                        const punishmentHistoryDataRegex =

                        {
                            punishmentIssuedTime: new RegExp(punishmentIssuedTimeMessageStringRegex),
                            punishmentInformation: new RegExp(punishmentInformationMessageStringRegex, 'i'),
                            activePunishmentDuration: new RegExp(activePunishmentDurationMessageStringRegex),
                            punishmentRevertedInformation: new RegExp(punishmentRevertedInformationMessageStringRegex, 'i')
                        };

                        const histPlayerIGNMessageRegex = RegExp(histPlayerIGNMessageStringRegex, 'i');

                        let playerIGNPunishmentHistory = '';

                        function savePlayerIGNPunishmentHistory(punishmentHistoryMessage) {

                            playerIGNPunishmentHistory = playerIGNPunishmentHistory + `${punishmentHistoryMessage}\n`;

                        }

                        const histPlayerIGN = staffBot.findMessage(8000, histPlayerIGNMessageRegex).then(async (histPlayerIGNResult) => {
                            if (histPlayerIGNResult === false) {
                                await discordSlashCommandDetails.editReply({ content: '```' + `Failed to obtain ${playerIGN}'s punishment history!` + '```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                });
                            } else {

                                playerIGNPunishmentHistory = playerIGNPunishmentHistory + `${histPlayerIGNResult}\n`;

                                Object.keys(punishmentHistoryDataRegex).forEach(async (punishmentHistoryDataRegexType) => {
                                    staffBot.addChatPattern(punishmentHistoryDataRegexType, punishmentHistoryDataRegex[punishmentHistoryDataRegexType], { repeat: true, parse: false });
                                    staffBot.on(`chat:${punishmentHistoryDataRegexType}`, savePlayerIGNPunishmentHistory);
                                });
                                await new Promise(resolve => setTimeout(() => {
                                    Object.keys(punishmentHistoryDataRegex).forEach((punishmentHistoryDataRegexType) => {
                                        staffBot.removeChatPattern(punishmentHistoryDataRegexType);
                                        staffBot.off(`chat:${punishmentHistoryDataRegexType}`, savePlayerIGNPunishmentHistory);
                                    });
                                    resolve();
                                }, 1000));
                                await discordSlashCommandDetails.editReply({ content: '```' + playerIGNPunishmentHistory + '```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = true;

                                });
                            }
                        });

                        staffBot.chat(`/hist ${playerIGN} 20`);
                        await histPlayerIGN;
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