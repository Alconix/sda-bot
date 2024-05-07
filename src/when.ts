import { Client, TextChannel } from "discord.js";
import { RAID_CHANNEL_ID } from "./constants.js";

// Function version of the `/when` command to be used in the main bot loop
const whenRaiding = async (client: Client) => {
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

export default whenRaiding;