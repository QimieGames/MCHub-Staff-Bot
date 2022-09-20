const DiscordJS = require('discord.js');

module.exports = {
    data: {
        name: 'staff_bot_chat'
    },
    async execute(configValue, guildID, clientID, discordBot, chatMessage) {

        const realmName = String(configValue.staff_bot.realm_name).toLowerCase();

        const pixelmonCharacterRanks = ['TEST'];

        const pixelmonRanks = ['TESTRANK'];

        let publicChatStringRegex, chatClearedStringRegex, chatToggledStringRegex;

        switch (realmName) {
            case 'hubm':

                publicChatStringRegex = '^(\\[\\-\\]|\\[[A-Za-z\\+]+\\]|\\|\\[[A-Za-z\\+]+\\]\\|) [0-9A-Za-z\\_\\*]{3,17}\\: .+$';

                chatClearedStringRegex = '^CHAT \\» The chat has been cleared by ([0-9A-Za-z\\_\\*]{3,17})\\!';

                chatToggledStringRegex = '^Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
            case 'atlantic':

                publicChatStringRegex = '^(\\[\\-\\]|\\[R[0-9]+\\]|\\[P[0-9]+\\] \\[R[0-9]+\\]) (\\[[A-Za-z\\+]+\\]|\\|\\[[A-Za-z\\+]+\\]\\||\\[[A-Za-z\\+]+\\] \\[.+\\]|\\|\\[[A-Za-z\\+]+\\]\\| \\[.+\\]) [0-9A-Za-z\\_\\*]{3,17}(| \\[P\\])\\: .+$';

                chatClearedStringRegex = '^CHAT \\» The chat has been cleared by ([0-9A-Za-z\\_\\*]{3,17})\\!';

                chatToggledStringRegex = '^Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
            case 'sun':

                publicChatStringRegex = '^\\[L[0-9]+\\] (\\[[A-Za-z\\+]+\\]|\\|\\[[A-Za-z\\+]+\\]\\||\\[[A-Za-z\\+]+\\] \\[.+\\]|\\|\\[[A-Za-z\\+]+\\]\\| \\[.+\\]) .+(| \\[P\\])\\: .+$';

                chatClearedStringRegex = '^CHAT \\» The chat has been cleared by ([0-9A-Za-z\\_\\*]{3,17})\\!';

                chatToggledStringRegex = '^CHAT \\> Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
            case 'survival':

                publicChatStringRegex = '^(\\[\\-\\]|\\[[A-Za-z\\+]+\\]|\\|\\[[A-Za-z\\+]+\\]\\|) [0-9A-Za-z\\_\\*]{3,17}(| \\[P\\])\\: .+$';

                chatClearedStringRegex = '^CHAT \\» The chat has been cleared by ([0-9A-Za-z\\_\\*]{3,17})\\!';

                chatToggledStringRegex = '^Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
            case 'pixelmon':

                publicChatStringRegex = '^.{1} .{3,17} \\» .+$';

                chatClearedStringRegex = '^CHAT \\» The chat has been cleared by ([0-9A-Za-z\\_\\*]{3,17})\\!';

                chatToggledStringRegex = '^Server chat has been (enabled|disabled) by ([0-9A-Za-z\\_\\*]{3,17})\\.';

                break;
        }

        const chatMessageRegex =

        {
            public_chat: new RegExp(publicChatStringRegex),
            global_staff_chat: new RegExp(/^\[[0-9A-Za-z]+\] \[GSC\] \[[A-Za-z\+]+\] [0-9A-Za-z\_\*]{3,17}\: .+$/),
            staff_chat: new RegExp(/^\[[0-9A-Za-z]+\] \[SC\] \[[A-Za-z\+]+\] [0-9A-Za-z\_\*]{3,17}\: .+$/),
            trial_chat: new RegExp(/^\[[0-9A-Za-z]+\] \[TC\] \[[A-Za-z\+]+\] [0-9A-Za-z\_\*]{3,17}\: .+$/),
            global_social_spy: new RegExp(/^\(([0-9a-z\> ]+)\) \[Spy\] \[[0-9A-Za-z\_\*]{3,17} \> [0-9A-Za-z\_\*]{3,17}\] .+$/),
            social_spy: new RegExp(/^\[Spy\] \[[0-9A-Za-z\_\*]{3,17} \> [0-9A-Za-z\_\*]{3,17}\] .+$/),
            player_report: new RegExp(/^\(([0-9A-Za-z]+)\) REPORT \» ([0-9A-Za-z\_\*]{3,17}) reported ([0-9A-Za-z\_\*]{3,17}) for (.+)(\.|\!)/),
            helpop: new RegExp(/^\[HelpOp\] ([0-9A-Za-z\_\*]{3,17})\: (.+)$/),
            auto_clicker_alert: new RegExp(/^AC \» ([0-9A-Za-z\_\*]{3,17}) may be using autoclicker\! \(([0-9\.]+) \> [0-9]+\) Variance \([0-9]+ \- [0-9]+ms\)/),
            afk_checked_alert: new RegExp(/^AC \» ([0-9A-Za-z\_\*]{3,17}) has been AFK Checked\, this player has been afk for ([0-9a-z ]+)\!/),
            nuker_alert: new RegExp(/^AC \» ([0-9A-Za-z\_\*]{3,17}) may be using nuker\! \(([0-9]+) \> ([0-9]+)\)/),
            chat_cleared: new RegExp(chatClearedStringRegex),
            chat_toggled: new RegExp(chatToggledStringRegex)
        };

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
            if (Boolean(configValue.feature[`log_${chatMessageType}_to_console`]) === true) {
                if (realmName === 'pixelmon') {
                    pixelmonCharacterRanks.forEach((pixelmonCharacterRank) => {

                        chatMessage = String(chatMessage).replace(RegExp(`[\\${pixelmonCharacterRank}]`, 'g'), `[${pixelmonRanks[pixelmonCharacterRanks.indexOf(pixelmonCharacterRank)]}]`);

                    });
                }
                console.log(chatMessage.toAnsi());
            }
            if (Boolean(configValue.feature[`log_${chatMessageType}_to_discord`]) === true) {

                const chatMessageChannelID = configValue.discord_channel[chatMessageType];

                const chatMessageTypeString = String(chatMessageType).replace(new RegExp(/[\_]/, 'g'), ' ');

                const chatMessageChannelName = discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).name;

                const discordMarkdowns = ['\*', '\_', '\`', '\>', '\|'];

                if (realmName === 'pixelmon') {
                    pixelmonCharacterRanks.forEach((pixelmonCharacterRank) => {

                        chatMessage = String(chatMessage).replace(RegExp(`[\\${pixelmonCharacterRank}]`, 'g'), `[${pixelmonRanks[pixelmonCharacterRanks.indexOf(pixelmonCharacterRank)]}]`);

                    });
                }
                switch (chatMessageType) {
                    default:
                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send('```' + chatMessage + '```');
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
                        break;
                    case 'helpop':

                        const helpopDetails = String(chatMessage).match(chatMessageRegex[chatMessageType]);

                        const helpopPlayerIGN = helpopDetails[1];

                        const helpopReason = helpopDetails[2];

                        let helpopEmbedDescription = `IGN: ${helpopPlayerIGN}\n` + `Reason: ${helpopReason}`;

                        discordMarkdowns.forEach((discordMarkdown) => {

                            helpopEmbedDescription = helpopEmbedDescription.replace(new RegExp(`[\\${discordMarkdown}]`, 'g'), `\\${discordMarkdown}`);

                        });

                        const helpopEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('HELPOP')
                            .setDescription(helpopEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter({ text: 'Custom Coded By QimieGames', iconURL: 'https://images-ext-1.discordapp.net/external/HQFug-TJRekRG6wkhZL_wlEowWtUxuuR940ammbrz7k/https/cdn.discordapp.com/avatars/402039216487399447/347fd513aa2af9e8b4ac7ca80150b953.webp?width=115&height=115' });

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
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} log channel!`);
                        }
                        break;
                    case 'auto_clicker_alert':

                        const autoClickerAlertDetails = String(chatMessage).match(chatMessageRegex[chatMessageType]);

                        const autoClickerAlertPlayerIGN = autoClickerAlertDetails[1].replace(new RegExp(/[\_]/, 'g'), '\\_');

                        const autoClickerAlertPlayerCPS = autoClickerAlertDetails[2];

                        const autoClickerAlertPlayerCPSVarianceDetails = String(chatMessage.hoverEvent.value[0].text).match(new RegExp(/^Time Between Clicks\: \[([0-9\, ]+)\]$/, 'm'));

                        const autoClickerAlertPlayerCPSVariance = autoClickerAlertPlayerCPSVarianceDetails[1];

                        const autoClickerAlertEmbedDescription = `IGN: ${autoClickerAlertPlayerIGN}\n` + `CPS: ${autoClickerAlertPlayerCPS}\n` + `Variance: ${autoClickerAlertPlayerCPSVariance}`;

                        const autoClickerAlertEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('AUTO-CLICKER ALERT')
                            .setDescription(autoClickerAlertEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter({ text: 'Custom Coded By QimieGames', iconURL: 'https://images-ext-1.discordapp.net/external/HQFug-TJRekRG6wkhZL_wlEowWtUxuuR940ammbrz7k/https/cdn.discordapp.com/avatars/402039216487399447/347fd513aa2af9e8b4ac7ca80150b953.webp?width=115&height=115' });

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
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} log channel!`);
                        }
                        break;
                    case 'afk_checked_alert':

                        const afkCheckedAlertDetails = String(chatMessage).match(chatMessageRegex[chatMessageType]);

                        const afkCheckedAlertPlayerIGN = afkCheckedAlertDetails[1].replace(new RegExp(/[\_]/, 'g'), '\\_');

                        const afkCheckedAlertPlayerAFKDuration = afkCheckedAlertDetails[2];

                        const afkCheckedAlertEmbedDescription = `IGN: ${afkCheckedAlertPlayerIGN}\n` + `AFK Duration: ${afkCheckedAlertPlayerAFKDuration}`;

                        const afkCheckedAlertEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('AFK CHECKED')
                            .setDescription(afkCheckedAlertEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter({ text: 'Custom Coded By QimieGames', iconURL: 'https://images-ext-1.discordapp.net/external/HQFug-TJRekRG6wkhZL_wlEowWtUxuuR940ammbrz7k/https/cdn.discordapp.com/avatars/402039216487399447/347fd513aa2af9e8b4ac7ca80150b953.webp?width=115&height=115' });

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
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} log channel!`);
                        }
                        break;
                    case 'nuker_alert':

                        const nukerAlertDetails = String(chatMessage).match(chatMessageRegex[chatMessageType]);

                        const nukerAlertPlayerIGN = nukerAlertDetails[1].replace(new RegExp(/[\_]/, 'g'), '\\_');

                        const nukerAlertPlayerBlocksBroken = nukerAlertDetails[2];

                        const nukerAlertPlayerBlocksBrokenLimit = nukerAlertDetails[3];

                        const nukerAlertEmbedDescription = `IGN: ${nukerAlertPlayerIGN}\n` + `Blocks Broken: ${nukerAlertPlayerBlocksBroken} > ${nukerAlertPlayerBlocksBrokenLimit}`;

                        const nukerAlertEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('NUKER ALERT')
                            .setDescription(nukerAlertEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter({ text: 'Custom Coded By QimieGames', iconURL: 'https://images-ext-1.discordapp.net/external/HQFug-TJRekRG6wkhZL_wlEowWtUxuuR940ammbrz7k/https/cdn.discordapp.com/avatars/402039216487399447/347fd513aa2af9e8b4ac7ca80150b953.webp?width=115&height=115' });

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
                            console.log(`MCHSB » Error occured while finding ${chatMessageTypeString} log channel!`);
                        }
                        break;
                    case 'chat_cleared':

                        const chatClearedAlertDetails = String(chatMessage).match(chatMessageRegex[chatMessageType]);

                        const chatClearedAlertPlayerIGN = chatClearedAlertDetails[1].replace(new RegExp(/[\_]/, 'g'), '\\_');

                        const chatClearedAlertEmbedDescription = `IGN: ${chatClearedAlertPlayerIGN}`;

                        const chatClearedAlertEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('CHAT CLEARED')
                            .setDescription(chatClearedAlertEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter({ text: 'Custom Coded By QimieGames', iconURL: 'https://images-ext-1.discordapp.net/external/HQFug-TJRekRG6wkhZL_wlEowWtUxuuR940ammbrz7k/https/cdn.discordapp.com/avatars/402039216487399447/347fd513aa2af9e8b4ac7ca80150b953.webp?width=115&height=115' });

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [chatClearedAlertEmbed] });
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
                    case 'chat_toggled':

                        const chatToggledAlertDetails = String(chatMessage).match(chatMessageRegex[chatMessageType]);

                        const chatToggledAlertPlayerIGN = chatToggledAlertDetails[2].replace(new RegExp(/[\_]/, 'g'), '\\_');

                        const chatToggledStatus = chatToggledAlertDetails[1].toUpperCase();

                        const chatToggledAlertEmbedDescription = `IGN: ${chatToggledAlertPlayerIGN}\n` + `Status: ${chatToggledStatus}`;

                        const chatToggledAlertEmbed = new DiscordJS.EmbedBuilder()
                            .setColor('#4422bf')
                            .setTitle('CHAT TOGGLED')
                            .setDescription(chatToggledAlertEmbedDescription)
                            .setThumbnail('https://i.imgur.com/7fkLqne.png')
                            .setTimestamp()
                            .setFooter({ text: 'Custom Coded By QimieGames', iconURL: 'https://images-ext-1.discordapp.net/external/HQFug-TJRekRG6wkhZL_wlEowWtUxuuR940ammbrz7k/https/cdn.discordapp.com/avatars/402039216487399447/347fd513aa2af9e8b4ac7ca80150b953.webp?width=115&height=115' });

                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID) !== undefined) {
                            if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                                if (discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                                    await discordBot.guilds.cache.get(guildID).channels.cache.get(chatMessageChannelID).send({ embeds: [chatToggledAlertEmbed] });
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
                }
            }
            return;
        }

        async function logMismatchedMessages() {
            if (Boolean(configValue.feature.log_mismatched_message_to_console) === true) {
                if (realmName === 'pixelmon') {
                    pixelmonCharacterRanks.forEach((pixelmonCharacterRank) => {

                        chatMessage = String(chatMessage).replace(RegExp(`[\\${pixelmonCharacterRank}]`, 'g'), `[${pixelmonRanks[pixelmonCharacterRanks.indexOf(pixelmonCharacterRank)]}]`);

                    });
                }
                console.log(chatMessage.toAnsi());
            }
            if (Boolean(configValue.feature.log_mismatched_message_to_discord) === true) {

                const mismatchedMessageChannelID = configValue.discord_channel.mismatched_message;

                const mismatchedMessageChannelName = discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID).name;

                if (realmName === 'pixelmon') {
                    pixelmonCharacterRanks.forEach((pixelmonCharacterRank) => {

                        chatMessage = String(chatMessage).replace(RegExp(`[\\${pixelmonCharacterRank}]`, 'gm'), `[${pixelmonRanks[pixelmonCharacterRanks.indexOf(pixelmonCharacterRank)]}]`);

                    });
                }
                if (discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID) !== undefined) {
                    if (discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                        if (discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                            await discordBot.guilds.cache.get(guildID).channels.cache.get(mismatchedMessageChannelID).send('```' + chatMessage + '```');
                        } else {
                            console.log(`MCHSB » Error occured while logging mismatched messages in #${mismatchedMessageChannelName}!`);
                        }
                    } else {
                        console.log(`MCHSB » Error occured while viewing #${mismatchedMessageChannelName}!`);
                    }
                } else {
                    console.log(`MCHSB » Error occured while finding mismatched messages channel!`);
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