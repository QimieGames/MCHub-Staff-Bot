require('dotenv').config();

const nodeFS = require('fs');

const readline = require('readline');

const mineflayer = require('mineflayer');

const { REST } = require('@discordjs/rest');

const { Routes, ActivityType } = require('discord-api-types/v10');

const { IntentsBitField, Partials, Client, Collection, EmbedBuilder } = require('discord.js');

const importantDIR =

{
    handler: './handlers/',
    discord_slash_command: './discord_slash_commands/',
    error_log: './error_logs/',
    data: './data/',
    staffstats_data: './data/staffstats/'
};

const defaultEnvFileLayout =

    `DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN_HERE
STAFF_BOT_EMAIL=STAFF_BOT_EMAIL_HERE
STAFF_BOT_PASSWORD=STAFF_BOT_PASSWORD_HERE`;

const defaultConfigFileLayout =

{
    discord_bot: {
        guild_id: "1"
    },
    staff_bot: {
        realm_name: "HUBM/ATLANTIC/SUN/SURVIVAL/PIXELMON",
        realm_season: "1"
    },
    feature: {
        log_discord_slash_command_usage_to_console: "TRUE/FALSE",
        log_public_chat_to_console: "TRUE/FALSE",
        log_mismatched_message_to_console: "TRUE/FALSE",
        log_global_staff_chat_to_console: "TRUE/FALSE",
        log_staff_chat_to_console: "TRUE/FALSE",
        log_trial_chat_to_console: "TRUE/FALSE",
        log_global_social_spy_to_console: "TRUE/FALSE",
        log_social_spy_to_console: "TRUE/FALSE",
        log_player_report_to_console: "TRUE/FALSE",
        log_helpop_to_console: "TRUE/FALSE",
        log_auto_clicker_alert_to_console: "TRUE/FALSE",
        log_afk_checked_alert_to_console: "TRUE/FALSE",
        log_nuker_alert_to_console: "TRUE/FALSE",
        log_chat_cleared_to_console: "TRUE/FALSE",
        log_chat_toggled_to_console: "TRUE/FALSE",
        log_discord_slash_command_usage_to_discord: "TRUE/FALSE",
        log_public_chat_to_discord: "TRUE/FALSE",
        log_mismatched_message_to_discord: "TRUE/FALSE",
        log_global_staff_chat_to_discord: "TRUE/FALSE",
        log_staff_chat_to_discord: "TRUE/FALSE",
        log_trial_chat_to_discord: "TRUE/FALSE",
        log_global_social_spy_to_discord: "TRUE/FALSE",
        log_social_spy_to_discord: "TRUE/FALSE",
        log_player_report_to_discord: "TRUE/FALSE",
        log_helpop_to_discord: "TRUE/FALSE",
        log_auto_clicker_alert_to_discord: "TRUE/FALSE",
        log_afk_checked_alert_to_discord: "TRUE/FALSE",
        log_nuker_alert_to_discord: "TRUE/FALSE",
        log_chat_cleared_to_discord: "TRUE/FALSE",
        log_chat_toggled_to_discord: "TRUE/FALSE"
    },
    discord_channel: {
        discord_slash_command_usage: "1",
        public_chat: "1",
        mismatched_message: "1",
        global_staff_chat: "1",
        staff_chat: "1",
        trial_chat: "1",
        global_social_spy: "1",
        social_spy: "1",
        player_report: "1",
        helpop: "1",
        auto_clicker_alert: "1",
        afk_checked_alert: "1",
        nuker_alert: "1",
        chat_cleared: "1",
        chat_toggled: "1"
    },
    role_id: {
        bot_admin: "1",
        bot_trusted: "1",
        bot_blacklisted: "1"
    }
};

const discordBotIntents =

    [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ];

const discordBotPartials =

    [
        Partials.GuildMember,
        Partials.Channel,
        Partials.Message,
        Partials.User
    ];

const discordBot = new Client({ intents: discordBotIntents, partials: discordBotPartials });

const discordEmbedDetails =

{
    color: '#4422bf',
    thumbnail: 'https://i.imgur.com/7fkLqne.png',
    footer: {
        text: 'Custom Coded By QimieGames',
        iconURL: 'https://i.imgur.com/qTwnd6e.png'
    }
};

let configValue, guildID, clientID, handlers, staffBot, consoleChat, isStaffBotReady = false, isDiscordBotReady = false, isDiscordSlashCommandsOnCooldown = false;

discordBot.slashCommands = new Collection();

function doesImportantDIRsExists() {
    console.log('MCHSB » Loading important directories...');

    let doesImportantDIRsExistsFunctionResult;

    try {
        Object.keys(importantDIR).forEach((importantDIRName) => {
            if (doesImportantDIRsExistsFunctionResult === undefined || doesImportantDIRsExistsFunctionResult === true) {

                const importantDIRNameString = importantDIRName.replace(RegExp(/[\_]/, 'g'), ' ').toLowerCase();

                const importantDIRPath = importantDIR[importantDIRName];

                console.log(`MCHSB » Loading ${importantDIRNameString} directory.`);
                try {
                    nodeFS.accessSync(importantDIRPath, nodeFS.constants.F_OK);
                    console.log(`MCHSB » Successfully loaded ${importantDIRNameString} directory.`);

                    doesImportantDIRsExistsFunctionResult = true;

                } catch {
                    console.log(`MCHSB » Missing ${importantDIRNameString} directory! Attempting to generate a new one...`);
                    try {
                        nodeFS.mkdirSync(importantDIRPath);
                        console.log(`MCHSB » Successfully generated a new ${importantDIRNameString} directory.`);

                        doesImportantDIRsExistsFunctionResult = true;

                    } catch {
                        console.log(`MCHSB » Error occured while generating a new ${importantDIRNameString} directory!`);

                        doesImportantDIRsExistsFunctionResult = false;

                    }
                }
            }
        });
    } catch {

        doesImportantDIRsExistsFunctionResult = false;

    }
    if (doesImportantDIRsExistsFunctionResult === true) {
        console.log('MCHSB » Successfully loaded important directories.');
    } else {
        console.log('MCHSB » Error occured while loading important directories! Forcing staff bot to shutdown...');
    }
    return doesImportantDIRsExistsFunctionResult;
}

