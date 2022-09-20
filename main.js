require('dotenv').config();

const nodeFS = require('fs');

const DiscordJS = require('discord.js');

const mineflayer = require('mineflayer');

const { REST } = require('@discordjs/rest');

const { Routes } = require('discord-api-types/v10');

const readline = require('readline');

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

const importantDIR =

{
    handler: './handlers/',
    discord_slash_command: './discord_slash_commands/',
    error_log: './error_logs/',
    data: './data/',
    staffstats_data: './data/staffstats/'
};

const discordBotIntents =

    [
        DiscordJS.IntentsBitField.Flags.Guilds,
        DiscordJS.IntentsBitField.Flags.GuildMembers,
        DiscordJS.IntentsBitField.Flags.GuildMessages,
        DiscordJS.IntentsBitField.Flags.MessageContent
    ];

const discordBotPartials =

    [
        DiscordJS.Partials.GuildMember,
        DiscordJS.Partials.Channel,
        DiscordJS.Partials.Message,
        DiscordJS.Partials.User
    ];

const discordBot = new DiscordJS.Client({ intents: discordBotIntents, partials: discordBotPartials });

let isDiscordSlashCommandsOnCooldown = false;

let configValue, guildID, clientID, handlers, errorHandler, staffBot, consoleChat;

discordBot.slashCommands = new DiscordJS.Collection();

function doesImportantDIRsExists() {
    console.log('MCHSB » Loading important directories...');

    let doesImportantDIRsExistsFunctionResult = true;

    try {
        Object.keys(importantDIR).forEach((importantDIRType) => {

            const importantDIRTypeName = importantDIRType.replace(RegExp(/[ ]+/, 'g'), ' ').toLowerCase();

            console.log(`MCHSB » Loading ${importantDIRTypeName} directory...`);
            try {
                nodeFS.accessSync(importantDIR[importantDIRType], nodeFS.constants.F_OK);
                console.log(`MCHSB » Successfully loaded ${importantDIRTypeName} directory.`);
            } catch {
                console.log(`MCHSB » Error occured while accessing ${importantDIRTypeName} directory! Generating a new ${importantDIRTypeName} directory...`);
                try {
                    nodeFS.mkdirSync(importantDIR[importantDIRType]);
                    console.log(`MCHSB » Generated a new ${importantDIRTypeName} directory. Attempting to loading it...`);
                    try {
                        nodeFS.accessSync(importantDIR[importantDIRType], nodeFS.constants.F_OK);
                        console.log(`MCHSB » Successfully loaded ${importantDIRTypeName} directory.`);
                    } catch {
                        console.log(`MCHSB » Error occured while loading ${importantDIRTypeName} directory!`);

                        doesImportantDIRsExistsFunctionResult = false;

                    }
                } catch {
                    console.log(`MCHSB » Error occured while generating a new ${importantDIRTypeName} directory!`);

                    doesImportantDIRsExistsFunctionResult = false;

                }
            }
        });
    } catch (doesImportantDIRsExistsFunctionError) {

        doesImportantDIRsExistsFunctionResult = false;

    }
    return doesImportantDIRsExistsFunctionResult;
}

