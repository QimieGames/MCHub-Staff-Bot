const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seen')
        .setDescription("Shows A Player's Last Seen.")
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

                    const regexExcludedCharacters = ['*', '_'];

                    let playerIGNForRegex = playerIGN;

                    regexExcludedCharacters.forEach((regexExcludedCharacter) => {

                        playerIGNForRegex = playerIGNForRegex.replace(RegExp(`[\\${regexExcludedCharacter}]`, 'g'), `\\${regexExcludedCharacter}`);

                    });

                    const seenPlayerIGNMessageStringRegex = `^MCHUB \\» ${playerIGNForRegex} was last seen ([0-9A-Za-z\\, ]+)\\.|^MCHUB \\» ${playerIGNForRegex} has never joined the server\\!`;

                    const seenPlayerIGNMessageRegex = RegExp(seenPlayerIGNMessageStringRegex, 'i');

                    const seenPlayerIGN = staffBot.findMessage(8000, seenPlayerIGNMessageRegex).then(async (seenPlayerIGNResult) => {
                        if (seenPlayerIGNResult === false) {
                            await discordSlashCommandDetails.editReply({ content: '```' + `Failed to obtain ${playerIGN}'s last seen!` + '```' }).then(() => {

                                discordSlashCommandHandlerResultDetails.result = 'ERROR';

                            });
                        } else {

                            const playerIGNLastSeenDetails = String(seenPlayerIGNResult).match(seenPlayerIGNMessageRegex);

                            const seenPlayerIGNEmbed = new EmbedBuilder()
                                .setTitle('LAST SEEN')
                                .setColor(discordEmbedDetails.color)
                                .setThumbnail(discordEmbedDetails.thumbnail)
                                .setFooter(discordEmbedDetails.footer)
                                .setTimestamp();

                            if (playerIGNLastSeenDetails[1] === undefined) {

                                const seenPlayerIGNEmbedDescription = `IGN: ${playerIGNForRegex}\n` + `Last Seen: NEVER JOIN THE SERVER BEFORE`;

                                seenPlayerIGNEmbed.setDescription(seenPlayerIGNEmbedDescription);

                                await discordSlashCommandDetails.editReply({ embeds: [seenPlayerIGNEmbed], ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = true;

                                });
                            } else {

                                const playerIGNLastSeen = playerIGNLastSeenDetails[1].toUpperCase();

                                const seenPlayerIGNEmbedDescription = `IGN: ${playerIGNForRegex}\n` + `Last Seen: ${playerIGNLastSeen}`;

                                seenPlayerIGNEmbed.setDescription(seenPlayerIGNEmbedDescription);

                                await discordSlashCommandDetails.editReply({ embeds: [seenPlayerIGNEmbed], ephemeral: false }).then(() => {

                                    discordSlashCommandHandlerResultDetails.result = true;

                                });
                            }
                        }
                    });

                    staffBot.chat(`/seen ${playerIGN}`);
                    await seenPlayerIGN;
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