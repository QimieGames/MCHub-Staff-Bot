const nodeFS = require('fs');

module.exports = {
    data: {
        name: 'error'
    },
    execute(errorInfo, discordBot, staffBot) {

        const errorOccuredDate = new Date();

        const errorLogDIR = '././error_logs/';

        const errorLogFileFullName = `ERROR_LOG-${errorOccuredDate.getDate()}_${errorOccuredDate.getMonth() + 1}_${errorOccuredDate.getFullYear()}-${errorOccuredDate.getHours()}_${errorOccuredDate.getMinutes()}_${errorOccuredDate.getSeconds()}.txt`;

        console.log(`MCHSB » Generating error log...`);
        try {
            nodeFS.accessSync(errorLogDIR);
        } catch {
            nodeFS.mkdirSync(errorLogDIR);
        }
        nodeFS.appendFileSync(`${errorLogDIR}${errorLogFileFullName}`, String(errorInfo), 'utf-8');
        console.log(`MCHSB » Generated error log. File Name: ${errorLogFileFullName}.txt`);
        console.log('MCHSB » Disconnecting from the Discord Bot...');
        discordBot.destroy();
        console.log('MCHSB » Disconnected from the Discord Bot.');
        console.log('MCHSB » Disconnecting from MCHub.COM...');
        staffBot.end();
        console.log('MCHSB » Disconnected from MCHub.COM.');
        return;
    }
};