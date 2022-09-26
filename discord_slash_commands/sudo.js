const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sudo')
        .setDescription('Run A Command Ingame. [Admin User Command]')
        .setDMPermission(false)
        .addStringOption(commandToRun =>
            commandToRun.setName('command-to-run')
                .setDescription('Command To Run.')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(192)),
    async execute(discordInteractionResultDetails, discordInteractionDetails, configValue, staffBot) {

        const commandToRun = String(discordInteractionDetails.options.getString('command-to-run'));

        discordInteractionResultDetails.interactionFullCommand = `/${discordInteractionDetails.commandName} command-to-run:${commandToRun}`;

        try {

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin];

            if (discordInteractionDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordInteractionDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordInteractionResultDetails.interactionResult = false, discordInteractionResultDetails.interactionFailedReason = 'User has insufficient permission!';

                });
            } else {
                staffBot.chat(`/${commandToRun}`);
                await discordInteractionDetails.editReply({ content: '```' + `Successfully ran "/${commandToRun}" ingame.` + '```', ephemeral: false }).then(() => {

                    discordInteractionResultDetails.interactionResult = true;

                });
            }
        } catch {
            await discordInteractionDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

                discordInteractionResultDetails.interactionResult = 'ERROR';

            });
        }
        return discordInteractionResultDetails;
    }
};