function doesImportantFilesExists() {
    console.log('MCHSB » Loading important files...');

    const defaultHandlerFiles = ['console_chat.js', 'error.js', 'staff_bot_chat.js', 'tasks_scheduler.js'];

    const defaultDiscordSlashCommandFiles = ['ban.js', 'blacklist.js', 'chat.js', 'dupeip.js', 'export.js', 'help.js', 'hist.js', 'kick.js', 'mute.js', 'prunehist.js', 'restart.js', 'seen.js', 'staffmode.js', 'staffstats.js', 'sudo.js', 'unban.js', 'unblacklist.js', 'unmute.js', 'unwarn.js', 'warn.js'];

    let doesImportantFilesExistsFunctionResult = true;

    try {

        const currentHandlerFiles = nodeFS.readdirSync(importantDIR.handler, 'utf-8').filter(currentHandlerFilesName => currentHandlerFilesName.endsWith('.js'));

        const currentDiscordSlashCommandFiles = nodeFS.readdirSync(importantDIR.discord_slash_command, 'utf-8').filter(currentDiscordSlashCommandFilesName => currentDiscordSlashCommandFilesName.endsWith('.js'));

        let missingFiles = new Array();

        defaultHandlerFiles.forEach((defaultHandlerFileName) => {
            if (currentHandlerFiles.includes(defaultHandlerFileName) === false) {
                if (missingFiles.includes(defaultHandlerFileName) === false) {
                    missingFiles.push(defaultHandlerFileName);
                }

                doesImportantFilesExistsFunctionResult = false;

            }
        });
        currentHandlerFiles.forEach((currentHandlerFileName) => {
            if (defaultHandlerFiles.includes(currentHandlerFileName) === false) {
                if (missingFiles.includes(currentHandlerFileName) === false) {
                    missingFiles.push(currentHandlerFileName);
                }

                doesImportantFilesExistsFunctionResult = false;

            }
        });
        defaultDiscordSlashCommandFiles.forEach((defaultDiscordSlashCommandFileName) => {
            if (currentDiscordSlashCommandFiles.includes(defaultDiscordSlashCommandFileName) === false) {
                if (missingFiles.includes(defaultDiscordSlashCommandFileName) === false) {
                    missingFiles.push(defaultDiscordSlashCommandFileName);
                }

                doesImportantFilesExistsFunctionResult = false;

            }
        });
        currentDiscordSlashCommandFiles.forEach((currentDiscordSlashCommandFileName) => {
            if (defaultDiscordSlashCommandFiles.includes(currentDiscordSlashCommandFileName) === false) {
                if (missingFiles.includes(currentDiscordSlashCommandFileName) === false) {
                    missingFiles.push(currentDiscordSlashCommandFileName);
                }

                doesImportantFilesExistsFunctionResult = false;

            }
        });
        console.log('MCHSB » Loading license file...');
        try {
            nodeFS.accessSync('LICENSE', nodeFS.constants.F_OK);
            console.log('MCHSB » Successfully loaded license file.');
            try {
                console.log('MCHSB » Loading package file...');
                nodeFS.accessSync('package.json', nodeFS.constants.F_OK);
                console.log('MCHSB » Successfully loaded package file.');
                try {
                    console.log('MCHSB » Loading package lock file...');
                    nodeFS.accessSync('package-lock.json', nodeFS.constants.F_OK);
                    console.log('MCHSB » Successfully loaded package lock file.');
                } catch {
                    console.log('MCHSB » Error occured while loading package lock file!');
                    missingFiles.push('package-lock.json');

                    doesImportantFilesExistsFunctionResult = false;

                }
            } catch {
                console.log('MCHSB » Error occured while loading package file!');
                missingFiles.push('package.json');

                doesImportantFilesExistsFunctionResult = false;

            }
        } catch {
            console.log('MCHSB » Error occured while loading license file!');
            missingFiles.push('LICENSE');

            doesImportantFilesExistsFunctionResult = false;

        }
        if (missingFiles.length !== 0) {

            missingFiles = missingFiles.join(', ');

            console.log(`MCHSB » Missing Files: ${missingFiles}`);
        }
    } catch (doesImportantFilesExistsFunctionError) {

        doesImportantFilesExistsFunctionResult = false;

    }
    return doesImportantFilesExistsFunctionResult;
}

