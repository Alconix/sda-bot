import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RAID_ROLE_ID } from "../constants.js";

export const data = new SlashCommandBuilder().setName("who").setDescription("who");
export const execute = async (interaction: ChatInputCommandInteraction) => {
    const channel = interaction.channel;

    const tankEmoji = interaction.client.emojis.cache.find(emoji => emoji.name === 'tank');
    const healEmoji = interaction.client.emojis.cache.find(emoji => emoji.name === 'heal');
    const dpsEmoji = interaction.client.emojis.cache.find(emoji => emoji.name === 'dps');

    console.log(tankEmoji)

    await channel?.send({
        poll: {
            question: {
                text: `Who's raiding ???`,
            },
            answers: [
                {
                    text: "Tank",
                    emoji: tankEmoji,
                },
                {
                    text: "Heal",
                    emoji: healEmoji
                },
                {
                    text: "DPS",
                    emoji: dpsEmoji
                },
            ],
            duration: 10,
            allowMultiselect: true,
        }
    });
};