function doesImportantFilesExists() {
    console.log('MCHSB » Loading important files...');

    const defaultHandlerFilesName = ['console_chat.js', 'error_logger.js', 'staff_bot_chat.js', 'tasks_scheduler.js'];

    const defaultDiscordSlashCommandFilesName = ['blacklist.js', 'chat.js', 'dupeip.js', 'export.js', 'help.js', 'hist.js', 'ping.js', 'prunehist.js', 'restart.js', 'seen.js', 'staffmode.js', 'staffstats.js', 'sudo.js', 'unblacklist.js'];

    const defaultOtherImportantFilesName = ['package.json', 'package-lock.json', 'LICENSE'];

    let missingImportantFilesName = new Array(), extraFiles = new Array();

    try {

        const currentHandlerFilesName = nodeFS.readdirSync(importantDIR.handler).filter(currentHandlerFileName => currentHandlerFileName.endsWith('.js'));

        const currentDiscordSlashCommandFilesName = nodeFS.readdirSync(importantDIR.discord_slash_command).filter(currentDiscordSlashCommandFileName => currentDiscordSlashCommandFileName.endsWith('.js'));

        defaultHandlerFilesName.forEach((defaultHandlerFileName) => {
            if (currentHandlerFilesName.includes(defaultHandlerFileName) === false) {
                missingImportantFilesName.push(defaultHandlerFileName);
            }
        });
        defaultDiscordSlashCommandFilesName.forEach((defaultDiscordSlashCommandFileName) => {
            if (currentDiscordSlashCommandFilesName.includes(defaultDiscordSlashCommandFileName) === false) {
                missingImportantFilesName.push(defaultDiscordSlashCommandFileName);
            }
        });
        defaultOtherImportantFilesName.forEach((defaultOtherImportantFileName) => {
            try {
                nodeFS.accessSync(defaultOtherImportantFileName, nodeFS.constants.F_OK);
            } catch {
                missingImportantFilesName.push(defaultOtherImportantFileName);
            }
        });
        currentHandlerFilesName.forEach((currentHandlerFileName) => {
            if (defaultHandlerFilesName.includes(currentHandlerFileName) === false) {
                extraFiles.push(currentHandlerFileName);
            }
        });
        currentDiscordSlashCommandFilesName.forEach((currentDiscordSlashCommandFileName) => {
            if (defaultDiscordSlashCommandFilesName.includes(currentDiscordSlashCommandFileName) === false) {
                extraFiles.push(currentDiscordSlashCommandFileName);
            }
        });
        if (missingImportantFilesName.length === 0 && extraFiles.length === 0) {
            console.log('MCHSB » Successfully loaded important files.');
            return true;
        } else {
            if (missingImportantFilesName.length > 0) {

                missingImportantFilesName = missingImportantFilesName.join(', ');

                console.log(`MCHSB » Missing Important Files: ${missingImportantFilesName}`);
            }
            if (extraFiles.length > 0) {

                extraFiles = extraFiles.join(', ');

                console.log(`MCHSB » Extra Files: ${extraFiles}`);
            }
        }
    } catch { }
    console.log('MCHSB » Error occured while loading important files! Forcing staff bot to shutdown...');
    return false;
}

function doesEnvFileExists() {
    console.log('MCHSB » Checking if .env file exists...');
    try {
        nodeFS.accessSync('.env', nodeFS.constants.F_OK);
        console.log('MCHSB » .env file exists.');
        return true;
    } catch {
        console.log('MCHSB » Missing .env file!');
        return false;
    }
}

function generateEnvFile() {
    console.log('MCHSB » Generating a new .env file...');
    try {
        nodeFS.appendFileSync('.env', defaultEnvFileLayout);
        console.log('MCHSB » Successfully generated a new .env file. Please configure it first.');
    } catch {
        console.log('MCHSB » Error occured while generating a new .env file!');
    }
}

function isEnvFileValid() {
    console.log('MCHSB » Validating .env file and its configurations...');
    try {
        if (process.env.DISCORD_BOT_TOKEN === undefined || process.env.STAFF_BOT_EMAIL === undefined || process.env.STAFF_BOT_PASSWORD === undefined) {
            console.log('MCHSB » Invalid .env file!');
        } else {
            if (process.env.DISCORD_BOT_TOKEN === 'DISCORD_BOT_TOKEN_HERE' || process.env.STAFF_BOT_EMAIL === 'STAFF_BOT_EMAIL_HERE' || process.env.STAFF_BOT_PASSWORD === 'STAFF_BOT_PASSWORD_HERE') {
                console.log('MCHSB » Invalid .env file configuration(s)!');
            } else {
                console.log('MCHSB » Successfully validated .env file and its configurations.');
                return true;
            }
        }
    } catch { }
    console.log('MCHSB » Error occured while validating .env file!');
    return false;
}

function reformatEnvFile() {
    console.log('MCHSB » Reformatting .env file...');
    try {
        nodeFS.writeFileSync('.env', defaultEnvFileLayout);
        console.log('MCHSB » Successfully reformatted .env file. Please configure it first.');
    } catch {
        console.log('MCHSB » Error occured while reformatting .env file!');
    }
}