function doesEnvFileExists() {
    console.log('MCHSB » Loading .env file...');
    try {
        nodeFS.accessSync('.env', nodeFS.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function generateEnvFile() {
    console.log('MCHSB » Generating a new .env file...');
    try {
        nodeFS.appendFileSync('.env', defaultEnvFileLayout, 'utf-8');
        return true;
    } catch {
        return false;
    }
}

function isEnvFileValid() {
    console.log('MCHSB » Validating .env file and its configuration...');
    try {
        if (process.env.DISCORD_BOT_TOKEN === undefined || process.env.STAFF_BOT_EMAIL === undefined || process.env.STAFF_BOT_PASSWORD === undefined) {
            return false;
        } else {
            if (process.env.DISCORD_BOT_TOKEN === 'DISCORD_BOT_TOKEN_HERE' || process.env.STAFF_BOT_EMAIL === 'STAFF_BOT_EMAIL_HERE' || process.env.STAFF_BOT_PASSWORD === 'STAFF_BOT_PASSWORD_HERE') {
                return false;
            } else {
                return true;
            }
        }
    } catch {
        return false;
    }
}

function reformatEnvFile() {
    console.log('MCHSB » Reformatting .env file...');
    try {
        nodeFS.writeFileSync('.env', defaultEnvFileLayout, 'utf-8');
        return true;
    } catch {
        return false;
    }
}

function doesConfigFileExists() {
    console.log('MCHSB » Loading config file...');
    try {
        nodeFS.accessSync('config.json', nodeFS.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function generateConfigFile() {
    console.log('MCHSB » Generating a new config file...');
    try {
        nodeFS.appendFileSync('config.json', JSON.stringify(defaultConfigFileLayout, null, 4), 'utf-8');
        return true;
    } catch {
        return false;
    }
}

function isConfigFileValid() {
    console.log('MCHSB » Validating config file...');

    let isConfigFileValidFunctionResult = true;

    try {

        configValue = JSON.parse(nodeFS.readFileSync('config.json', 'utf-8'));

        let defaultConfigObjects = new Array(), currentConfigObjects = new Array();

        Object.keys(defaultConfigFileLayout).forEach((defaultConfigMainObject) => {
            defaultConfigObjects.push(defaultConfigMainObject);
            Object.keys(defaultConfigFileLayout[defaultConfigMainObject]).forEach((defaultConfigSecondaryObject) => {
                defaultConfigObjects.push(defaultConfigSecondaryObject);
            });
        });
        Object.keys(configValue).forEach((currentConfigMainObject) => {
            currentConfigObjects.push(currentConfigMainObject);
            Object.keys(configValue[currentConfigMainObject]).forEach((currentConfigSecondaryObject) => {
                currentConfigObjects.push(currentConfigSecondaryObject);
            });
        });
        defaultConfigObjects.forEach((defaultConfigObject) => {
            if (currentConfigObjects.includes(defaultConfigObject) === false) {

                isConfigFileValidFunctionResult = false;

            }
        });
        currentConfigObjects.forEach((currentConfigObject) => {
            if (defaultConfigObjects.includes(currentConfigObject) === false) {

                isConfigFileValidFunctionResult = false;

            }
        });
    } catch (isConfigFileValidFunctionError) {

        isConfigFileValidFunctionResult = false;

    }
    return isConfigFileValidFunctionResult;
}

function reformatConfigFile() {
    console.log('MCHSB » Reformatting config file...');
    try {
        nodeFS.writeFileSync('config.json', JSON.stringify(defaultConfigFileLayout, null, 4), 'utf-8');
        return true;
    } catch {
        return false;
    }
}

function loadEssentials() {
    console.log('MCHSB » Loading important directories & files...');
    if (doesImportantDIRsExists() === true) {
        console.log('MCHSB » Successfully loaded important directories.');
        if (doesImportantFilesExists() === true) {
            console.log('MCHSB » Successfully loaded important files.');
            if (doesEnvFileExists() === true) {
                if (isEnvFileValid() === true) {
                    console.log('MCHSB » Successfully validated .env file.');
                    console.log('MCHSB » Successfully loaded .env file.');
                    if (doesConfigFileExists() === true) {
                        if (isConfigFileValid() === true) {
                            console.log('MCHSB » Successfully validated config file.');
                            console.log('MCHSB » Successfully loaded config file.');
                            return true;
                        } else {
                            console.log('MCHSB » Invalid config file!');
                            if (reformatConfigFile() === true) {
                                console.log('MCHSB » Successfully reformatted config file. Please configure it before running staff bot again.');
                            } else {
                                console.log('MCHSB » Error occured while reformatting config file! Please reinstall staff bot.');
                            }
                        }
                    } else {
                        console.log('MCHSB » Missing config file!');
                        if (generateConfigFile() === true) {
                            console.log('MCHSB » Successfully generated a new config file! Please configure it before running staff bot again.');
                        } else {
                            console.log('MCHSB » Error occured while generating a new config file! Please reinstall staff bot.');
                        }
                    }
                } else {
                    console.log('MCHSB » Invalid .env file or its configuration!');
                    if (reformatEnvFile() === true) {
                        console.log('MCHSB » Successfully reformatted .env file. Please configure it before running staff bot again.');
                    } else {
                        console.log('MCHSB » Error occured while reformatting .env file! Please reinstall staff bot.');
                    }
                }
            } else {
                console.log('MCHSB » Missing .env file!');
                if (generateEnvFile() === true) {
                    console.log('MCHSB » Successfully generated a new .env file! Please configure it before running staff bot again.');
                } else {
                    console.log('MCHSB » Error occured while generating a new .env file! Please reinstall staff bot.');
                }
            }
        } else {
            console.log('MCHSB » Error occured while loading important files! Please reinstall staff bot.');
        }
    } else {
        console.log('MCHSB » Error occured while loading important directories! Please reinstall staff bot.');
    }
    return false;
}

function registerHandlers() {
    console.log('MCHSB » Registering handlers...');
    try {

        handlers = new Map();

        const handlerFiles = nodeFS.readdirSync(importantDIR.handler, 'utf-8').filter(handlerFilesName => handlerFilesName.endsWith('.js'));

        handlerFiles.forEach((handlerFileName) => {

            const handlerFilePath = `${importantDIR.handler}${handlerFileName}`;

            const handlerFile = require(handlerFilePath);

            handlers.set(handlerFile.data.name, handlerFile);
        });

        errorHandler = handlers.get('error');

        return true;
    } catch {
        return false;
    }
}

function executeErrorHandler(errorInfo, actionType) {

    let actionName;

    switch (actionType) {
        default:

            actionName = 'Forcing staff bot to restart...';

            actionType = 0;

            break;
        case 0:

            actionName = 'Forcing staff bot to restart...';

            break;
        case 1:

            actionName = 'Forcing staff bot to shutdown...';

            break;
    }
    try {
        errorHandler.execute(errorInfo, discordBot, staffBot);
    } catch {
        console.log(`MCHSB » Error occured while executing error handler! ${actionName}`);
    }
    return process.exit(actionType);
}

function startConsoleChat() {
    try {

        consoleChat = readline.createInterface({ input: process.stdin });

        console.log('MCHSB » Successfully started console chat module.');
    } catch (startConsoleChatError) {
        console.log('MCHSB » Error occured while starting console chat! Restarting staff bot...');
        executeErrorHandler(startConsoleChatError, 0);
    }
    return;
}

try {
    console.log('MCHSB » Starting up MCHub staff bot (Prisons)...');
    if (loadEssentials() === true) {
        console.log('MCHSB » Successfully loaded important directories & files.');
        if (registerHandlers() === true) {
            console.log('MCHSB » Successfully registered handlers.');
            console.log('MCHSB » Starting console chat module...');
            startConsoleChat();
            console.log('MCHSB » Connecting to the Discord Bot...');
            discordBot.login(process.env.DISCORD_BOT_TOKEN).then(() => {
                console.log('MCHSB » Connected to the Discord Bot.');
            }).catch((discordBotLoginError) => {
                console.log('MCHSB » Error occured while connecting to the Discord Bot! Restarting staff bot...');
                executeErrorHandler(discordBotLoginError, 0);
            });

            staffBot = mineflayer.createBot({ host: 'MCHub.COM', version: '1.18.2', username: process.env.STAFF_BOT_EMAIL, password: process.env.STAFF_BOT_PASSWORD, auth: 'microsoft', keepAlive: true, checkTimeoutInterval: 60000 });

        } else {
            console.log('MCHSB » Error occured while registering handlers! Force restarting staff bot...');
            return process.exit(0);
        }
    } else {
        console.log('MCHSB » Error occured while loading important directories & files! Force restarting staff bot...');
        return process.exit(0);
    }
} catch {
    console.log('MCHSB » Error occured while starting up staff bot! Force restarting staff bot...');
    return process.exit(0);
}

process.on('unhandledRejection', (proccessOnUnhandledRejectionError) => {
    console.log('MCHSB » Process Unhandled Rejection! Restarting staff bot...');
    executeErrorHandler(proccessOnUnhandledRejectionError, 0);
    return;
});

process.on('uncaughtException', (proccessOnUncaughtExceptionError) => {
    console.log('MCHSB » Process Uncaught Exception! Restarting staff bot...');
    executeErrorHandler(proccessOnUncaughtExceptionError, 0);
    return;
});

discordBot.on('error', (discordBotOnErrorError) => {
    console.log('MCHSB » Discord Bot Error! Restarting staff bot...');
    executeErrorHandler(discordBotOnErrorError, 0);
    return;
});

discordBot.on('invalidated', (discordBotOnInvalidatedError) => {
    console.log('MCHSB » Discord Bot Invalidated! Restarting staff bot...');
    executeErrorHandler(discordBotOnInvalidatedError, 0);
    return;
});

discordBot.on('shardDisconnect', (discordBotOnShardDisconnectError) => {
    console.log('MCHSB » Discord Bot Shard Disconnect! Restarting staff bot...');
    executeErrorHandler(discordBotOnShardDisconnectError, 0);
    return;
});

discordBot.on('shardError', (discordBotOnShardErrorError) => {
    console.log('MCHSB » Discord Bot Shard Error! Restarting staff bot...');
    executeErrorHandler(discordBotOnShardErrorError, 0);
    return;
});

staffBot.on('error', (staffBotOnErrorError) => {
    console.log('MCHSB » Staff Bot Error! Restarting staff bot...');
    executeErrorHandler(staffBotOnErrorError, 0);
    return;
});

staffBot.on('kicked', (staffBotOnKickedError) => {
    console.log('MCHSB » Staff Bot Kicked! Restarting staff bot...');
    executeErrorHandler(staffBotOnKickedError, 0);
    return;
});

async function isConfigFileValuesValid() {
    console.log('MCHSB » Validating config values...');

    let isConfigFileValuesValidResult = true;

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
        if (typeof Number(configValue.staff_bot.survival_season) !== 'number') {
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
            if (isConfigFileValuesValidResult !== false) {
                Object.keys(configValue[configValueMainObject]).forEach((configValueSecondaryObject) => {
                    switch (configValueMainObject) {
                        case 'feature':
                            if (typeof Boolean(configValue.feature[configValueSecondaryObject]) !== 'boolean') {

                                return isConfigFileValuesValidResult = false;

                            }
                            break;
                        case 'discord_channel':
                            if (typeof Number(configValue.discord_channel[configValueSecondaryObject]) !== 'number') {

                                return isConfigFileValuesValidResult = false;

                            } else {
                                if (configValue.feature[`log_${configValueSecondaryObject}_to_discord`] === 'true') {
                                    if (discordBotGuildChannelsID.includes(configValue.discord_channel[configValueSecondaryObject]) !== true) {

                                        return isConfigFileValuesValidResult = false;

                                    }
                                }
                            }
                            break;
                        case 'role_id':
                            if (typeof Number(configValue.role_id[configValueSecondaryObject]) !== 'number') {

                                return isConfigFileValuesValidResult = false;

                            } else {
                                if (discordBotGuildRolesID.includes(configValue.role_id[configValueSecondaryObject]) !== true) {

                                    return isConfigFileValuesValidResult = false;

                                }
                            }
                            break;
                    }
                });
            }
        });

        clientID = discordBot.user.id;

    } catch (isConfigFileValuesError) {

        isConfigFileValuesValidResult = isConfigFileValuesError;

    }
    return isConfigFileValuesValidResult;
}

async function syncDiscordSlashCommands() {
    console.log('MCHSB » Synchronizing discord slash commands...');
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
        await restAPI.put(Routes.applicationGuildCommands(clientID, guildID), { body: discordSlashCommands });
        return true;
    } catch (syncDiscordSlashCommandsError) {
        return syncDiscordSlashCommandsError;
    }
}

async function logDiscordInteraction(discordInteractionDetails, discordInteractionResult) {
    try {

        const discordUserDisplayName = discordInteractionDetails.member.displayName;

        const discordUserID = discordInteractionDetails.member.id;

        const discordInteractionChannelName = discordInteractionDetails.channel.name;

        const discordInteractionChannelID = discordInteractionDetails.channel.id;

        const discordUserAvatarURL = discordInteractionDetails.member.displayAvatarURL();

        let discordInteractionLogTemplate;

        switch (discordInteractionResult.interactionResult) {
            default:

                discordInteractionLogTemplate = `User's Discord Username: ${discordUserDisplayName}\n` + `User's Discord ID: ${discordUserID}\n` + `Command: ${discordInteractionResult.interactionFullCommand}\n` + `Command Result: UNKNOWN\n` + 'Reason: Unknown error occured!\n' + `Channel's Name: #${discordInteractionChannelName}\n` + `Channel's ID: ${discordInteractionChannelID}`;

                break;
            case 'ERROR':

                discordInteractionLogTemplate = `User's Discord Username: ${discordUserDisplayName}\n` + `User's Discord ID: ${discordUserID}\n` + `Command: ${discordInteractionResult.interactionFullCommand}\n` + `Command Result: ERROR\n` + 'Reason: Internal error occured!\n' + `Channel's Name: #${discordInteractionChannelName}\n` + `Channel's ID: ${discordInteractionChannelID}`;

                break;
            case false:

                discordInteractionLogTemplate = `User's Discord Username: ${discordUserDisplayName}\n` + `User's Discord ID: ${discordUserID}\n` + `Command: ${discordInteractionResult.interactionFullCommand}\n` + `Command Result: FAILED\n` + `Reason: ${discordInteractionResult.interactionErrorReason}\n` + `Channel's Name: #${discordInteractionChannelName}\n` + `Channel's ID: ${discordInteractionChannelID}`;

                break;
            case true:

                discordInteractionLogTemplate = `User's Discord Username: ${discordUserDisplayName}\n` + `User's Discord ID: ${discordUserID}\n` + `Command: ${discordInteractionResult.interactionFullCommand}\n` + `Command Result: SUCCESS\n` + `Channel's Name: #${discordInteractionChannelName}\n` + `Channel's ID: ${discordInteractionChannelID}`;

                break;
        }
        if (configValue.feature.log_discord_interaction_to_console === 'true') {
            console.log('\n================================\n' + discordInteractionLogTemplate + '\n================================\n');
        }
        if (configValue.feature.log_discord_interaction_to_discord === 'true') {

            const discordInteractionLogsChannelID = configValue.discord_channel.discord_interaction_logs;

            const discordInteractionLogsChannelName = discordBot.guilds.cache.get(guildID).channels.cache.get(discordInteractionLogsChannelID).name;

            const discordMarkdowns = ['\*', '\_', '\`', '\>', '\|'];

            discordMarkdowns.forEach(discordMarkdown => {

                discordInteractionLogTemplate = discordInteractionLogTemplate.replace(new RegExp(`[\\${discordMarkdown}]`, 'g'), `\\${discordMarkdown}`);

            });

            const discordInteractionLogEmbed = new DiscordJS.EmbedBuilder()
                .setColor('#4422bf')
                .setTitle('DISCORD SLASH COMMAND USAGE')
                .setDescription(discordInteractionLogTemplate)
                .setThumbnail(discordUserAvatarURL)
                .setTimestamp()
                .setFooter({ text: 'Custom Coded By QimieGames', iconURL: 'https://i.imgur.com/qTwnd6e.png' });

            if (discordBot.guilds.cache.get(guildID).channels.cache.get(discordInteractionLogsChannelID) !== undefined) {
                if (discordBot.guilds.cache.get(guildID).channels.cache.get(discordInteractionLogsChannelID).permissionsFor(clientID).has('ViewChannel') === true) {
                    if (discordBot.guilds.cache.get(guildID).channels.cache.get(discordInteractionLogsChannelID).permissionsFor(clientID).has('SendMessages') === true) {
                        await discordBot.guilds.cache.get(guildID).channels.cache.get(discordInteractionLogsChannelID).send({ embeds: [discordInteractionLogEmbed] });
                    } else {
                        console.log(`MCHSB » Error occured while logging discord interaction log in #${discordInteractionLogsChannelName}!`);
                    }
                } else {
                    console.log(`MCHSB » Error occured while viewing #${discordInteractionLogsChannelName}!`);
                }
            } else {
                console.log(`MCHSB » Error occured while finding discord interaction logs channel!`);
            }
        }
    } catch (logDiscordInteractionError) {
        console.log('MCHSB » Error occured while logging discord interaction! Restarting staff bot...');
        executeErrorHandler(logDiscordInteractionError, 0);
    }
    return;
}

consoleChat.on('line', async (consoleChatInput) => {
    try {

        const consoleChatHandler = handlers.get('console_chat');

        await consoleChatHandler.execute(consoleChatInput, discordBot, staffBot);
    } catch (consoleChatOnLineError) {
        console.log('MCHSB » Error occured while executing console chat on line tasks! Restarting staff bot...');
        executeErrorHandler(consoleChatOnLineError, 0);
    }
    return;
});

discordBot.once('ready', async () => {
    try {
        await isConfigFileValuesValid().then(async (isConfigFileValuesValidResult) => {
            switch (isConfigFileValuesValidResult) {
                default:
                    console.log('MCHSB » Error occured while validating config values! Restarting staff bot...');
                    executeErrorHandler(isConfigFileValuesValidResult, 0);
                    break;
                case true:
                    console.log('MCHSB » Validated config values.');
                    await syncDiscordSlashCommands().then((syncDiscordSlashCommandsResult) => {
                        if (syncDiscordSlashCommandsResult === true) {
                            console.log('MCHSB » Successfully synchronized discord slash commands.');
                        } else {
                            console.log('MCHSB » Error occured while synchronizing discord slash commands! Restarting staff bot...');
                            executeErrorHandler(syncDiscordSlashCommandsResult, 0);
                        }
                    });
                    break;
                case false:
                    console.log('MCHSB » Invalid config file configurations! Please set it up correctly before running staff bot again. Shutting down staff bot...');
                    process.exit(1);
                    break;
            }
        });
    } catch (discordBotOnceReadyError) {
        console.log('MCHSB » Error occured while executing discord bot once ready tasks! Restarting staff bot...');
        executeErrorHandler(discordBotOnceReadyError, 0);
    }
    return;
});

discordBot.on('ready', async () => {
    try {
        discordBot.user.setActivity('MCHub.COM - Atlantic Prisons', { type: DiscordJS.ActivityType.Playing, name: 'MCHub.COM - Atlantic Prisons' });
    } catch (discordBotOnReadyError) {
        console.log('MCHSB » Error occured while executing discord bot on ready tasks! Restarting staff bot...');
        executeErrorHandler(discordBotOnReadyError, 0);
    }
    return;
});

discordBot.on('interactionCreate', async (discordInteractionDetails) => { //REWRITE LATER

    let discordInteractionHandlerResult = { interactionResult: null, interactionFullCommand: null, interactionErrorReason: null };

    try {
        if (discordInteractionDetails.isChatInputCommand()) {
            await discordInteractionDetails.deferReply({ ephemeral: false }).then(async () => {

                const staffBotBlacklistedUserRoleID = configValue.role_id.bot_blacklisted;

                if (discordInteractionDetails.member.roles.cache.some(discordUserRoles => discordUserRoles.id === staffBotBlacklistedUserRoleID) === true) {
                    await discordInteractionDetails.editReply({ content: '```You are blacklisted from using this bot!```', ephemeral: false }).then(() => {

                        discordInteractionHandlerResult.interactionResult = false, discordInteractionHandlerResult.interactionFullCommand = `/${discordInteractionDetails.commandName}`, discordInteractionHandlerResult.interactionErrorReason = 'User is blacklisted from using this bot!';

                    }).then(async () => {
                        await logDiscordInteraction(discordInteractionDetails, discordInteractionHandlerResult);
                    });
                } else {
                    if (isDiscordSlashCommandsOnCooldown === false) {

                        const discordInteractionHandler = discordBot.slashCommands.get(discordInteractionDetails.commandName);

                        isDiscordSlashCommandsOnCooldown = true;

                        switch (discordInteractionDetails.commandName) {
                            default:
                                await discordInteractionDetails.editReply({ content: '```Internal error occured!```', ephemeral: false }).then(() => {

                                    discordInteractionHandlerResult.interactionResult = 'ERROR', discordInteractionHandlerResult.interactionFullCommand = `/${discordInteractionDetails.commandName}`;

                                }).then(async () => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionHandlerResult);
                                });
                                break;
                            case 'ban':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'blacklist':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'chat':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'dupeip':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'export':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'help':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'hist':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'kick':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'mute':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'prunehist':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'restart':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, discordBot, staffBot, logDiscordInteraction);
                                break;
                            case 'seen':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'staffmode':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'staffstats':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'sudo':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'unban':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'unblacklist':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'unmute':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'unwarn':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                            case 'warn':
                                await discordInteractionHandler.execute(discordInteractionHandlerResult, discordInteractionDetails, configValue, staffBot).then(async (discordInteractionResult) => {
                                    await logDiscordInteraction(discordInteractionDetails, discordInteractionResult);
                                });
                                break;
                        }

                        isDiscordSlashCommandsOnCooldown = false;

                    } else {
                        await discordInteractionDetails.editReply({ content: '```Discord slash commands is on cooldown!```', ephemeral: false }).then(() => {

                            discordInteractionHandlerResult.interactionResult = false, discordInteractionHandlerResult.interactionFullCommand = `/${discordInteractionDetails.commandName}`, discordInteractionHandlerResult.interactionErrorReason = 'Discord slash commands is on cooldown!';

                        }).then(async () => {
                            await logDiscordInteraction(discordInteractionDetails, discordInteractionHandlerResult);
                        });
                    }
                }
            });
        }
    } catch (discordBotOnInteractionCreateError) {
        console.log('MCHSB » Error occured while executing discord bot on interaction create tasks! Restarting staff bot...');
        await discordInteractionDetails.editReply({ content: '```Error occured while executing this discord slash command handler!```', ephemeral: false }).then(() => {

            discordInteractionHandlerResult.interactionResult = 'ERROR', discordInteractionHandlerResult.interactionFullCommand = `/${discordInteractionDetails.commandName}`;

        }).then(async () => {
            await logDiscordInteraction(discordInteractionDetails, discordInteractionHandlerResult);
        }).catch(() => { });
        executeErrorHandler(discordBotOnInteractionCreateError, 0);
    }
    return;
});

