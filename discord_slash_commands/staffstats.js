const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staffstats')
        .setDescription("Shows A Staff Member's Staffstats. [Admin User Command]")
        .setDMPermission(false)
        .addStringOption(staffMemberIGN =>
            staffMemberIGN.setName('staff-member-ign')
                .setDescription('Minecraft Username.')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(17)),
    async execute(discordEmbedDetails, discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, staffBot, isMinecraftUsernameValid) {
        try {

            const staffMemberIGN = String(discordSlashCommandDetails.options.getString('staff-member-ign'));

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName} staff-member-ign:${staffMemberIGN}`;

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin];

            if (discordSlashCommandDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User has insufficient permission!';

                });
            } else {
                switch (isMinecraftUsernameValid(staffMemberIGN)) {
                    default:
                        await discordSlashCommandDetails.editReply({ content: '```Error occured while executing isMinecraftUsernameValid function!```', ephemeral: false }).then(() => {

                            discordSlashCommandHandlerResultDetails.result = 'ERROR';

                        });
                        break;
                    case false:
                        await discordSlashCommandDetails.editReply({ content: '```' + `${staffMemberIGN} is not a valid Minecraft Username!` + '```', ephemeral: false }).then(() => {

                            discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = `${staffMemberIGN} is not a valid Minecraft Username!`;

                        });
                        break;
                    case true:

                        const staffstatsMessageRegex = RegExp(/^MCHUB \\» Statistics for ([0-9A-Za-z\_\*]{3,17})/, 'i');

                        const staffstatsStaffMemberIGN = staffBot.findMessage(8000, staffstatsMessageRegex).then(async (staffstatsStaffMemberIGNResult) => {
                            if (staffstatsStaffMemberIGNResult === false) {
                                await discordSlashCommandDetails.editReply({ content: '```' + `Failed to obtain ${staffMemberIGN}'s staffstats!` + '```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                });
                            } else {

                                const staffstatsStaffMemberIGNActualIGNDetails = String(staffstatsStaffMemberIGNResult).match(staffstatsMessageRegex);

                                const staffMemberIGNActualIGN = staffstatsStaffMemberIGNActualIGNDetails[1];

                                const staffstatsDataRegex =

                                {
                                    onlineTime: RegExp(/^MCHUB \» Weekly Staff Ontime\: ([0-9a-z ]+)/),
                                    vanishTime: RegExp(/^MCHUB \» Weekly Ontime in Vanish\: ([0-9a-z ]+)/),
                                    idleTime: RegExp(/^MCHUB \» Weekly Idle time\: ([0-9a-z ]+)/),
                                    messages: RegExp(/^MCHUB \» Messages\: ([0-9\,]+)/),
                                    bans: RegExp(/^MCHUB \» Bans\: ([0-9\,]+)/),
                                    mutes: RegExp(/^MCHUB \» Mutes\: ([0-9\,]+)/),
                                    warns: RegExp(/^MCHUB \» Warns\: ([0-9\,]+)/),
                                    kicks: RegExp(/^MCHUB \» Kicks\: ([0-9\,]+)/)
                                };

                                let staffstatsDataPromises = new Array();

                                let staffstatsData =

                                {
                                    onlineTime: null,
                                    vanishTime: null,
                                    idleTime: null,
                                    messages: null,
                                    bans: null,
                                    mutes: null,
                                    warns: null,
                                    kicks: null
                                };

                                Object.keys(staffstatsDataRegex).forEach((staffstatsDataRegexType) => {

                                    const staffstatsDataPromise = staffBot.findMessage(8000, staffstatsDataRegex[staffstatsDataRegexType]).then((staffstatsDataPromiseResult) => {
                                        if (staffstatsDataPromiseResult === false) {

                                            staffstatsData[staffstatsDataRegexType] = 'NOT AVAILABLE';

                                        } else {

                                            const staffstatsDataDetails = String(staffstatsDataPromiseResult).match(staffstatsDataRegex[staffstatsDataRegexType]);

                                            const staffstatsDataResult = staffstatsDataDetails[1];

                                            staffstatsData[staffstatsDataRegexType] = staffstatsDataResult;

                                        }
                                    });

                                    staffstatsDataPromises.push(staffstatsDataPromise);
                                });
                                await Promise.all(staffstatsDataPromises);

                                const staffstatsEmbedDescription = `IGN: ${staffMemberIGNActualIGN}\n` + `Weekly Online Time: ${staffstatsData.onlineTime}\n` + `Weekly Ontime In Vanish: ${staffstatsData.vanishTime}\n` + `Weekly Idle Time: ${staffstatsData.idleTime}\n` + `Messages: ${staffstatsData.messages}\n` + `Bans: ${staffstatsData.bans}\n` + `Mutes: ${staffstatsData.mutes}\n` + `Warns: ${staffstatsData.warns}\n` + `Kicks: ${staffstatsData.kicks}`;

                                const staffstatsEmbed = new EmbedBuilder()
                                    .setTitle(`STAFFSTATS`)
                                    .setColor(discordEmbedDetails.color)
                                    .setThumbnail(discordEmbedDetails.thumbnail)
                                    .setDescription(staffstatsEmbedDescription)
                                    .setFooter(discordEmbedDetails.footer)
                                    .setTimestamp();

                                await discordSlashCommandDetails.editReply({ embeds: [staffstatsEmbed], ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = true;

                                });
                            }
                        });

                        staffBot.chat(`/staffstats ${staffMemberIGN}`);
                        await staffstatsStaffMemberIGN;
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