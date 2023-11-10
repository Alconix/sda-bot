import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    Colors,
    Events,
} from "discord.js";
import type { APIEmbedField, Client, GuildMember, Message, TextChannel } from "discord.js";
import {
    ADMIN_CHANNEL_HOOk_ID,
    ADMIN_CHANNEL_ID,
    GUILD_ID,
    CATEGORY_ID,
    TALK_CHANNEL_ID,
    APPLY_ROLE_ID,
    ARCHIVE_ID,
    CHAMPION_ID,
} from "./constants.js";

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

    return { row, accept, decline };
};

const embedsFromForm = (fields: APIEmbedField[] | undefined): APIEmbedField[] => {
    const result: APIEmbedField[] = [];
    if (!fields) return result;

    for (const field of fields) {
        if (field.name === "Quelles sont vos disponibilités ?") {
            result.push({
                name: field.name,
                value: JSON.parse(field.value)[0].join(", "),
                inline: false,
            });
        } else if (field.name === "Nom d'utilisateur discord (sans #, sans majuscules)") {
            continue;
        } else {
            result.push({
                name: field.name,
                value: JSON.parse(field.value),
                inline: false,
            });
        }
    }

    return result;
};

export const registerHandleApply = (client: Client) =>
    client.on(Events.MessageCreate, async (message: Message<boolean>) => {
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

            const nameInForm = message.embeds
                .at(0)
                ?.fields.find(
                    (a) => a.name === "Nom d'utilisateur discord (sans #, sans majuscules)"
                )
                ?.value.toLocaleLowerCase();

            const applyMember = members?.find((member: GuildMember) => {
                if (!nameInForm) return null;

                return JSON.parse(nameInForm) === member.user.tag;
            });

            const applyDisplayName = applyMember?.nickname ?? applyMember?.user.username;

            if (!applyMember) {
                // Stop and send error if member is not found
                await message.reply({
                    embeds: [
                        {
                            color: Colors.Red,
                            title: "Error",
                            description: `Impossible de trouver l'utilisateur ${nameInForm}`,
                        },
                    ],
                });

                return;
            }

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
                        fields: embedsFromForm(message.embeds.at(0)?.fields),
                    },
                ],
                allowedMentions: {
                    parse: ["users", "roles"],
                },
            });

            // Get discussion channel instance and create thread for private discussion
            const talkChannel = client.channels.cache.get(TALK_CHANNEL_ID) as TextChannel;
            const thread = await talkChannel.threads.create({
                name: `Recrutment ${applyDisplayName}`,
            });

            // Add reactions for votes
            const threadInital = await thread.fetchStarterMessage();
            threadInital?.react("👍");
            threadInital?.react("👎");
            await thread.send({
                content: `<#${applyChannel.id}>`,
                embeds: [
                    {
                        fields: embedsFromForm(message.embeds.at(0)?.fields),
                    },
                ],
            });

            const { row, accept, decline } = generateControlActionRow();

            // Post recrutment controls in admin channel
            const controls = await message.reply({ components: [row] });
            const result = await controls.awaitMessageComponent();

            let accepted = false;

            if (result.customId === "accept") {
                accepted = true;

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

            // Send result in thread
            await thread.send({
                content: accepted ? "Accepté ✅" : "Refusé ❌",
            });
            await threadInital?.react(accepted ? "✅" : "❌");
            thread.setArchived(true, result.customId === "accept" ? "accepted" : "refused");

            // Archivate channel
            applyChannel.setParent(ARCHIVE_ID);
        }
    });
