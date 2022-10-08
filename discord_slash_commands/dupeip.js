const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dupeip')
        .setDescription("Shows A Player's Dupeip. [Trusted+ User Command]")
        .setDMPermission(false)
        .addStringOption(playerIGN =>
            playerIGN.setName('player-ign')
                .setDescription('Minecraft Username.')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(17)),
    async execute(discordEmbedDetails, discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, staffBot, isMinecraftUsernameValid) {
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

                        const regexExcludedCharacters = ['*', '_'];

                        let dupeipPlayerIGNMessageStringRegex, dupeipPlayerIGNSuccessMessageRegex, playerIGNForRegex = playerIGN;

                        regexExcludedCharacters.forEach((regexExcludedCharacter) => {

                            playerIGNForRegex = playerIGNForRegex.replace(RegExp(`[\\${regexExcludedCharacter}]`, 'g'), `\\${regexExcludedCharacter}`);

                        });

                        switch (realmName) {
                            default:
                                await discordSlashCommandDetails.editReply({ content: '```Invalid realm name was provided in config.json!```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                });
                                return discordSlashCommandHandlerResultDetails;
                                break;
                            case 'hubm':

                                dupeipPlayerIGNMessageStringRegex = `^Scanning ${playerIGNForRegex}\\. \\[Online\\] \\[Offline\\] \\[Banned\\]|^No history found\\.`;

                                dupeipPlayerIGNSuccessMessageRegex = RegExp(/^Scanning ([0-9A-Za-z\_\*]{3,17})\. \[Online\] \[Offline\] \[Banned\]/);

                                break;
                            case 'atlantic':

                                dupeipPlayerIGNMessageStringRegex = `^Scanning ${playerIGNForRegex}\\. \\[Online\\] \\[Offline\\] \\[Banned\\]|^No history found\\.`;

                                dupeipPlayerIGNSuccessMessageRegex = RegExp(/^Scanning ([0-9A-Za-z\_\*]{3,17})\. \[Online\] \[Offline\] \[Banned\]/);

                                break;
                            case 'sun':

                                dupeipPlayerIGNMessageStringRegex = `SCANNING \\> ${playerIGNForRegex} for alts\\.\\.\\. \\[ONLINE\\] \\[OFFLINE\\] \\[BANNED\\]|^No history found\\.`;

                                dupeipPlayerIGNSuccessMessageRegex = RegExp(/^SCANNING \> ([0-9A-Za-z\_\*]{3,17}) for alts\.\.\. \[ONLINE\] \[OFFLINE\] \[BANNED\]/);

                                break;
                            case 'survival':

                                dupeipPlayerIGNMessageStringRegex = `^Scanning ${playerIGNForRegex}\\. \\[Online\\] \\[Offline\\] \\[Banned\\]|^No history found\\.`;

                                dupeipPlayerIGNSuccessMessageRegex = RegExp(/^Scanning ([0-9A-Za-z\_\*]{3,17})\. \[Online\] \[Offline\] \[Banned\]/);

                                break;
                            case 'pixelmon':

                                dupeipPlayerIGNMessageStringRegex = `^Scanning ${playerIGNForRegex}\\. \\[Online\\] \\[Offline\\] \\[Banned\\]|^No history found\\.`;

                                dupeipPlayerIGNSuccessMessageRegex = RegExp(/^Scanning ([0-9A-Za-z\_\*]{3,17})\. \[Online\] \[Offline\] \[Banned\]/);

                                break;
                        }

                        const dupeipPlayerIGNMessageRegex = RegExp(dupeipPlayerIGNMessageStringRegex, 'i');

                        const dupeipPlayerIGN = staffBot.findMessage(8000, dupeipPlayerIGNMessageRegex).then(async (dupeipPlayerIGNResult) => {
                            if (dupeipPlayerIGNResult === false) {
                                await discordSlashCommandDetails.editReply({ content: '```' + `Failed to obtain ${playerIGN}'s dupeip!` + '```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                });
                            } else {
                                switch (dupeipPlayerIGNSuccessMessageRegex.test(dupeipPlayerIGNResult)) {
                                    default:
                                        await discordSlashCommandDetails.editReply({ content: '```Error occured while determining either dupeip success or failed!```', ephemeral: false }).then(() => {

                                            discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                        });
                                        break;
                                    case false:
                                        await discordSlashCommandDetails.editReply({ content: '```' + `${dupeipPlayerIGNResult}` + '```', ephemeral: false }).then(() => {

                                            discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = `${dupeipPlayerIGNResult}`;

                                        });
                                        break;
                                    case true:

                                        const dupeipDataPlayerIGNMessageRegex = RegExp(playerIGNForRegex, 'i');

                                        const dupeipPlayerIGNDetails = String(dupeipPlayerIGNResult).match(dupeipPlayerIGNSuccessMessageRegex);

                                        const dupeipPlayerIGNActualIGN = dupeipPlayerIGNDetails[1];

                                        const dupeipDataPlayerIGN = staffBot.findMessage(8000, dupeipDataPlayerIGNMessageRegex).then(async (dupeipDataPlayerIGNResult) => {
                                            if (dupeipDataPlayerIGNResult === false) {
                                                await discordSlashCommandDetails.editReply({ content: '```' + `Failed to obtain ${dupeipPlayerIGNActualIGN}'s dupeip data!` + '```', ephemeral: false }).then(() => {

                                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                                });
                                            } else {

                                                regexExcludedCharacters.forEach((regexExcludedCharacter) => {

                                                    dupeipDataPlayerIGNResult = dupeipDataPlayerIGNResult.replace(RegExp(`[\\${regexExcludedCharacter}]`, 'g'), `\\${regexExcludedCharacter}`);

                                                });

                                                let dupeipDataPlayerIGNEmbedDescription = `IGN: ${playerIGNForRegex}\n` + `Accounts: ${dupeipDataPlayerIGNResult}`;

                                                const dupeipDataPlayerIGNEmbed = new EmbedBuilder()
                                                    .setTitle('DUPEIP')
                                                    .setColor(discordEmbedDetails.color)
                                                    .setThumbnail(discordEmbedDetails.thumbnail)
                                                    .setDescription(dupeipDataPlayerIGNEmbedDescription)
                                                    .setFooter(discordEmbedDetails.footer)
                                                    .setTimestamp();

                                                await discordSlashCommandDetails.editReply({ embeds: [dupeipDataPlayerIGNEmbed], ephemeral: false }).then(() => {

                                                    discordSlashCommandHandlerResultDetails.result = true;

                                                });
                                            }
                                        });

                                        await dupeipDataPlayerIGN;
                                        break;
                                }
                            }
                        });

                        staffBot.chat(`/dupeip ${playerIGN}`);
                        await dupeipPlayerIGN;
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