import { Collection, ClientEvents, Client as OClient, Message } from "discord.js";
import { BotClient } from "../structures/BotClient";

export interface IEvent {
    readonly name: keyof ClientEvents;
    execute: (...args: any) => void;
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
    execute: (message: Message, args: string[]) => any;
}

export interface ICategoryMeta {
    name: string;
    hide: boolean;
    cmds: Collection<string, ICommandComponent>;
}

declare module "discord.js" {
    // @ts-expect-error Override typings
    export interface Client extends OClient {
        config: BotClient["config"];
        logger: BotClient["logger"];
        request: BotClient["request"];
        commands: BotClient["commands"];
        events: BotClient["events"];

        // eslint-disable-next-line @typescript-eslint/method-signature-style
        build(token: string): Promise<this>;
    }
}
