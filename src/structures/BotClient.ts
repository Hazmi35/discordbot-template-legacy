
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Client, ClientOptions } from "discord.js";
import got from "got";
import { resolve } from "path";
import * as config from "../config";
import { CommandManager } from "../utils/CommandManager";
import { createLogger } from "../utils/Logger";
import { formatMS } from "../utils/formatMS";
import { EventsLoader } from "../utils/EventsLoader";

export class BotClient extends Client {
    public readonly config = config;
    public readonly logger = createLogger("main", "en-US", "shard", this.shard?.ids[0], this.config.isDev);
    public readonly request = got;
    public readonly commands = new CommandManager(this, resolve(__dirname, "..", "commands"));
    public readonly events = new EventsLoader(this, resolve(__dirname, "..", "events"));

    public constructor(opt: ClientOptions) { super(opt); }

    public async build(token: string): Promise<this> {
        const start = Date.now();
        this.events.load();
        this.on("ready", async () => {
            await this.commands.load();
            this.logger.info(`Ready took ${formatMS(Date.now() - start)}`);
        });
        await this.login(token);
        return this;
    }
}
