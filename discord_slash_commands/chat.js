const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Send A Message Ingame. [Admin User Command]')
        .setDMPermission(false)
        .addSubcommand(global_staff_chat =>
            global_staff_chat.setName('gsc')
                .setDescription('Send A Message In The Global Staff Chat. [Admin User Command]')
                .addStringOption(messageToSend =>
                    messageToSend.setName('message-to-send')
                        .setDescription('Message To Send In The Global Staff Chat.')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(192)))
        .addSubcommand(staff_chat =>
            staff_chat.setName('sc')
                .setDescription('Send A Message In The Staff Chat. [Admin User Command]')
                .addStringOption(messageToSend =>
                    messageToSend.setName('message-to-send')
                        .setDescription('Message To Send In The Staff Chat.')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(192)))
        .addSubcommand(trial_chat =>
            trial_chat.setName('tc')
                .setDescription('Send A Message In The Trial Chat. [Admin User Command]')
                .addStringOption(messageToSend =>
                    messageToSend.setName('message-to-send')
                        .setDescription('Message To Send In The Trial Chat.')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(192)))
        .addSubcommand(public_chat =>
            public_chat.setName('public-chat')
                .setDescription('Send A Message In The Public Chat. [Admin User Command]')
                .addStringOption(messageToSend =>
                    messageToSend.setName('message-to-send')
                        .setDescription('Message To Send In The Public Chat.')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(192))),
    async execute(discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, staffBot) {
        try {

            const chatType = String(discordSlashCommandDetails.options.getSubcommand());

            const messageToSend = String(discordSlashCommandDetails.options.getString('message-to-send'));

            discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName} ${chatType} message-to-send:${messageToSend}`;

            const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin];

            if (discordSlashCommandDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
                await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

                    discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User has insufficient permission!';

                });
            } else {
                if (messageToSend.startsWith('/') === true && chatType === 'public-chat') {
                    await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run ingame command through this command!```', ephemeral: false }).then(() => {

                        discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User tried to run ingame command through this command!';

                    });
                } else {

                    const sendMessageToSend = staffBot.findMessage(8000, new RegExp(staffBot.username)).then(async (sendMessageToSendResult) => {
                        if (sendMessageToSendResult === false) {
                            await discordSlashCommandDetails.editReply({ content: '```Error occured while sending chat message!```', ephemeral: false }).then(() => {

                                discordSlashCommandHandlerResultDetails.result = 'ERROR';

                            });
                        } else {
                            await discordSlashCommandDetails.editReply({ content: '```' + sendMessageToSendResult + '```', ephemeral: false }).then(() => {

                                discordSlashCommandHandlerResultDetails.result = true;

                            });
                        }
                    });

                    switch (chatType) {
                        default:
                            staffBot.chat(`/${chatType} ${messageToSend}`);
                            break;
                        case 'public-chat':
                            staffBot.chat(messageToSend);
                            break;
                    }
                    await sendMessageToSend;
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