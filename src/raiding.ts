import type { Client, TextChannel } from "discord.js";
import { RAID_CHANNEL_ID, RAID_ROLE_ID } from "./constants.js";

// Function version of the `/when` command to be used in the main bot loop
export const whenRaiding = async (client: Client, duration: number = 168) => {
    const channel = client.channels.cache.get(RAID_CHANNEL_ID) as TextChannel;

    await channel?.send({
        poll: {
            question: {
                text: `When raiding ???`,
            },
            answers: [
                {
                    text: "Jeudi",
                    emoji: "🇯"
                },
                {
                    text: "Dimanche",
                    emoji: "🇩"
                },
                {
                    text: "Mardi",
                    emoji: "🇲"
                },
                {
                    text: "Chépo",
                    emoji: "❔"
                },
                {
                    text: "Non",
                    emoji: "❌"
                }
            ],
            duration: 168,
            allowMultiselect: true,
        }
    });
}

export const whosRaiding = async (client: Client, duration: number = 168) => {
    const channel = client.channels.cache.get(RAID_CHANNEL_ID) as TextChannel;

    const tankEmoji = client.emojis.cache.find(emoji => emoji.name === 'tank');
    const healEmoji = client.emojis.cache.find(emoji => emoji.name === 'heal');
    const dpsEmoji = client.emojis.cache.find(emoji => emoji.name === 'dps');

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
            duration: duration,
            allowMultiselect: true,
        }
    })
}