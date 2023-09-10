import type { Message } from "discord.js";

declare module "discord.js" {
    interface Client {
        commands: Collection<unknown, Command>;
    }

    export interface Command {
        name: string;
        description: string;
        execute: (message: Message, args: string[]) => SomeType;
    }
}
