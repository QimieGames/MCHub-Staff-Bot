const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blacklist')
		.setDescription('Blacklist A Discord User From Using This Staff Bot. [Admin User Command]')
		.setDMPermission(false)
		.addStringOption(discordUserID =>
			discordUserID.setName('discord-user-id')
				.setDescription('Discord User ID.')
				.setRequired(true)
				.setMinLength(1)),
	async execute(discordSlashCommandHandlerResultDetails, discordSlashCommandDetails, configValue, guildID, clientID, discordBot) {
		try {

			const discordUserID = String(discordSlashCommandDetails.options.getString('discord-user-id'));

			discordSlashCommandHandlerResultDetails.fullCommand = `/${discordSlashCommandDetails.commandName} discord-user-id:${discordUserID}`;

			const discordSlashCommandWhitelistedRolesID = [configValue.role_id.bot_admin];

			if (discordSlashCommandDetails.member.roles.cache.some(discordUserRoles => discordSlashCommandWhitelistedRolesID.includes(discordUserRoles.id)) !== true) {
				await discordSlashCommandDetails.editReply({ content: '```You are not allowed to run this command!```', ephemeral: false }).then(() => {

					discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'User has insufficient permission!';

				});
			} else {

				const discordUserIDRegex = RegExp(/^[0-9]+$/);

				switch (discordUserIDRegex.test(discordUserID)) {
					default:
						await discordSlashCommandDetails.editReply({ content: '```Error occured while verifying Discord User ID provided!```', ephemeral: false }).then(() => {

							discordSlashCommandHandlerResultDetails.result = 'ERROR';

						});
						break;
					case false:
						await discordSlashCommandDetails.editReply({ content: '```' + `${discordUserID} is not a Discord User ID!` + '```', ephemeral: false }).then(() => {

							discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = `${discordUserID} is not a Discord User ID!`;

						});
						break;
					case true:

						const discordUser = await discordBot.guilds.cache.get(guildID).members.fetch(discordUserID).catch(() => {
							return undefined;
						});

						if (discordUser === undefined) {
							await discordSlashCommandDetails.editReply({ content: '```' + `${discordUserID} is not a valid Discord User ID!` + '```', ephemeral: false }).then(() => {

								discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = `${discordUserID} is not a valid Discord User ID!`;

							});
						} else {

							const staffBotBlacklistedUserRoleID = configValue.role_id.bot_blacklisted;

							if (discordUser.roles.cache.some(discordUserRoles => discordUserRoles.id === staffBotBlacklistedUserRoleID) === true) {
								await discordSlashCommandDetails.editReply({ content: '```The user is already blacklisted from using this staff bot!```', ephemeral: false }).then(() => {

									discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'The user is already blacklisted from using this staff bot!';

								});
							} else {
								if (discordBot.guilds.cache.get(guildID).members.cache.get(clientID).permissions.has('ManageRoles', true) === true) {
									await discordUser.roles.add(staffBotBlacklistedUserRoleID).then(async () => {
										await discordSlashCommandDetails.editReply({ content: '```Successfully blacklisted the user from using this staff bot.```', ephemeral: false }).then(() => {

											discordSlashCommandHandlerResultDetails.result = true;

										});
									}).catch(async () => {
										await discordSlashCommandDetails.editReply({ content: '```Error occured while blacklisting the user from using this staff bot!```', ephemeral: false }).then(() => {

											discordSlashCommandHandlerResultDetails.result = 'ERROR';

										});
									});
								} else {
									await discordSlashCommandDetails.editReply({ content: '```Staff bot has insufficient permission to manage roles!```', ephemeral: false }).then(() => {

										discordSlashCommandHandlerResultDetails.result = false, discordSlashCommandHandlerResultDetails.failedReason = 'Staff bot has insufficient permission to manage roles!';

									});
								}
							}
						}
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