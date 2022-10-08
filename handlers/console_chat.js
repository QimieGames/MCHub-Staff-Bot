module.exports = {
    data: {
        name: 'console_chat'
    },
    execute(consoleChatInput, discordBot, staffBot) {
        if (consoleChatInput !== '') {

            const emptyConsoleChatInputRegex = new RegExp(/^[ ]+$/);

            if (emptyConsoleChatInputRegex.test(consoleChatInput) !== true) {

                const internalConsoleChatCommandRegex = new RegExp(/^\\([A-Za-z]+)$/);

                if (internalConsoleChatCommandRegex.test(consoleChatInput) === true) {

                    const internalConsoleChatCommandDetails = String(consoleChatInput).match(internalConsoleChatCommandRegex);

                    const internalConsoleChatCommand = internalConsoleChatCommandDetails[1];

                    switch (internalConsoleChatCommand) {
                        default:
                            console.log('MCHSB » Invalid internal command! Do \\help for list of internal commands.');
                            break;
                        case 'help':
                            console.log('================================\n' + '\\help -> Shows This Menu.\n' + '\\restart -> Restart Staff Bot.\n' + '\\quit -> Shutdown Staff Bot.\n' + '================================');
                            break;
                        case 'restart':
                            console.log('MCHSB » Restarting staff bot...');
                            try {
                                console.log('MCHSB » Disconnecting from MCHub.COM...');
                                staffBot.end();
                                console.log('MCHSB » Disconnected from MCHub.COM.');
                                console.log('MCHSB » Disconnecting from the Discord Bot...');
                                discordBot.destroy();
                                console.log('MCHSB » Disconnected from the Discord Bot.');
                            } catch {
                                console.log('MCHSB » Error occured while restarting staff bot! Force restarting staff bot...');
                            }
                            process.exit(0);
                            break;
                        case 'quit':
                            console.log('MCHSB » Shutting down staff bot...');
                            try {
                                console.log('MCHSB » Disconnecting from MCHub.COM...');
                                staffBot.end();
                                console.log('MCHSB » Disconnected from MCHub.COM.');
                                console.log('MCHSB » Disconnecting from the Discord Bot...');
                                discordBot.destroy();
                                console.log('MCHSB » Disconnected from the Discord Bot.');
                            } catch {
                                console.log('MCHSB » Error occured while shutting down staff bot! Forcing staff bot to shutdown...');
                            }
                            process.exit(1);
                            break;
                    }
                } else {
                    staffBot.chat(consoleChatInput);
                }
            } else {
                console.log('MCHSB » Console chat input cannot be empty!');
            }
        } else {
            console.log('MCHSB » Console chat input cannot be empty!');
        }
        return;
    }
};