staffBot.once('login', async () => {
    console.log('MCHSB » Connecting to MCHub.COM...');
    return;
});

staffBot.once('spawn', async () => {
    console.log('MCHSB » Connected to MCHub.COM.');
    try {

        const tasksSchedulerHandler = handlers.get('tasks_scheduler');

        await tasksSchedulerHandler.execute(configValue, discordBot, staffBot).then((tasksSchedulerHandlerResult) => {
            if (tasksSchedulerHandlerResult === true) {
                console.log('MCHSB » Successfully scheduled tasks.');
            } else {
                console.log('MCHSB » Error occured while scheduling tasks! Restarting staff bot...');
                executeErrorHandler(tasksSchedulerHandlerResult, 0);
            }
        });
    } catch (staffBotOnceSpawnError) {
        console.log('MCHSB » Error occured while executing staff bot once spawn tasks! Restarting staff bot...');
        executeErrorHandler(staffBotOnceSpawnError, 0);
    }
    return;
});

staffBot.on('message', async (chatMessage, chatPosition) => {
    try {
        if (chatPosition !== 'game_info' && String(chatMessage).length >= 8) {

            const chatHandler = handlers.get('staff_bot_chat');

            await chatHandler.execute(configValue, guildID, clientID, discordBot, chatMessage);
        }
    } catch (staffBotOnMessageError) {
        console.log('MCHSB » Error occured while executing staff bot on message tasks! Restarting staff bot...');
        executeErrorHandler(staffBotOnMessageError, 0);
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
        executeErrorHandler(staffBotOnResourcePackError, 0);
    }
    return;
});