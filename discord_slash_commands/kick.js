const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('EDIT LATER.')
		.setDMPermission(false),
	async execute(discordInteractionResult, discordInteractionDetails) {

		discordInteractionResult.interactionFullCommand = `/${discordInteractionDetails.commandName}`;

		try {
			await discordInteractionDetails.editReply({ content: 'TEST', ephemeral: false }).then(() => {

				discordInteractionResult.interactionResult = true;

			});
		} catch {
			await discordInteractionDetails.editReply({ content: '```Error occured while executing this command!```', ephemeral: false }).then(() => {

				discordInteractionResult.interactionResult = 'ERROR';

			});
		}
		return discordInteractionResult;
	}
};