function loadEnvFile() {
    console.log('MCHSB » Loading .env file...');
    try {
        if (doesEnvFileExists() === true) {
            if (isEnvFileValid() === true) {
                console.log('MCHSB » Successfully loaded .env file.');
                return true;
            } else {
                reformatEnvFile();
            }
        } else {
            generateEnvFile();
        }
    } catch { }
    console.log('MCHSB » Error occured while loading .env file! Forcing staff bot to shutdown...');
    return false;
}

function doesConfigFileExists() {
    console.log('MCHSB » Checking if config file exists...');
    try {
        nodeFS.accessSync('config.json', nodeFS.constants.F_OK);
        console.log('MCHSB » Config file exists.');
        return true;
    } catch {
        console.log('MCHSB » Missing config file!');
        return false;
    }
}

function generateConfigFile() {
    console.log('MCHSB » Generating a new config file...');
    try {
        nodeFS.appendFileSync('config.json', JSON.stringify(defaultConfigFileLayout, null, 4));
        console.log('MCHSB » Successfully generated a new config file. Please configure it first.');
    } catch {
        console.log('MCHSB » Error occured while generating a new config file!');
    }
}

function isConfigFileValid() {
    console.log('MCHSB » Validating config file and its configurations...');
    try {

        configValue = JSON.parse(nodeFS.readFileSync('config.json'));

        try {

            let defaultConfigObjects = new Array(), currentConfigObjects = new Array(), missingConfigurations = new Array(), extraConfigurations = new Array();

            Object.keys(defaultConfigFileLayout).forEach((defaultConfigMainObject) => {
                Object.keys(defaultConfigFileLayout[defaultConfigMainObject]).forEach((defaultConfigSecondaryObject) => {
                    defaultConfigObjects.push(`${defaultConfigMainObject}.${defaultConfigSecondaryObject}`);
                });
            });
            Object.keys(configValue).forEach((currentConfigMainObject) => {
                Object.keys(configValue[currentConfigMainObject]).forEach((currentConfigSecondaryObject) => {
                    currentConfigObjects.push(`${currentConfigMainObject}.${currentConfigSecondaryObject}`);
                });
            });
            defaultConfigObjects.forEach((defaultConfigObject) => {
                if (currentConfigObjects.includes(defaultConfigObject) === false) {
                    missingConfigurations.push(defaultConfigObject);
                }
            });
            currentConfigObjects.forEach((currentConfigObject) => {
                if (defaultConfigObjects.includes(currentConfigObject) === false) {
                    extraConfigurations.push(currentConfigObject);
                }
            });
            if (missingConfigurations.length > 0) {
                console.log(`MCHSB » Missing config configuration(s): "${missingConfigurations.join('", "')}`);
            }
            if (extraConfigurations.length > 0) {
                console.log(`MCHSB » Extra config configuration(s): "${extraConfigurations.join('", "')}`);
            } else {
                return true;
            }
        } catch { }
    } catch {
        console.log('MCHSB » Invalid config file!');
    }
    console.log('MCHSB » Error occured while validating config file and its configurations!');
    return false;
}

function reformatConfigFile() {
    console.log('MCHSB » Reformatting config file...');
    try {
        nodeFS.writeFileSync('config.json', JSON.stringify(defaultConfigFileLayout, null, 4));
        console.log('MCHSB » Successfully reformatted config file. Please configure it first.');
    } catch {
        console.log('MCHSB » Error occured while reformatting config file!');
    }
}

function loadConfigFile() {
    console.log('MCHSB » Loading config file...');
    try {
        if (doesConfigFileExists() === true) {
            if (isConfigFileValid() === true) {
                console.log('MCHSB » Successfully loaded config file.');
                return true;
            } else {
                reformatConfigFile();
            }
        } else {
            generateConfigFile();
        }
    } catch { }
    console.log('MCHSB » Error occured while loading config file! Forcing staff bot to shutdown...');
    return false;
}

function registerHandlers() {
    console.log('MCHSB » Registering handlers...');
    try {

        handlers = new Map();

        const handlerFilesName = nodeFS.readdirSync(importantDIR.handler).filter(handlerFileName => handlerFileName.endsWith('.js'));

        handlerFilesName.forEach((handlerFileName) => {

            const handlerFilePath = `${importantDIR.handler}${handlerFileName}`;

            const handlerFile = require(handlerFilePath);

            handlers.set(handlerFile.data.name, handlerFile);
        });

        errorLogger = handlers.get('error_logger');

        console.log('MCHSB » Successfully registered handlers.');
        return true;
    } catch {
        console.log('MCHSB » Error occured while registering handlers! Forcing staff bot to restart...');
        return false;
    }
}

function logError(errorMessage) {

    const errorLogDateDetails = new Date();

    const errorLogFullFileName = `ERROR_LOG-${errorLogDateDetails.getDate()}_${errorLogDateDetails.getMonth() + 1}_${errorLogDateDetails.getFullYear()}-${errorLogDateDetails.getHours()}_${errorLogDateDetails.getMinutes()}_${errorLogDateDetails.getSeconds()}.txt`;

    let errorLoggerHandlerResultDetails = { result: null, fileName: errorLogFullFileName };

    try {

        const errorLoggerHandler = handlers.get('error_logger');

        errorLoggerHandler.execute(errorLoggerHandlerResultDetails, errorMessage);
    } catch {

        errorLoggerHandlerResultDetails.result = 'ERROR';

    }
    return errorLoggerHandlerResultDetails;
}

