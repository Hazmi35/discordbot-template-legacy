import { Snowflake, Message, Collection, ClientEvents } from "discord.js";
import { BotClient } from "../structures/BotClient";

export interface IListener {
    readonly name: keyof ClientEvents;
    execute(...args: any): void;
}

export interface ICommandComponent {
    meta: {
        aliases?: string[];
        cooldown?: number;
        disable?: boolean;
        readonly path?: string;
        devOnly?: boolean;
        description?: string;
        readonly category?: string;
        name: string;
        usage?: string;
    };
    execute(message: Message, args: string[]): any;
}

export interface ICategoryMeta {
    name: string;
    hide: boolean;
    cmds: Collection<string, ICommandComponent>;
}