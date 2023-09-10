import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RAID_ROLE_ID } from "../constants.js";

export const data = new SlashCommandBuilder().setName("when").setDescription("when");
export const execute = async (interaction: ChatInputCommandInteraction) => {
    const replyInteract = await interaction.reply({
        content: `When <@&${RAID_ROLE_ID}>ing ???`,
        fetchReply: true,
        allowedMentions: {
            parse: ["roles"],
        },
    });

    replyInteract.react("🇯");
    replyInteract.react("🇩");
    replyInteract.react("🇲");
    replyInteract.react("❔");
    replyInteract.react("❌");
};
