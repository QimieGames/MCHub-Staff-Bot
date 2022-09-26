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
    async execute(discordEmbedDetails, discordInteractionResultDetails, discordInteractionDetails, staffBot, isMinecraftUsernameValid) {

        const playerIGN = String(discordInteractionDetails.options.getString('player-ign'));

        discordInteractionResultDetails.interactionFullCommand = `/${discordInteractionDetails.commandName} player-ign:${playerIGN}`;

        try {
            switch (isMinecraftUsernameValid(playerIGN)) {
                case false:
                    await discordInteractionDetails.editReply({ content: '```' + `${playerIGN} is not a valid Minecraft Username!` + '```', ephemeral: false }).then(() => {

                        discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = `Invalid Minecraft Username provided!`;

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

                        pingPlayerIGN = staffBot.findMessage(10000, pingPlayerIGNMessageRegex).then(async (pingPlayerIGNResult) => {
                            if (pingPlayerIGNResult === false) {
                                await discordInteractionDetails.editReply({ content: "```Failed to obtain staff bot's ingame ping!```", ephemeral: false }).then(() => {

                                    discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = "Failed to obtain staff bot's ingame ping!";

                                });
                            } else {

                                const staffBotPingDetails = String(pingPlayerIGNResult).match(pingPlayerIGNMessageRegex);

                                const staffBotPing = staffBotPingDetails[1];

                                const pingPlayerIGNEmbedDescription = `IGN: ${staffBotUsername.replace(RegExp(/[\_]/, 'g'), '\\_')}\n` + `Ping: ${staffBotPing}ms`;

                                pingPlayerIGNEmbed.setDescription(pingPlayerIGNEmbedDescription);
                                await discordInteractionDetails.editReply({ embeds: [pingPlayerIGNEmbed], ephemeral: false }).then(() => {

                                    discordInteractionResultDetails.interactionResult = true;

                                });
                            }
                        });

                    } else {

                        pingPlayerIGNMessageRegex = RegExp(/^MCHUB \» ([0-9A-Za-z\_\*]{3,17})'s ping is ([0-9]+) ms|MCHUB \» No one by the name of ([0-9A-Za-z\_\*]{3,17}) is online\!/, 'i');

                        pingPlayerIGN = staffBot.findMessage(10000, pingPlayerIGNMessageRegex).then(async (pingPlayerIGNResult) => {
                            if (pingPlayerIGNResult === false) {
                                await discordInteractionDetails.editReply({ content: '```' + `Failed to obtain ${playerIGN}'s ingame ping!` + '```', ephemeral: false }).then(() => {

                                    discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = `Failed to obtain ${playerIGN}'s ingame ping!`;

                                });
                            } else {

                                const playerIGNPingDetails = String(pingPlayerIGNResult).match(pingPlayerIGNMessageRegex);

                                if (playerIGNPingDetails[3] === undefined) {

                                    const playerIGNActualIGN = playerIGNPingDetails[1];

                                    const playerIGNPing = playerIGNPingDetails[2];

                                    const pingPlayerIGNEmbedDescription = `IGN: ${playerIGNActualIGN.replace(RegExp(/[\_]/, 'g'), '\\_')}\n` + `Ping: ${playerIGNPing}ms`;

                                    pingPlayerIGNEmbed.setDescription(pingPlayerIGNEmbedDescription);
                                    await discordInteractionDetails.editReply({ embeds: [pingPlayerIGNEmbed], ephemeral: false }).then(() => {

                                        discordInteractionResultDetails.interactionResult = true;

                                    });
                                } else {
                                    await discordInteractionDetails.editReply({ content: '```' + `Failed to obtain ${playerIGN}'s ingame ping as they are offline!` + '```', ephemeral: false }).then(() => {

                                        discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = `Failed to obtain ${playerIGN}'s ingame ping as they are offline!`;

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
            await discordInteractionDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordInteractionResultDetails.interactionResult = 'ERROR';

            });
        }
        return discordInteractionResultDetails;
    }
};