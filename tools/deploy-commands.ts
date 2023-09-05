import { REST, Routes } from "discord.js";
import path from "path";
import { readdirSync } from "fs";
import * as dotenv from "dotenv";
import { APPLICATION_ID, GUILD_ID } from "../src/constants";

dotenv.config();

const commands = [];

if (!process.env.BOT_TOKEN) {
    console.error("Bot token not defined");
    process.exit(1);
}

// Get all commands file from the commands folder
const foldersPath = path.join(__dirname, "../src/commands");
const commandsFolder = readdirSync(foldersPath);

for (const file of commandsFolder) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(`Started updating ${commands.length} application (/) commands...`);

        // Refresh all commands in the guild with current set
        await rest.put(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID), {
            body: commands,
        });

        console.log(`Successfully updated applications (/) commands !`);
    } catch (err) {
        console.error(err);
    }
})();