function handleError(errorMessage, errorAction) {

    let errorActionName;

    switch (errorAction) {
        default:

            errorAction = 0;

            break;
        case 0:
            break;
        case 1:
            break;
    }
    try {
        try {
            staffBot.end();
        } catch { }
        try {
            discordBot.destroy();
        } catch { }

        const errorLoggerDetails = logError(errorMessage);

        switch (errorLoggerDetails.result) {
            default:
                console.log(`MCHSB » Error occured while generating an error log! File Name: ${errorLoggerDetails.fileName}`);
                break;
            case true:
                console.log(`MCHSB » Successfully generated an error log! File Name: ${errorLoggerDetails.fileName}`);
                break;
            case false:
                console.log(`MCHSB » Failed to generate an error log! File Name: ${errorLoggerDetails.fileName}`);
                break;
        }
    } catch {
        switch (errorAction) {
            case 0:

                errorActionName = 'Force restarting staff bot...';

                break;
            case 1:

                errorActionName = 'Forcing staff bot to shutdown...';

                break;
        }
        console.log(`MCHSB » Error occured while handling error! ${errorActionName}`);
    }
    return process.exit(errorAction);
}

process.once('unhandledRejection', (processOnUnhandledRejectionMessage) => {

    isDiscordBotReady = false, isStaffBotReady = false;

    console.log('MCHSB » Unhandled Process Rejection! Restarting staff bot...');
    handleError(processOnUnhandledRejectionMessage, 0);
});

process.on('uncaughtException', (processOnUncaughtExceptionMessage) => {

    isDiscordBotReady = false, isStaffBotReady = false;

    console.log('MCHSB » Uncaught Process Exception! Restarting staff bot...');
    handleError(processOnUncaughtExceptionMessage, 0);
});

try {
    if (doesImportantDIRsExists() === true) {
        if (doesImportantFilesExists() === true) {
            if (loadEnvFile() === true) {
                if (loadConfigFile() === true) {
                    if (registerHandlers() === true) {

                        staffBot = mineflayer.createBot({ username: process.env.STAFF_BOT_EMAIL, password: process.env.STAFF_BOT_PASSWORD, auth: 'microsoft', version: '1.18.2', viewDistance: 2, keepAlive: true, checkTimeoutInterval: 30000, host: 'MCHub.COM' });

                    } else {
                        return process.exit(0);
                    }
                } else {
                    return process.exit(1);
                }
            } else {
                return process.exit(1);
            }
        } else {
            return process.exit(1);
        }
    } else {
        return process.exit(1);
    }
} catch {
    console.log('MCHSB » Error occured while starting up staff bot! Force restarting staff bot...');
    return process.exit(0);
}

staffBot.on('error', (staffBotOnErrorMessage) => {

    isStaffBotReady = false;

    console.log('MCHSB » Staff Bot Error! Restarting staff bot...');
    handleError(staffBotOnErrorMessage, 0);
});

staffBot.on('kicked', (staffBotOnKickedMessage) => {

    isStaffBotReady = false;

    console.log('MCHSB » Staff Bot Kicked! Restarting staff bot...');
    handleError(staffBotOnKickedMessage, 0);
});

staffBot.on('end', () => {

    isStaffBotReady = false;

});

staffBot.once('login', async () => {
    console.log('MCHSB » Connecting to MCHub.COM...');
});

async function verifyConfigValues() {
    console.log('MCHSB » Verifying config values...');

    let verifyConfigValuesResult = true

    try {

        let discordBotGuildsID = new Array(), discordBotGuildRolesID = new Array(), discordBotGuildChannelsID = new Array();

        if (typeof Number(configValue.discord_bot.guild_id) !== 'number') {
            return false;
        } else {
            await discordBot.guilds.fetch().then((discordBotGuildsFetchResult) => {
                discordBotGuildsFetchResult.forEach((discordBotGuildFetchResult) => {
                    discordBotGuildsID.push(discordBotGuildFetchResult.id);
                });
            });
            if (discordBotGuildsID.includes(configValue.discord_bot.guild_id) !== true) {
                return false;
            } else {

                guildID = configValue.discord_bot.guild_id;

                clientID = discordBot.user.id;

            }
        }
        if (typeof String(configValue.staff_bot.realm_name) !== 'string') {
            return false;
        } else {

            const realmNames = ['hubm', 'atlantic', 'sun', 'survival', 'pixelmon'];

            if (realmNames.includes(String(configValue.staff_bot.realm_name).toLowerCase()) !== true) {
                return false;
            }
        }
        if (typeof Number(configValue.staff_bot.realm_season) !== 'number') {
            return false;
        }
        await discordBot.guilds.cache.get(configValue.discord_bot.guild_id).channels.fetch().then((discordBotGuildChannelsFetchResult) => {
            discordBotGuildChannelsFetchResult.forEach((discordBotGuildChannelFetchResult) => {
                discordBotGuildChannelsID.push(discordBotGuildChannelFetchResult.id);
            });
        });
        await discordBot.guilds.cache.get(configValue.discord_bot.guild_id).roles.fetch().then((discordBotGuildRolesFetchResult) => {
            discordBotGuildRolesFetchResult.forEach((discordBotGuildRoleFetchResult) => {
                discordBotGuildRolesID.push(discordBotGuildRoleFetchResult.id);
            });
        });
        Object.keys(configValue).forEach((configValueMainObject) => {
            if (verifyConfigValuesResult === true) {
                Object.keys(configValue[configValueMainObject]).forEach((configValueSecondaryObject) => {
                    switch (configValueMainObject) {
                        case 'feature':
                            if (typeof Boolean(String(configValue.feature[configValueSecondaryObject]).toLowerCase()) !== 'boolean') {

                                return verifyConfigValuesResult = false;

                            }
                            break;
                        case 'discord_channel':
                            if (typeof Number(configValue.discord_channel[configValueSecondaryObject]) !== 'number') {

                                return verifyConfigValuesResult = false;

                            } else {
                                if (String(configValue.feature[`log_${configValueSecondaryObject}_to_discord`]).toLowerCase() === 'true') {
                                    if (discordBotGuildChannelsID.includes(configValue.discord_channel[configValueSecondaryObject]) !== true) {

                                        return verifyConfigValuesResult = false;

                                    }
                                }
                            }
                            break;
                        case 'role_id':
                            if (typeof Number(configValue.role_id[configValueSecondaryObject]) !== 'number') {

                                return verifyConfigValuesResult = false;

                            } else {
                                if (discordBotGuildRolesID.includes(configValue.role_id[configValueSecondaryObject]) !== true) {

                                    return verifyConfigValuesResult = false;

                                }
                            }
                            break;
                    }
                });
            }
        });
    } catch (verifyConfigValuesError) {

        verifyConfigValuesResult = verifyConfigValuesError;

    }
    return verifyConfigValuesResult;
}

