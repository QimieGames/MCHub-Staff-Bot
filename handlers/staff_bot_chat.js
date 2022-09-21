const DiscordJS = require('discord.js');

module.exports = {
    data: {
        name: 'staff_bot_chat'
    },
    async execute(configValue, guildID, clientID, discordBot, chatMessage) {

        const realmName = String(configValue.staff_bot.realm_name).toLowerCase();

        const pixelmonSpecialCharacters = ['ꃫ', 'ꂹ', 'ꂸ', 'ꂺ', 'ꂻ', 'ꂼ', 'ꃏ', 'ꃠ', 'ꃪ', '丷', '', 'ꃥ', 'ꃦ', 'ꃬ', 'ꃧ', 'ꃭ', 'ꃩ', 'ꃨ'];

        const pixelmonSpecialCharactersTranslation = ['TRAINER', 'ACE', 'PRO', 'ULTRA', 'MASTER', 'MYTHIC', 'LEGEND', 'PRIMAL', 'MEDIA', 'PARTNER', 'TRIAL', 'HELPER', 'MOD', 'SRMOD', 'BUILDER', 'ADMIN', 'MANAGER', 'DEV', 'OWNER'];

        const discordEmbedFooter =

        {
            text: 'Custom Coded By QimieGames',
            iconURL: 'https://i.imgur.com/qTwnd6e.png'
        };

        let publicChatStringRegex, chatToggledStringRegex;

        switch (realmName) {
            case 'hubm':

                publicChatStringRegex = '^(\\[\\-\\]|\\[[A-Za-z\\+]+\\]|\\|\\[[A-Za-z\\+]+\\]\\|) [0-9A-Za-z\\_\\*]{3,17}\\: .+$';

                chatToggledStringRegex = '^Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
            case 'atlantic':

                publicChatStringRegex = '^(\\[\\-\\]|\\[R[0-9]+\\]|\\[P[0-9]+\\] \\[R[0-9]+\\]) (\\[[A-Za-z\\+]+\\]|\\|\\[[A-Za-z\\+]+\\]\\||\\[[A-Za-z\\+]+\\] \\[.+\\]|\\|\\[[A-Za-z\\+]+\\]\\| \\[.+\\]) [0-9A-Za-z\\_\\*]{3,17}(| \\[P\\])\\: .+$';

                chatToggledStringRegex = '^Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
            case 'sun':

                publicChatStringRegex = '^\\[L[0-9]+\\] (\\[[A-Za-z\\+]+\\]|\\|\\[[A-Za-z\\+]+\\]\\||\\[[A-Za-z\\+]+\\] \\[.+\\]|\\|\\[[A-Za-z\\+]+\\]\\| \\[.+\\]) .+(| \\[P\\])\\: .+$';

                chatToggledStringRegex = '^CHAT \\> Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
            case 'survival':

                publicChatStringRegex = '^(\\[\\-\\]|\\[[A-Za-z\\+]+\\]|\\|\\[[A-Za-z\\+]+\\]\\|) [0-9A-Za-z\\_\\*]{3,17}(| \\[P\\])\\: .+$';

                chatToggledStringRegex = '^Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
            case 'pixelmon':

                publicChatStringRegex = '^(\\ꃫ|\\ꂹ|\\ꂸ|\\ꂺ|\\ꂻ|\\ꂼ|\\ꃏ|\\ꃠ|\\ꃪ|\\丷|\\|\\ꃥ|\\ꃦ|\\ꃬ|\\ꃧ|\\ꃭ|\\ꃩ|\\ꃨ) .{3,17} \\» .+$';

                chatToggledStringRegex = '^Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
        }

        const chatMessageRegex =

        {
            public_chat: RegExp(publicChatStringRegex),
            global_staff_chat: RegExp(/^\[[0-9A-Za-z]+\] \[GSC\] \[[A-Za-z\+]+\] [0-9A-Za-z\_\*]{3,17}\: .+$/),
            staff_chat: RegExp(/^\[[0-9A-Za-z]+\] \[SC\] \[[A-Za-z\+]+\] [0-9A-Za-z\_\*]{3,17}\: .+$/),
            trial_chat: RegExp(/^\[[0-9A-Za-z]+\] \[TC\] \[[A-Za-z\+]+\] [0-9A-Za-z\_\*]{3,17}\: .+$/),
            global_social_spy: RegExp(/^\(([0-9a-z\> ]+)\) \[Spy\] \[[0-9A-Za-z\_\*]{3,17} \> [0-9A-Za-z\_\*]{3,17}\] .+$/),
            social_spy: RegExp(/^\[Spy\] \[[0-9A-Za-z\_\*]{3,17} \> [0-9A-Za-z\_\*]{3,17}\] .+$/),
            player_report: RegExp(/^\(([0-9A-Za-z]+)\) REPORT \» ([0-9A-Za-z\_\*]{3,17}) reported ([0-9A-Za-z\_\*]{3,17}) for (.+)(\.|\!)/),
            helpop: RegExp(/^\[HelpOp\] ([0-9A-Za-z\_\*]{3,17})\: (.+)$/),
            auto_clicker_alert: RegExp(/^AC \» ([0-9A-Za-z\_\*]{3,17}) may be using autoclicker\! \(([0-9\.]+) \> [0-9]+\) Variance \([0-9]+ \- [0-9]+ms\)/),
            afk_checked_alert: RegExp(/^AC \» ([0-9A-Za-z\_\*]{3,17}) has been AFK Checked\, this player has been afk for ([0-9a-z ]+)\!/),
            nuker_alert: RegExp(/^AC \» ([0-9A-Za-z\_\*]{3,17}) may be using nuker\! \(([0-9]+) \> ([0-9]+)\)/),
            chat_cleared: RegExp(/^CHAT \» The chat has been cleared by ([0-9A-Za-z\_\*]{3,17})\!/),
            chat_toggled: RegExp(chatToggledStringRegex)
        };

        let chatMessageForConsole = String(chatMessage.toAnsi()).replace(RegExp(/[\`]{3}/, 'g'), '`'), chatMessageForDiscord = String(chatMessage).replace(RegExp(/[\`]{3}/, 'g'), '`');

        if (realmName === 'pixelmon') {
            pixelmonSpecialCharacters.forEach((pixelmonSpecialCharacter) => {

                chatMessageForConsole = String(chatMessageForConsole).replace(RegExp(`\\${pixelmonSpecialCharacter}`), `[${pixelmonSpecialCharactersTranslation[pixelmonSpecialCharacters.indexOf(pixelmonSpecialCharacter)]}]`);

                chatMessageForDiscord = String(chatMessageForDiscord).replace(RegExp(`\\${pixelmonSpecialCharacter}`), `[${pixelmonSpecialCharactersTranslation[pixelmonSpecialCharacters.indexOf(pixelmonSpecialCharacter)]}]`);

            });
        }

        function determineChatMessageType() {

            let determineChatMessageTypeFunctionResult = 'mismatched_message';

            Object.keys(chatMessageRegex).forEach((chatMessageType) => {
                if (determineChatMessageTypeFunctionResult === 'mismatched_message') {
                    if (Boolean(configValue.feature[`log_${chatMessageType}_to_console`]) === true || Boolean(configValue.feature[`log_${chatMessageType}_to_discord`]) === true) {

                        const chatMessageTypeRegex = chatMessageRegex[chatMessageType];

                        if (chatMessageTypeRegex.test(chatMessage) === true) {

                            return determineChatMessageTypeFunctionResult = chatMessageType;

                        }
                    }
                }
            });
            return determineChatMessageTypeFunctionResult;
        }

        async function logChatMessage(chatMessageType) {
            if (String(configValue.feature[`log_${chatMessageType}_to_console`]).toLowerCase() === 'true') {
                console.log(chatMessageForConsole);
            }
            if (String(configValue.feature[`log_${chatMessageType}_to_discord`]).toLowerCase() === 'true') {

                const chatMessageChannelID = configValue.discord_channel[chatMessageType];

                const chatMessageTypeString = String(chatMessageType).replace(RegExp(/[\_]/, 'g'), ' ');

                const chatMessageChannelName = discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).name;

                const discordMarkdowns = ['\*', '\_', '\`', '\>', '\|'];

                switch (chatMessageType) {
                    default:
                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ content: '```' + chatMessageForDiscord + '```' });
                                } else {
                                    console.log(`MCHSB » Error occured while logging ${chatMessageTypeString} in #${chatMessageChannelName}!`);
                                }
                            } else {
                                console.log(`MCHSB » Error occured while viewing #${chatMessageChannelName}!`);
                            }
                        } else {
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} log channel!`);
                        }
                        break;
                    case 'player_report':

                        const playerReportDetails = String(chatMessageForDiscord).match(chatMessageRegex[chatMessageType]);

                        const playerReportRealm = playerReportDetails[1].toUpperCase();

                        const playerReportPlayerIGN = playerReportDetails[2];

                        const playerReportReportedPlayerIGN = playerReportDetails[3];

                        const playerReportReason = playerReportDetails[4];

                        let playerReportEmbedDescription = `IGN: ${playerReportPlayerIGN}\n` + `Reported Player IGN: ${playerReportReportedPlayerIGN}\n` + `Reason: ${playerReportReason}`;

                        discordMarkdowns.forEach((discordMarkdown) => {

                            playerReportEmbedDescription = playerReportEmbedDescription.replace(RegExp(`[\\${discordMarkdown}]`, 'g'), `\\${discordMarkdown}`);

                        });

                        const playerReportEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle(`[${playerReportRealm}] PLAYER REPORT`)
                            .setDescription(playerReportEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter(discordEmbedFooter);

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [playerReportEmbed] });
                                } else {
                                    console.log(`MCHSB » Error occured while logging ${chatMessageTypeString} in #${chatMessageChannelName}!`);
                                }
                            } else {
                                console.log(`MCHSB » Error occured while viewing #${chatMessageChannelName}!`);
                            }
                        } else {
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} channel!`);
                        }
                        break;
                    case 'helpop':

                        const helpopDetails = String(chatMessageForDiscord).match(chatMessageRegex[chatMessageType]);

                        const helpopPlayerIGN = helpopDetails[1];

                        const helpopReason = helpopDetails[2];

                        let helpopEmbedDescription = `IGN: ${helpopPlayerIGN}\n` + `Reason: ${helpopReason}`;

                        discordMarkdowns.forEach((discordMarkdown) => {

                            helpopEmbedDescription = helpopEmbedDescription.replace(RegExp(`[\\${discordMarkdown}]`, 'g'), `\\${discordMarkdown}`);

                        });

                        const helpopEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('HELPOP')
                            .setDescription(helpopEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter(discordEmbedFooter);

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [helpopEmbed] });
                                } else {
                                    console.log(`MCHSB » Error occured while logging ${chatMessageTypeString} in #${chatMessageChannelName}!`);
                                }
                            } else {
                                console.log(`MCHSB » Error occured while viewing #${chatMessageChannelName}!`);
                            }
                        } else {
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} channel!`);
                        }
                        break;
                    case 'auto_clicker_alert':

                        const autoClickerAlertDetails = String(chatMessageForDiscord).match(chatMessageRegex[chatMessageType]);

                        const autoClickerAlertPlayerIGN = autoClickerAlertDetails[1].replace(RegExp(/[\_]/, 'g'), '\\_');

                        const autoClickerAlertPlayerCPS = autoClickerAlertDetails[2];

                        const autoClickerAlertPlayerCPSVarianceDetails = String(chatMessage.hoverEvent.value[0].text).match(RegExp(/^Time Between Clicks\: \[([0-9\, ]+)\]$/));

                        const autoClickerAlertPlayerCPSVariance = autoClickerAlertPlayerCPSVarianceDetails[1];

                        const autoClickerAlertEmbedDescription = `IGN: ${autoClickerAlertPlayerIGN}\n` + `CPS: ${autoClickerAlertPlayerCPS}\n` + `Variance: ${autoClickerAlertPlayerCPSVariance}`;

                        const autoClickerAlertEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('AUTO-CLICKER ALERT')
                            .setDescription(autoClickerAlertEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter(discordEmbedFooter);

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [autoClickerAlertEmbed] });
                                } else {
                                    console.log(`MCHSB » Error occured while logging ${chatMessageTypeString} in #${chatMessageChannelName}!`);
                                }
                            } else {
                                console.log(`MCHSB » Error occured while viewing #${chatMessageChannelName}!`);
                            }
                        } else {
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} channel!`);
                        }
                        break;
                    case 'afk_checked_alert':

                        const afkCheckedAlertDetails = String(chatMessageForDiscord).match(chatMessageRegex[chatMessageType]);

                        const afkCheckedAlertPlayerIGN = afkCheckedAlertDetails[1].replace(RegExp(/[\_]/, 'g'), '\\_');

                        const afkCheckedAlertPlayerAFKDuration = afkCheckedAlertDetails[2];

                        const afkCheckedAlertEmbedDescription = `IGN: ${afkCheckedAlertPlayerIGN}\n` + `AFK Duration: ${afkCheckedAlertPlayerAFKDuration}`;

                        const afkCheckedAlertEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('AFK CHECKED')
                            .setDescription(afkCheckedAlertEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter(discordEmbedFooter);

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [afkCheckedAlertEmbed] });
                                } else {
                                    console.log(`MCHSB » Error occured while logging ${chatMessageTypeString} in #${chatMessageChannelName}!`);
                                }
                            } else {
                                console.log(`MCHSB » Error occured while viewing #${chatMessageChannelName}!`);
                            }
                        } else {
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} channel!`);
                        }
                        break;
                    case 'nuker_alert':

                        const nukerAlertDetails = String(chatMessageForDiscord).match(chatMessageRegex[chatMessageType]);

                        const nukerAlertPlayerIGN = nukerAlertDetails[1].replace(RegExp(/[\_]/, 'g'), '\\_');

                        const nukerAlertPlayerBlocksBroken = nukerAlertDetails[2];

                        const nukerAlertPlayerBlocksBrokenLimit = nukerAlertDetails[3];

                        const nukerAlertEmbedDescription = `IGN: ${nukerAlertPlayerIGN}\n` + `Blocks Broken: ${nukerAlertPlayerBlocksBroken} > ${nukerAlertPlayerBlocksBrokenLimit}`;

                        const nukerAlertEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('NUKER ALERT')
                            .setDescription(nukerAlertEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter(discordEmbedFooter);

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [nukerAlertEmbed] });
                                } else {
                                    console.log(`MCHSB » Error occured while logging ${chatMessageTypeString} in #${chatMessageChannelName}!`);
                                }
                            } else {
                                console.log(`MCHSB » Error occured while viewing #${chatMessageChannelName}!`);
                            }
                        } else {
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} channel!`);
                        }
                        break;
                    case 'chat_cleared':

                        const chatClearedDetails = String(chatMessageForDiscord).match(chatMessageRegex[chatMessageType]);

                        const chatClearedStaffIGN = chatClearedDetails[1].replace(RegExp(/[\_]/, 'g'), '\\_');

                        const chatClearedEmbedDescription = `IGN: ${chatClearedStaffIGN}`;

                        const chatClearedEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('CHAT CLEARED')
                            .setDescription(chatClearedEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter(discordEmbedFooter);

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [chatClearedEmbed] });
                                } else {
                                    console.log(`MCHSB » Error occured while logging ${chatMessageTypeString} in #${chatMessageChannelName}!`);
                                }
                            } else {
                                console.log(`MCHSB » Error occured while viewing #${chatMessageChannelName}!`);
                            }
                        } else {
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} channel!`);
                        }
                        break;
                    case 'chat_toggled':

                        const chatToggledDetails = String(chatMessageForDiscord).match(chatMessageRegex[chatMessageType]);

                        const chatToggledStaffIGN = chatToggledDetails[2].replace(RegExp(/[\_]/, 'g'), '\\_');

                        const chatToggledStatus = chatToggledDetails[1].toUpperCase();

                        const chatToggledEmbedDescription = `IGN: ${chatToggledStaffIGN}\n` + `Status: ${chatToggledStatus}`;

                        const chatToggledEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('CHAT TOGGLED')
                            .setDescription(chatToggledEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter(discordEmbedFooter);

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [chatToggledEmbed] });
                                } else {
                                    console.log(`MCHSB » Error occured while logging ${chatMessageTypeString} in #${chatMessageChannelName}!`);
                                }
                            } else {
                                console.log(`MCHSB » Error occured while viewing #${chatMessageChannelName}!`);
                            }
                        } else {
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} channel!`);
                        }
                        break;
                }
            }
            return;
        }

        async function logMismatchedMessages() {
            if (String(configValue.feature.log_mismatched_message_to_console).toLowerCase() === 'true') {
                console.log(chatMessageForConsole);
            }
            if (String(configValue.feature.log_mismatched_message_to_discord).toLowerCase() === 'true') {

                const mismatchedMessageChannelID = configValue.discord_channel.mismatched_message;

                const mismatchedMessageChannelName = discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID).name;

                if (discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID) !== undefined) {
                    if (discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                            await discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID).send({ content: '```' + chatMessageForDiscord + '```' });
                        } else {
                            console.log(`MCHSB » Error occured while logging mismatched messages in #${mismatchedMessageChannelName}!`);
                        }
                    } else {
                        console.log(`MCHSB » Error occured while viewing #${mismatchedMessageChannelName}!`);
                    }
                } else {
                    console.log(`MCHSB » Error occured while finding mismatched message channel!`);
                }
            }
        }

        const chatMessageType = determineChatMessageType();

        switch (chatMessageType) {
            default:
                await logChatMessage(chatMessageType);
                break;
            case 'mismatched_message':
                await logMismatchedMessages();
                break;
        }
        return;
    }
};