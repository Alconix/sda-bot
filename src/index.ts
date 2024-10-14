import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import { dirname, join } from "path";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import cron from 'cron';

import { registerHandleApply } from "./apply.js";
import {whenRaiding, whosRaiding} from "./raiding.js";

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));

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

    // run /who command on cron schedule
    cron.CronJob.from({
        cronTime: '0 9 * * 2,4,7',
        onTick: () => {
            whosRaiding(client, 11);
        },
        timeZone: 'Europe/Paris', start: true
    })
});

registerHandleApply(client);

client.commands = new Collection();

const foldersPath = join(__dirname, "./commands");
const commandsFolder = readdirSync(foldersPath);

for (const file of commandsFolder) {
    const filePath = join(foldersPath, file);
    import(filePath).then((command) => {
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    });
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