async function synchronizeDiscordSlashCommands() {
    console.log('MCHSB » Synchronizing discord slash commands...');

    let synchronizeDiscordSlashCommandsResult;

    try {

        const restAPI = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

        const discordSlashCommandFiles = nodeFS.readdirSync(importantDIR.discord_slash_command, 'utf-8').filter(discordSlashCommandFilesName => discordSlashCommandFilesName.endsWith('.js'));

        let discordSlashCommands = new Array();

        discordSlashCommandFiles.forEach((discordSlashCommandFileName) => {

            const discordSlashCommandFilePath = `${importantDIR.discord_slash_command}${discordSlashCommandFileName}`;

            const discordSlashCommand = require(discordSlashCommandFilePath);

            discordSlashCommands.push(discordSlashCommand.data.toJSON());
            discordBot.slashCommands.set(discordSlashCommand.data.name, discordSlashCommand);
        });
        await restAPI.put(Routes.applicationGuildCommands(clientID, guildID), { body: discordSlashCommands }).then(() => {

            synchronizeDiscordSlashCommandsResult = true;

        }).catch((synchronizeDiscordSlashCommandsErro) => {

            synchronizeDiscordSlashCommandsResult = synchronizeDiscordSlashCommandsErro;

        });
    } catch (synchronizeDiscordSlashCommandsError) {

        synchronizeDiscordSlashCommandsResult = synchronizeDiscordSlashCommandsError;

    }
    return synchronizeDiscordSlashCommandsResult;
}

staffBot.once('spawn', async () => {

    isStaffBotReady = true;

    console.log('MCHSB » Connected to MCHub.COM.');
    console.log('MCHSB » Connecting to the Discord Bot...');
    try {
        await discordBot.login(process.env.DISCORD_BOT_TOKEN).then(async () => {
            console.log('MCHSB » Connected to the Discord Bot.');
            await verifyConfigValues().then(async (verifyConfigValuesResult) => {
                switch (verifyConfigValuesResult) {
                    default:
                        console.log('MCHSB » Error occured while verifying config values! Restarting staff bot...');
                        handleError(verifyConfigValuesResult, 0);
                        break;
                    case true:
                        console.log('MCHSB » Verified config values.');
                        await synchronizeDiscordSlashCommands().then((synchronizeDiscordSlashCommandsResult) => {
                            switch (synchronizeDiscordSlashCommandsResult) {
                                default:
                                    console.log('MCHSB » Error occured while synchronizing discord slash commands! Restarting staff bot...');
                                    handleError(synchronizeDiscordSlashCommandsResult, 0);
                                    break;
                                case true:
                                    console.log('MCHSB » Synchronized discord slash commands.');

                                    const tasksSchedulerHandler = handlers.get('tasks_scheduler');

                                    tasksSchedulerHandler.execute(configValue, discordBot, staffBot).then((tasksSchedulerHandlerResult) => {
                                        if (tasksSchedulerHandlerResult === true) {

                                            isDiscordBotReady = true;

                                            console.log('MCHSB » Successfully scheduled tasks.');
                                            console.log('MCHSB » Enabling console chat...');

                                            consoleChat = readline.createInterface({ input: process.stdin });

                                            consoleChat.on('line', (consoleChatInput) => {
                                                try {

                                                    const consoleChatHandler = handlers.get('console_chat');

                                                    consoleChatHandler.execute(consoleChatInput, discordBot, staffBot);
                                                } catch (consoleChatOnLineError) {
                                                    console.log('MCHSB » Error occured while executing console chat on line tasks! Restarting staff bot...');
                                                    handleError(consoleChatOnLineError, 0);
                                                }
                                                return;
                                            });
                                            console.log('MCHSB » Console chat enabled.');
                                        } else {
                                            console.log('MCHSB » Error occured while scheduling tasks! Restarting staff bot...');
                                            handleError(tasksSchedulerHandlerResult, 0);
                                        }
                                    }).catch((tasksSchedulerHandlerError) => {
                                        console.log('MCHSB » Error occured while scheduling tasks! Restarting staff bot...');
                                        handleError(tasksSchedulerHandlerError, 0);
                                    });
                                    break;
                                case false:
                                    console.log('MCHSB » Failed to synchronize discord slash commands! Restarting staff bot...');
                                    handleError(synchronizeDiscordSlashCommandsResult, 0);
                                    break;
                            }
                        });
                        break;
                    case false:
                        console.log('MCHSB » Invalid config value(s)! Please configure it correctly first. Shutting down staff bot...');
                        handleError('Invalid config configuration(s)', 1);
                        break;
                }
            });
        }).catch((discordBotLoginError) => {
            console.log('MCHSB » Error occured while connecting to the Discord Bot! Restarting staff bot...');
            handleError(discordBotLoginError, 0);
        });
    } catch (staffBotOnceSpawnError) {
        console.log('MCHSB » Error occured while executing staff bot once spawn tasks! Restarting staff bot...');
        handleError(staffBotOnceSpawnError, 0);
    }
    return;
});

