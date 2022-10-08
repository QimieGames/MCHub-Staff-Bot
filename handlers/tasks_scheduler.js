module.exports = {
    data: {
        name: 'tasks_scheduler'
    },
    async execute(configValue, discordBot, staffBot) {
        console.log('MCHSB » Scheduling tasks...');

        let tasksSchedulerResult = false;

        try {

            const realmName = String(configValue.staff_bot.realm_name).toLowerCase();

            const realmSeason = configValue.staff_bot.realm_season;

            async function scheduleAutoJoinRealm() {
                setTimeout(async () => {
                    try {
                        staffBot.chat(`/server ${realmName}${realmSeason}`);
                        console.log(`MCHSB » Ran /server ${realmName}${realmSeason}`);
                    } catch {
                        console.log(`MCHSB » Failed to run /server ${realmName}${realmSeason}`);
                    }
                }, 5000);
            }

            async function scheduleAutoReconnectToRealm() {
                setInterval(async () => {
                    try {
                        staffBot.chat(`/server ${realmName}${realmSeason}`);
                        console.log(`MCHSB » Ran /server ${realmName}${realmSeason}`);
                    } catch {
                        console.log(`MCHSB » Failed to run /server ${realmName}${realmSeason}`);
                    }
                }, 300000);
            }

            async function scheduleScheduledRestart() {
                setTimeout(async () => {
                    try {
                        console.log('MCHSB » Staff bot is being restarted due to scheduled restart...');
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
                }, 86400000);
            }

            await scheduleAutoJoinRealm().then(async () => {
                await scheduleAutoReconnectToRealm().then(async () => {
                    await scheduleScheduledRestart().then(() => {

                        tasksSchedulerResult = true;

                    });
                });
            });
        } catch (tasksSchedulerError) {

            tasksSchedulerResult = tasksSchedulerError;

        }
        return tasksSchedulerResult;
    }
};