const nodeFS = require('fs');

module.exports = {
    data: {
        name: 'error_logger'
    },
    execute(errorLoggerHandlerResultDetails, errorMessage) {
        console.log(`MCHSB » Generating error log...`);

        const errorLogDIR = '././error_logs/';

        try {
            nodeFS.accessSync(errorLogDIR);
        } catch {
            nodeFS.mkdirSync(errorLogDIR);
        }
        try {
            nodeFS.appendFileSync(`${errorLogDIR}${errorLoggerHandlerResultDetails.fileName}`, String(errorMessage));
            try {
                nodeFS.accessSync(`${errorLogDIR}${errorLoggerHandlerResultDetails.fileName}`, nodeFS.constants.F_OK);

                return errorLoggerHandlerResultDetails.result = true;

            } catch {

                return errorLoggerHandlerResultDetails.result = false;

            }
        } catch {

            return errorLoggerHandlerResultDetails.result = false;

        }
    }
};