discordBot.on('error', (discordBotOnErrorMessage) => {

    isDiscordBotReady = false;

    console.log('MCHSB » Discord Bot Error! Restarting staff bot...');
    handleError(discordBotOnErrorMessage, 0);
});

discordBot.on('invalidated', (discordBotOnInvalidatedMessage) => {

    isDiscordBotReady = false;

    console.log('MCHSB » Discord Bot Invalidated! Restarting staff bot...');
    handleError(discordBotOnInvalidatedMessage, 0);
})

discordBot.on('shardError', (discordBotOnShardErrorMessage) => {

    isDiscordBotReady = false;

    console.log('MCHSB » Discord Bot Shard Error! Restarting staff bot...');
    handleError(discordBotOnShardErrorMessage, 0);
});

discordBot.on('ready', async () => {
    try {

        const realmName = String(configValue.staff_bot.realm_name).toLowerCase();

        let discordBotActivityStatusMessage;

        switch (realmName) {
            default:

                discordBotActivityStatusMessage = 'MCHub.COM - Idle';

                break;
            case 'hubm':

                discordBotActivityStatusMessage = 'MCHub.COM - Hub';

                break;
            case 'atlantic':

                discordBotActivityStatusMessage = 'MCHub.COM - Atlantic Prisons';

                break;
            case 'sun':

                discordBotActivityStatusMessage = 'MCHub.COM - Sun Skyblock';

                break;
            case 'survival':

                discordBotActivityStatusMessage = 'MCHub.COM - Survival';

                break;
            case 'pixelmon':

                discordBotActivityStatusMessage = 'MCHub.COM - Pixelmon';

                break;
        }
        discordBot.user.setActivity(discordBotActivityStatusMessage, { type: ActivityType.Playing, name: discordBotActivityStatusMessage });
    } catch (discordBotOnReadyError) {
        console.log('MCHSB » Error occured while executing discord bot on ready tasks! Restarting staff bot...');
        handleError(discordBotOnReadyError, 0);
    }
    return;
});

