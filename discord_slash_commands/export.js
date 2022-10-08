const { SlashCommandBuilder } = require('discord.js');

const excel = require('xlsx');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export')
        .setDescription('Export Ingame Stats Into An Excel File.')
        .setDMPermission(false)
        .addSubcommand(gameplay_stats =>
            gameplay_stats.setName('gameplay-stats')
                .setDescription('Export Gameplay Stats Into An Excel File. [Trusted+ User Command]')
                .addStringOption(playerIGN =>
                    playerIGN.setName('player-ign')
                        .setDescription('Minecraft Username(s). (Maximum: 60 Players)')
                        .setRequired(true)
                        .setMinLength(3)))
        .addSubcommand(staffstats =>
            staffstats.setName('staffstats')
                .setDescription('Export Staffstats Into An Excel File. [Admin User Command]')
                .addStringOption(srmod_ign =>
                    srmod_ign.setName('srmod-ign')
                        .setDescription('Minecraft Username(s). (Maximum: 60 Staff Members)')
                        .setRequired(false)
                        .setMinLength(3))
                .addStringOption(mod_ign =>
                    mod_ign.setName('mod-ign')
                        .setDescription('Minecraft Username(s). (Maximum: 60 Staff Members)')
                        .setRequired(false)
                        .setMinLength(3))
                .addStringOption(helper_ign =>
                    helper_ign.setName('helper-ign')
                        .setDescription('Minecraft Username(s). (Maximum: 60 Staff Members)')
                        .setRequired(false)
                        .setMinLength(3))
                .addStringOption(trial_ign =>
                    trial_ign.setName('trial-ign')
                        .setDescription('Minecraft Username(s). (Maximum: 60 Staff Members)')
                        .setRequired(false)
                        .setMinLength(3))),
    async execute(discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, staffBot, isMinecraftUsernameValid) {
        try {

            const statsType = String(discordSlashCommandDetails.options.getSubcommand());

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName} ${statsType}`;

            let discordSlashCommandWhitelistedRolesID = [];

            switch (statsType) {
                default:
                    await discordSlashCommandDetails.editReply({ content: '```Internal error occured!```', ephemeral: false }).then(() => {

                        discordSlashCommandHandlerResultDetails.result = 'ERROR';

                    });
                    break;
                case 'staffstats':
                    discordSlashCommandWhitelistedRolesID.push(configValue.role_id.bot_admin);
                    if (discordSlashCommandDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                        await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                            discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User has insufficient permission!';

                        });
                    } else {

                        const staffstatsGetStringOptions = ['srmod-ign', 'mod-ign', 'helper-ign', 'trial-ign'];

                        let allStaffMemberIGNs = new Array();

                        staffstatsGetStringOptions.forEach((staffstatsGetStringOption) => {
                            if (discordSlashCommandDetails.options.getString(staffstatsGetStringOption) !== null) {

                                let staffMemberIGNs = String(discordSlashCommandDetails.options.getString(staffstatsGetStringOption)).replace(RegExp(/[ ]+/, 'g'), ' ');

                                discordSlashCommandHandlerResultDetails.fullCommand = discordSlashCommandHandlerResultDetails.fullCommand + ` ${staffstatsGetStringOption}:${staffMemberIGNs}`;

                                staffMemberIGNs = staffMemberIGNs.split(' ');

                                staffMemberIGNs.forEach((staffMemberIGN) => {
                                    allStaffMemberIGNs.push(staffMemberIGN);
                                });
                            }
                        });

                        const allStaffMemberIGNsArrayLength = allStaffMemberIGNs.length;

                        if (allStaffMemberIGNsArrayLength > 60) {
                            await discordSlashCommandDetails.editReply({ content: '```Only 60 staff members are allowed at once!```', ephemeral: false }).then(() => {

                                discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'Only 60 staff members are allowed at once!';

                            });
                        } else if (allStaffMemberIGNsArrayLength === 0) {
                            await discordSlashCommandDetails.editReply({ content: '```Invalid command usage!```', ephemeral: false }).then(() => {

                                discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'Invalid command usage!';

                            });
                        } else if (allStaffMemberIGNsArrayLength > 0 && allStaffMemberIGNsArrayLength <= 60) {

                            let invalidStaffMemberIGNsResult = new Array();

                            allStaffMemberIGNs.forEach((individualStaffMemberIGN) => {
                                if (typeof invalidStaffMemberIGNsResult === 'object' || typeof invalidStaffMemberIGNsResult === 'boolean') {
                                    switch (isMinecraftUsernameValid(individualStaffMemberIGN)) {
                                        default:

                                            invalidStaffMemberIGNsResult = 'Error occured while executing isMinecraftUsernameValid function!';

                                            break;
                                        case false:
                                            invalidStaffMemberIGNsResult.push(individualStaffMemberIGN);
                                            break;
                                        case true:

                                            invalidStaffMemberIGNsResult = true;

                                            break;
                                    }
                                }
                            });
                            switch (typeof invalidStaffMemberIGNsResult) {
                                default:
                                    await discordSlashCommandDetails.editReply({ content: '```Internal error occured!```', ephemeral: false }).then(() => {

                                        discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                    });
                                    break;
                                case 'string':
                                    await discordSlashCommandDetails.editReply({ content: '```' + invalidStaffMemberIGNsResult + '```', ephemeral: false }).then(() => {

                                        discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                    });
                                    break;
                                case 'object':
                                    await discordSlashCommandDetails.editReply({ content: '```' + `Invalid Minecraft Username(s) provided! Invalid Username(s): "${invalidStaffMemberIGNsResult.join('", "')}` + '```' }).then(() => {

                                        discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = `Invalid Minecraft Username(s) provided! Invalid Username(s): ${invalidStaffMemberIGNsResult.join(', ')}`;

                                    });
                                    break;
                                case 'boolean':

                                    const staffstatsDataWorkbook = excel.utils.book_new();

                                    for (const staffstatsGetStringOption of staffstatsGetStringOptions) {
                                        if (discordSlashCommandDetails.options.getString(staffstatsGetStringOption) !== null) {

                                            const staffIGNs = String(discordSlashCommandDetails.options.getString(staffstatsGetStringOption)).replace(new RegExp(/[ ]+/, 'g'), ' ').split(' ');

                                            const fullStaffstatsData = new Array();

                                            for (const staffIGN of staffIGNs) {

                                                let staffstatsData =

                                                {
                                                    IGN: null,
                                                    ONLINE_TIME: null,
                                                    VANISH_TIME: null,
                                                    IDLE_TIME: null,
                                                    MESSAGES: null,
                                                    BANS: null,
                                                    MUTES: null,
                                                    WARNS: null,
                                                    KICKS: null
                                                };

                                                const staffIGNExcludedRegexCharacters = ['*', '_'];

                                                let staffIGNForRegex = staffIGN;

                                                staffIGNExcludedRegexCharacters.forEach((staffIGNExcludedRegexCharacter) => {

                                                    staffIGNForRegex = staffIGNForRegex.replace(RegExp(`[\\${staffIGNExcludedRegexCharacter}]`, 'g'), `\\\\${staffIGNExcludedRegexCharacter}`);

                                                });

                                                const startOfStaffstatsMessageString = `^MCHUB \\» Statistics for ${staffIGNForRegex}`;

                                                const startOfStaffstatsMessageRegex = RegExp(startOfStaffstatsMessageString, 'i');

                                                const getStaffstats = staffBot.findMessage(8000, startOfStaffstatsMessageRegex).then(async (getStaffstatsResult) => {
                                                    if (getStaffstatsResult === false) {
                                                        Object.keys(staffstatsData).forEach((staffstatsDataType) => {

                                                            staffstatsData[staffstatsDataType] = 'NOT AVAILABLE';

                                                        });
                                                    } else {

                                                        const staffActualIGNDetails = String(getStaffstatsResult).match(RegExp(/^MCHUB \» Statistics for ([0-9A-Za-z\_\*]{3,17})/));

                                                        const staffActualIGN = staffActualIGNDetails[1];

                                                        staffstatsData.IGN = staffActualIGN;

                                                        const staffstatsRegex =

                                                        {
                                                            ONLINE_TIME: RegExp(/^MCHUB \» Weekly Staff Ontime\: ([0-9a-z ]+)/),
                                                            VANISH_TIME: RegExp(/^MCHUB \» Weekly Ontime in Vanish\: ([0-9a-z ]+)/),
                                                            IDLE_TIME: RegExp(/^MCHUB \» Weekly Idle time\: ([0-9a-z ]+)/),
                                                            MESSAGES: RegExp(/^MCHUB \» Messages\: ([0-9\,]+)/),
                                                            BANS: RegExp(/^MCHUB \» Bans\: ([0-9\,]+)/),
                                                            MUTES: RegExp(/^MCHUB \» Mutes\: ([0-9\,]+)/),
                                                            WARNS: RegExp(/^MCHUB \» Warns\: ([0-9\,]+)/),
                                                            KICKS: RegExp(/^MCHUB \» Kicks\: ([0-9\,]+)/)
                                                        };

                                                        let staffstatsDataPromises = new Array();

                                                        Object.keys(staffstatsRegex).forEach((staffstatsDataType) => {

                                                            const staffstatsDataPromise = staffBot.findMessage(8000, staffstatsRegex[staffstatsDataType]).then((getStaffstatsDataResult) => {
                                                                if (getStaffstatsDataResult === false) {

                                                                    staffstatsData[staffstatsDataType] = 'NOT AVAILABLE';

                                                                } else {

                                                                    const staffstatsDataDetails = String(getStaffstatsDataResult).match(staffstatsRegex[staffstatsDataType]);

                                                                    const staffstatsDataResult = staffstatsDataDetails[1];

                                                                    staffstatsData[staffstatsDataType] = staffstatsDataResult;

                                                                }
                                                            });

                                                            staffstatsDataPromises.push(staffstatsDataPromise);
                                                        });

                                                        await Promise.all(staffstatsDataPromises);
                                                    }
                                                });

                                                staffBot.chat(`/staffstats ${staffIGN}`);
                                                await getStaffstats;
                                                fullStaffstatsData.push(staffstatsData);
                                            }

                                            const staffstatsDataWorkSheet = excel.utils.json_to_sheet(fullStaffstatsData);

                                            staffstatsDataWorkSheet['!cols'] = [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }];

                                            excel.utils.book_append_sheet(staffstatsDataWorkbook, staffstatsDataWorkSheet, staffstatsGetStringOption.replace(RegExp(/\-ign$/), '').toUpperCase());
                                        }
                                    }

                                    const staffstatsDataFileDateDetails = new Date();

                                    const staffstatsDataFileFullName = `STAFFSTATS-${staffstatsDataFileDateDetails.getDate()}_${staffstatsDataFileDateDetails.getMonth() + 1}_${staffstatsDataFileDateDetails.getFullYear()}-_${staffstatsDataFileDateDetails.getHours()}_${staffstatsDataFileDateDetails.getMinutes()}_${staffstatsDataFileDateDetails.getSeconds()}.xlsx`;

                                    const staffstatsDataFile = `././data/staffstats/${staffstatsDataFileFullName}`;

                                    try {
                                        excel.writeFileXLSX(staffstatsDataWorkbook, staffstatsDataFile);
                                        try {
                                            await discordSlashCommandDetails.editReply({ files: [staffstatsDataFile], ephemeral: false }).then(() => {

                                                discordSlashCommandHandlerResultDetails.result = true;

                                            });
                                        } catch {
                                            await discordSlashCommandDetails.editReply({ content: '```' + `Error occured while retrieving ${staffstatsDataFileFullName}!` + '```', ephemeral: false }).then(() => {

                                                discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                            });
                                        }
                                    } catch {
                                        await discordSlashCommandDetails.editReply({ content: '```' + `Error occured while generating ${staffstatsDataFileFullName}!` + '```', ephemeral: false }).then(() => {

                                            discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                        });
                                    }
                                    break;
                            }
                        } else {
                            await discordSlashCommandDetails.editReply({ content: '```Internal error occured!```', ephemeral: false }).then(() => {

                                discordSlashCommandHandlerResultDetails.result = 'ERROR';

                            });
                        }
                    }
                    break;
                case 'gameplay-stats':
                    await discordSlashCommandDetails.editReply({ content: '```This command is still in development!```', ephemeral: false }).then(() => {

                        discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'This command is still in development!';

                    });
                    break;
            }
        } catch {
            await discordSlashCommandDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordSlashCommandHandlerResultDetails.result = 'ERROR';

            });
        }
        return discordSlashCommandHandlerResultDetails;
    }
};