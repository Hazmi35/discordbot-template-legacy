import { Snowflake, Message, TextChannel, DMChannel, NewsChannel, Collection, ClientEvents, Client as OClient } from "discord.js";
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
    execute(message: IMessage, args: string[]): any;
}
export interface ICategoryMeta {
    name: string;
    hide: boolean;
    cmds: Collection<string, ICommandComponent>;
}

declare module "discord.js" {
    export interface Client extends OClient {
        config: BotClient["config"];
        logger: BotClient["logger"];
        request: BotClient["request"];
        commands: BotClient["commands"];
        listeners: BotClient["listeners"];

        public async build(token: string): Promise<BotClient>;
    }
}

export interface IMessage extends Message {
    public channel: ITextChannel | IDMChannel | INewsChannel;
    client: BotClient;
}
export interface ITextChannel extends TextChannel {
    lastMessageID: Snowflake | null;
    readonly lastMessage: IMessage | null;
    send(
        options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<IMessage>;
    send(
        options: (MessageOptions & { split: true | SplitOptions; content: StringResolvable }) | APIMessage,
    ): Promise<IMessage[]>;
    send(
        content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<IMessage>;
    send(content: StringResolvable, options?: MessageOptions & { split: true | SplitOptions }): Promise<IMessage[]>;
}

export interface IDMChannel extends DMChannel {
    lastMessageID: Snowflake | null;
    readonly lastMessage: IMessage | null;
    send(
        options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<IMessage>;
    send(
        options: (MessageOptions & { split: true | SplitOptions; content: StringResolvable }) | APIMessage,
    ): Promise<IMessage[]>;
    send(
        content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<IMessage>;
    send(content: StringResolvable, options?: MessageOptions & { split: true | SplitOptions }): Promise<IMessage[]>;
}

export interface INewsChannel extends NewsChannel {
    lastMessageID: Snowflake | null;
    readonly lastMessage: IMessage | null;
    send(
        options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<IMessage>;
    send(
        options: (MessageOptions & { split: true | SplitOptions; content: StringResolvable }) | APIMessage,
    ): Promise<IMessage[]>;
    send(
        content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<IMessage>;
    send(content: StringResolvable, options?: MessageOptions & { split: true | SplitOptions }): Promise<IMessage[]>;
}