async function logDiscordSlashCommandUsage(discordSlashCommandDetails, discordSlashCommandHandlerResultDetails) {
    try {

        const discordUserDisplayName = discordSlashCommandDetails.member.displayName;

        const discordUserID = discordSlashCommandDetails.member.id;

        const discordSlashCommandChannelName = discordSlashCommandDetails.channel.name;

        const discordSlashCommandChannelID = discordSlashCommandDetails.channel.id;

        let discordSlashCommandUsageLogTemplate;

        switch (discordSlashCommandHandlerResultDetails.result) {
            default:

                discordSlashCommandUsageLogTemplate = `User's Discord Display Name: ${discordUserDisplayName}\n` + `User's Discord ID: ${discordUserID}\n` + `Full Command: ${discordSlashCommandHandlerResultDetails.fullCommand}\n` + `Command Result: UNKNOWN\n` + 'Reason: Unknown error occured!\n' + `Channel's Name: #${discordSlashCommandChannelName}\n` + `Channel's ID: ${discordSlashCommandChannelID}`;

                break;
            case 'ERROR':

                discordSlashCommandUsageLogTemplate = `User's Discord Display Name: ${discordUserDisplayName}\n` + `User's Discord ID: ${discordUserID}\n` + `Full Command: ${discordSlashCommandHandlerResultDetails.fullCommand}\n` + `Command Result: ERROR\n` + 'Reason: Internal error occured!\n' + `Channel's Name: #${discordSlashCommandChannelName}\n` + `Channel's ID: ${discordSlashCommandChannelID}`;

                break;
            case false:

                discordSlashCommandUsageLogTemplate = `User's Discord Display Name: ${discordUserDisplayName}\n` + `User's Discord ID: ${discordUserID}\n` + `Full Command: ${discordSlashCommandHandlerResultDetails.fullCommand}\n` + `Command Result: FAILED\n` + `Reason: ${discordSlashCommandHandlerResultDetails.failedReason}\n` + `Channel's Name: #${discordSlashCommandChannelName}\n` + `Channel's ID: ${discordSlashCommandChannelID}`;

                break;
            case true:

                discordSlashCommandUsageLogTemplate = `User's Discord Display Name: ${discordUserDisplayName}\n` + `User's Discord ID: ${discordUserID}\n` + `Full Command: ${discordSlashCommandHandlerResultDetails.fullCommand}\n` + `Command Result: SUCCESS\n` + `Channel's Name: #${discordSlashCommandChannelName}\n` + `Channel's ID: ${discordSlashCommandChannelID}`;

                break;
        }
        if (Boolean(String(configValue.feature.log_discord_slash_command_usage_to_console).toLowerCase()) === true) {
            console.log('================================\n' + discordSlashCommandUsageLogTemplate + '\n================================');
        }
        if (Boolean(String(configValue.feature.log_discord_slash_command_usage_to_discord).toLowerCase()) === true) {

            const discordSlashCommandUsageLogChannelID = configValue.discord_channel.discord_slash_command_usage;

            const discordSlashCommandUsageLogChannelName = discordBot.guilds.cache.get(guildID).channels.cache.get(discordSlashCommandUsageLogChannelID).name;

            const discordSlashCommandUsageLogEmbedThumbnail = discordSlashCommandDetails.member.displayAvatarURL();

            const discordMarkdowns = ['*', '_', '~', '`', '>', '|'];

            discordMarkdowns.forEach((discordMarkdown) => {

                discordSlashCommandUsageLogTemplate = discordSlashCommandUsageLogTemplate.replace(RegExp(`[\\${discordMarkdown}]`, 'g'), `\\${discordMarkdown}`);

            });

            const discordSlashCommandUsageLogEmbedDescription = discordSlashCommandUsageLogTemplate;

            const discordSlashCommandUsageLogEmbed = new EmbedBuilder()
                .setTitle('DISCORD SLASH COMMAND USAGE')
                .setColor(discordEmbedDetails.color)
                .setThumbnail(discordSlashCommandUsageLogEmbedThumbnail)
                .setDescription(discordSlashCommandUsageLogEmbedDescription)
                .setFooter(discordEmbedDetails.footer)
                .setTimestamp();

            if (discordBot.guilds.cache.get(guildID).channels.cache.get(discordSlashCommandUsageLogChannelID) !== undefined) {
                if (discordBot.guilds.cache.get(guildID).channels.cache.get(discordSlashCommandUsageLogChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                    if (discordBot.guilds.cache.get(guildID).channels.cache.get(discordSlashCommandUsageLogChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                        await discordBot.guilds.cache.get(guildID).channels.cache.get(discordSlashCommandUsageLogChannelID).send({ embeds: [discordSlashCommandUsageLogEmbed] });
                    } else {
                        console.log(`MCHSB » Error occured while logging discord slash command usage log in #${discordSlashCommandUsageLogChannelName}!`);
                    }
                } else {
                    console.log(`MCHSB » Error occured while viewing #${discordSlashCommandUsageLogChannelName}!`);
                }
            } else {
                console.log('MCHSB » Error occured while finding discord slash command usage log channel!');
            }
        }
    } catch (logDiscordSlashCommandUsageError) {
        console.log('MCHSB » Error occured while executing logDiscordSlashCommandUsage execute tasks! Restarting staff bot...');
        handleError(logDiscordSlashCommandUsageError, 0);
    }
    return;
}

function isMinecraftUsernameValid(minecraftUsername) {
    try {

        let minecraftUsernameRegex;

        switch (String(minecraftUsername).startsWith('*')) {
            default:
                console.log('MCHSB » Error occured while determining is a java or bedrock player! Restarting staff bot...');
                return 'ERROR';
                break;
            case false:

                minecraftUsernameRegex = RegExp(/^[0-9A-Za-z\_]{3,16}$/);

                break;
            case true:

                minecraftUsernameRegex = RegExp(/^\*[0-9A-Za-z\_]{3,16}$/);

                break;
        }
        switch (minecraftUsernameRegex.test(minecraftUsername)) {
            default:
                console.log('MCHSB » Error occured while validating minecraft username! Restarting staff bot...');
                return 'ERROR';
                break;
            case false:
                return false;
                break;
            case true:
                return true;
                break;
        }
    } catch {
        return 'ERROR';
    }
}

discordBot.on('interactionCreate', async (discordInteractionDetails) => {

    let discordSlashCommandResultDetails = { result: null, fullCommand: null, failedReason: null };

    try {
        if (discordInteractionDetails.isChatInputCommand()) {
            await discordInteractionDetails.deferReply({ ephemeral: false }).then(async () => {
                if (isStaffBotReady === true) {
                    if (isDiscordBotReady === true) {

                        const staffBotBlacklistedUserRoleID = [configValue.role_id.bot_blacklisted];

                        if (discordInteractionDetails.member.roles.cache.some(discordUserRoles => staffBotBlacklistedUserRoleID.includes(discordUserRoles.id)) !== true) {
                            if (isDiscordSlashCommandsOnCooldown === false) {

                                isDiscordSlashCommandsOnCooldown = true;

                                const discordSlashCommandHandler = discordBot.slashCommands.get(discordInteractionDetails.commandName);

                                switch (discordInteractionDetails.commandName) {
                                    default:
                                        await discordInteractionDetails.editReply({ content: '```This command has not been implemented yet!```', ephemeral: false }).then(() => {

                                            discordSlashCommandResultDetails.result = false, discordSlashCommandResultDetails.fullCommand = `/${discordInteractionDetails.commandName}`, discordSlashCommandResultDetails.failedReason = 'This command has not been implemented yet!';

                                        }).then(async () => {
                                            logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandResultDetails);
                                        });
                                        break;
                                    case 'blacklist':
                                        await discordSlashCommandHandler.execute(discordSlashCommandResultDetails, discordInteractionDetails, configValue, guildID, clientID, discordBot).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'chat':
                                        await discordSlashCommandHandler.execute(discordSlashCommandResultDetails, discordInteractionDetails, configValue, staffBot).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'dupeip':
                                        await discordSlashCommandHandler.execute(discordEmbedDetails, discordSlashCommandResultDetails, discordInteractionDetails, configValue, staffBot, isMinecraftUsernameValid).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'export':
                                        await discordSlashCommandHandler.execute(discordSlashCommandResultDetails, discordInteractionDetails, configValue, staffBot, isMinecraftUsernameValid).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'help':
                                        await discordSlashCommandHandler.execute(importantDIR.discord_slash_command, discordEmbedDetails, discordSlashCommandResultDetails, discordInteractionDetails).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'hist':
                                        await discordSlashCommandHandler.execute(discordSlashCommandResultDetails, discordInteractionDetails, configValue, staffBot, isMinecraftUsernameValid).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'ping':
                                        await discordSlashCommandHandler.execute(discordEmbedDetails, discordSlashCommandResultDetails, discordInteractionDetails, staffBot, isMinecraftUsernameValid).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'prunehist':
                                        await discordSlashCommandHandler.execute(discordSlashCommandResultDetails, discordInteractionDetails, configValue, staffBot, isMinecraftUsernameValid).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'restart':
                                        await discordSlashCommandHandler.execute(discordSlashCommandResultDetails, discordInteractionDetails, configValue, discordBot, staffBot, logDiscordSlashCommandUsage);
                                        break;
                                    case 'seen':
                                        await discordSlashCommandHandler.execute(discordEmbedDetails, discordSlashCommandResultDetails, discordInteractionDetails, staffBot, isMinecraftUsernameValid).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'staffmode':
                                        await discordSlashCommandHandler.execute(discordEmbedDetails, discordSlashCommandResultDetails, discordInteractionDetails, configValue, staffBot).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'staffstats':
                                        await discordSlashCommandHandler.execute(discordEmbedDetails, discordSlashCommandResultDetails, discordInteractionDetails, configValue, staffBot, isMinecraftUsernameValid).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'sudo':
                                        await discordSlashCommandHandler.execute(discordSlashCommandResultDetails, discordInteractionDetails, configValue, staffBot).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                    case 'unblacklist':
                                        await discordSlashCommandHandler.execute(discordSlashCommandResultDetails, discordInteractionDetails, configValue, guildID, clientID, discordBot).then(async (discordSlashCommandHandlerResultDetails) => {
                                            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandHandlerResultDetails);
                                        });
                                        break;
                                }

                                isDiscordSlashCommandsOnCooldown = false;

                            } else {
                                await discordInteractionDetails.editReply({ content: '```Discord slash commands is on cooldown!```', ephemeral: false }).then(() => {

                                    discordSlashCommandResultDetails.result = false, discordSlashCommandResultDetails.fullCommand = `/${discordInteractionDetails.commandName}`, discordSlashCommandResultDetails.failedReason = 'Discord slash commands is on cooldown!';

                                }).then(async () => {
                                    await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandResultDetails);
                                });
                            }
                        } else {
                            await discordInteractionDetails.editReply({ content: '```You are blacklisted from using this staff bot!```', ephemeral: false }).then(() => {

                                discordSlashCommandResultDetails.result = false, discordSlashCommandResultDetails.fullCommand = `/${discordInteractionDetails.commandName}`, discordSlashCommandResultDetails.failedReason = 'User is blacklisted from using this staff bot!';

                            }).then(async () => {
                                await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandResultDetails);
                            });
                        }
                    } else {
                        await discordInteractionDetails.editReply({ content: '```Discord bot is currently not ready!```', ephemeral: false }).then(() => {

                            discordSlashCommandResultDetails.result = false, discordSlashCommandResultDetails.fullCommand = `/${discordInteractionDetails.commandName}`, discordSlashCommandResultDetails.failedReason = 'Discord bot is currently not ready!';

                        }).then(async () => {
                            logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandResultDetails);
                        });
                    }
                } else {
                    await discordInteractionDetails.editReply({ content: '```Staff bot is currently not ready!```', ephemeral: false }).then(() => {

                        discordSlashCommandResultDetails.result = false, discordSlashCommandResultDetails.fullCommand = `/${discordInteractionDetails.commandName}`, discordSlashCommandResultDetails.failedReason = 'Staff bot is currently not ready!';

                    }).then(async () => {
                        logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandResultDetails);
                    });
                }
            });
        }
    } catch (discordBotOnInteractionCreateError) {
        console.log('MCHSB » Error occured while executing discord bot on interaction create tasks! Restarting staff bot...');
        await discordInteractionDetails.editReply({ content: '```Error occured while executing discord bot on interaction create tasks!```', ephemeral: false }).then(() => {

            discordSlashCommandResultDetails.result = 'ERROR', discordSlashCommandResultDetails.fullCommand = `/${discordInteractionDetails.commandName}`;

        }).then(async () => {
            await logDiscordSlashCommandUsage(discordInteractionDetails, discordSlashCommandResultDetails);
        }).catch(() => { });
        handleError(discordBotOnInteractionCreateError, 0);
    }
    return;
});

