// import { ChatInputCommandInteraction, GuildEmoji, SlashCommandBuilder } from "discord.js";
// import { RAID_ROLE_ID } from "../constants.js";

// export const data = new SlashCommandBuilder().setName("when").setDescription("when");
// export const execute = async (interaction: ChatInputCommandInteraction) => {
//     const channel = interaction.channel;

//     await channel?.send({
//         poll: {
//             question: {
//                 text: `When <@&${RAID_ROLE_ID}>ing ???`,
//             },
//             answers: [
//                 {
//                     text: "Jeudi",
//                     emoji: "🇯"
//                 },
//                 {
//                     text: "Dimanche",
//                     emoji: "🇩"
//                 },
//                 {
//                     text: "Mardi",
//                     emoji: "🇲"
//                 },
//                 {
//                     text: "Chépo",
//                     emoji: "❔"
//                 },
//                 {
//                     text: "Non",
//                     emoji: "❌"
//                 }
//             ],
//             duration: 168,
//             allowMultiselect: true,
//         }
//     });
// };
