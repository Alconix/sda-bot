import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  Colors,
  Events,
  GatewayIntentBits,
} from "discord.js";
import type { TextChannel } from "discord.js";
import * as dotenv from "dotenv";
import {
  ADMIN_CHANNEL_HOOk_ID,
  ADMIN_CHANNEL_ID,
  GUILD_ID,
  CATEGORY_ID,
  TALK_CHANNEL_ID,
  APPLY_ROLE_ID,
  ARCHIVE_ID,
  CHAMPION_ID,
} from "./constants";

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

const generateControlActionRow = () => {
  const accept = new ButtonBuilder()
    .setCustomId("accept")
    .setLabel("Accepter")
    .setStyle(ButtonStyle.Success);

  const decline = new ButtonBuilder()
    .setCustomId("decline")
    .setLabel("Refuser")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(accept, decline);

  return { row, accept, decline }
};

client.on("messageCreate", async (message) => {
  if (
    message.channel.id === ADMIN_CHANNEL_ID &&
    message.author.id === ADMIN_CHANNEL_HOOk_ID &&
    message.author.bot
  ) {
    // Get guild instance
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    // Get apply member instance
    const members = await guild?.members.fetch();

    const applyMember = members?.find(
      (member) =>
        member.user.tag ===
        message.embeds.at(0)?.fields.find((a) => a.name === "Nom d\\'utilisateur discord")?.value
    );

    const applyDisplayName = applyMember?.nickname ?? applyMember?.user.username;

    if (!applyMember) {
      // Stop and send error if member is not found
      await message.reply({
        embeds: [
          { color: Colors.Red, title: "Error", description: "Impossible de trouver l'utilisateur" },
        ],
      });

      return;
    }

    // Get talk channel instance and create thread for private discussion
    const talkChannel = client.channels.cache.get(TALK_CHANNEL_ID) as TextChannel;
    await talkChannel.threads.create({
      name: `Recrutment ${applyDisplayName}`,
    });

    // Create temp channel for new apply
    const applyChannel = await guild?.channels.create({
      name: `recrutement-${applyDisplayName}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
    });

    // Give permissions to the apply to their channel
    await applyChannel.permissionOverwrites.create(applyMember, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    // Send apply info to channel and notify members
    await applyChannel.send({
      content: `<@&${CHAMPION_ID}>, nouvelle candidature de <@${applyMember.user.id}>`,
      embeds: [
        {
          fields: message.embeds.at(0)?.fields,
        },
      ],
      allowedMentions: {
        parse: ["users", "roles"],
      },
    });

    const {row, accept, decline} = generateControlActionRow();

    // Post recrutment controls in admin channel
    const controls = await message.reply({ components: [row] });
    const result = await controls.awaitMessageComponent();

    if (result.customId === "accept") {
      // Apply accepted
      await result.update({
        components: [row.setComponents(accept.setDisabled(true))],
      });

      // Add prospect role
      await applyMember?.roles.add(APPLY_ROLE_ID);
    } else {
      // Apply refused
      await result.update({
        components: [row.setComponents(decline.setDisabled(true))],
      });
    }

    // Archivate channel
    applyChannel.setParent(ARCHIVE_ID);
  }
});

client.login(process.env.BOT_TOKEN);
