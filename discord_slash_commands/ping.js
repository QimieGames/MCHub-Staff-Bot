const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("Shows A Player's Ping Ingame.")
        .setDMPermission(false)
        .addStringOption(playerIGN =>
            playerIGN.setName('player-ign')
                .setDescription('Minecraft Username.')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(17)),
    async execute(discordEmbedDetails, discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, staffBot, isMinecraftUsernameValid) {
        try {

            const playerIGN = String(discordSlashCommandDetails.options.getString('player-ign'));

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName} player-ign:${playerIGN}`;

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

                    const staffBotUsername = String(staffBot.username);

                    const pingPlayerIGNEmbed = new EmbedBuilder()
                        .setTitle('INGAME PING')
                        .setColor(discordEmbedDetails.color)
                        .setThumbnail(discordEmbedDetails.thumbnail)
                        .setFooter(discordEmbedDetails.footer)
                        .setTimestamp();

                    let pingPlayerIGNMessageRegex, pingPlayerIGN;

                    if (playerIGN.toLowerCase() === String(staffBotUsername).toLowerCase()) {

                        pingPlayerIGNMessageRegex = RegExp(/^MCHUB \» Your ping is ([0-9]+) ms/);

                        pingPlayerIGN = staffBot.findMessage(8000, pingPlayerIGNMessageRegex).then(async (pingPlayerIGNResult) => {
                            if (pingPlayerIGNResult === false) {
                                await discordSlashCommandDetails.editReply({ content: "```Failed to obtain staff bot's ingame ping!```", ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                });
                            } else {

                                const staffBotPingDetails = String(pingPlayerIGNResult).match(pingPlayerIGNMessageRegex);

                                const staffBotPing = staffBotPingDetails[1];

                                const pingPlayerIGNEmbedDescription = `IGN: ${staffBotUsername.replace(RegExp(/[\_]/, 'g'), '\\_')}\n` + `Ping: ${staffBotPing}ms`;

                                pingPlayerIGNEmbed.setDescription(pingPlayerIGNEmbedDescription);
                                await discordSlashCommandDetails.editReply({ embeds: [pingPlayerIGNEmbed], ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = true;

                                });
                            }
                        });

                    } else {

                        pingPlayerIGNMessageRegex = RegExp(/^MCHUB \» ([0-9A-Za-z\_\*]{3,17})'s ping is ([0-9]+) ms|MCHUB \» No one by the name of ([0-9A-Za-z\_\*]{3,17}) is online\!/, 'i');

                        pingPlayerIGN = staffBot.findMessage(8000, pingPlayerIGNMessageRegex).then(async (pingPlayerIGNResult) => {
                            if (pingPlayerIGNResult === false) {
                                await discordSlashCommandDetails.editReply({ content: '```' + `Failed to obtain ${playerIGN}'s ingame ping!` + '```', ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = 'ERROR';

                                });
                            } else {

                                const playerIGNPingDetails = String(pingPlayerIGNResult).match(pingPlayerIGNMessageRegex);

                                if (playerIGNPingDetails[3] === undefined) {

                                    const playerIGNActualIGN = playerIGNPingDetails[1];

                                    const playerIGNPing = playerIGNPingDetails[2];

                                    const pingPlayerIGNEmbedDescription = `IGN: ${playerIGNActualIGN.replace(RegExp(/[\_]/, 'g'), '\\_')}\n` + `Ping: ${playerIGNPing}ms`;

                                    pingPlayerIGNEmbed.setDescription(pingPlayerIGNEmbedDescription);
                                    await discordSlashCommandDetails.editReply({ embeds: [pingPlayerIGNEmbed], ephemeral: false }).then(() => {

                                        discordSlashCommandHandlerResultDetails.result = true;

                                    });
                                } else {
                                    await discordSlashCommandDetails.editReply({ content: '```' + `Failed to obtain ${playerIGN}'s ingame ping as they are offline!` + '```', ephemeral: false }).then(() => {

                                        discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = `Failed to obtain ${playerIGN}'s ingame ping as they are offline!`;

                                    });
                                }
                            }
                        });

                    }
                    staffBot.chat(`/ping ${playerIGN}`);
                    await pingPlayerIGN;
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