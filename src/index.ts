import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import path from "path";
import { readdirSync } from "fs";

import { registerHandleApply } from "./apply";

dotenv.config();

// Discord bot startup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.once(Events.ClientReady, async (c) => {
    console.log(`Ready ! Logged in as ${c.user.tag}`);
});

registerHandleApply(client);

client.commands = new Collection();

const foldersPath = path.join(__dirname, "../src/commands");
const commandsFolder = readdirSync(foldersPath);

for (const file of commandsFolder) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
        }
    }
});

client.login(process.env.BOT_TOKEN);