staffBot.on('message', async (staffBotChatMessage, staffBotChatMessagePosition) => {
    try {
        if (isDiscordBotReady === true && staffBotChatMessagePosition !== 'game_info') {

            const staffBotChatHandler = handlers.get('staff_bot_chat');

            await staffBotChatHandler.execute(discordEmbedDetails, configValue, guildID, clientID, discordBot, staffBotChatMessage);
        }
    } catch (staffBotOnMessageError) {
        console.log('MCHSB » Error occured while executing staff bot on message tasks! Restarting staff bot...');
        handleError(staffBotOnMessageError, 0);
    }
    return;
});

staffBot.on('resourcePack', async (resourcePackURL, resourcePackHash) => {
    console.log('MCHSB » Incoming resource pack.\n' + `MCHSB » Resource Pack's URL: ${resourcePackURL}\n` + `MCHSB » Resource Pack's Hash: ${resourcePackHash}\n` + 'MCHSB » Rejecting incoming resource pack...');
    try {
        staffBot.denyResourcePack();
        console.log('MCHSB » Rejected incoming resource pack.');
    } catch (staffBotOnResourcePackError) {
        console.log('MCHSB » Error occured while executing staff bot on resource pack tasks! Restarting staff bot...');
        handleError(staffBotOnResourcePackError, 0);
    }
    return;
});