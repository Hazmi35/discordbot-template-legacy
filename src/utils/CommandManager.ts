import { promises as fs } from "fs";
import { resolve, parse } from "path";
import { Collection, Message, Snowflake, TextChannel } from "discord.js";
import { BotClient } from "../structures/BotClient";
import { ICommandComponent, ICategoryMeta } from "../typings";

export class CommandManager extends Collection<string, ICommandComponent> {
    public readonly categories: Collection<string, ICategoryMeta> = new Collection();
    public readonly aliases: Collection<string, string> = new Collection();
    private readonly cooldowns: Collection<string, Collection<Snowflake, number>> = new Collection();
    public constructor(public client: BotClient, private readonly path: string) { super(); }

    public load(): void {
        fs.readdir(resolve(this.path))
            .then(async categories => {
                this.client.logger.info(`Found ${categories.length} categories, registering...`);
                for (const category of categories) {
                    const meta = await import(resolve(this.path, category, "category.meta.json"));
                    this.categories.set(category, meta);
                    this.client.logger.info(`Registering ${category} category...`);
                    await fs.readdir(resolve(this.path, category))
                        .then(files => files.filter(f => f !== "category.meta.json"))
                        .then(async files => {
                            let disabledCount = 0;
                            this.client.logger.info(`Found ${files.length} of commands in ${category}, loading...`);
                            for (const file of files) {
                                const path = resolve(this.path, category, file);
                                const command = await this.import(path, this.client, { category, path });
                                if (command === undefined) throw new Error(`File ${file} is not a valid command file`);
                                command.meta = Object.assign(command.meta, { path, category });
                                if (Number(command.meta.aliases?.length) > 0) command.meta.aliases?.forEach(alias => this.aliases.set(alias, command.meta.name));
                                this.set(command.meta.name, command);
                                this.client.logger.info(`Command ${command.meta.name} from ${category} category is now loaded.`);
                                if (command.meta.disable) disabledCount++;
                            }
                            return { disabledCount, files };
                        })
                        .then(data => {
                            this.categories.set(category, Object.assign(meta, { cmds: this.filter(({ meta }) => meta.category === category) }));
                            this.client.logger.info(`Done loading ${data.files.length} commands in ${category} category.`);
                            if (data.disabledCount !== 0) this.client.logger.info(`${data.disabledCount} out of ${data.files.length} commands in ${category} category is disabled.`);
                        })
                        .catch(err => this.client.logger.error("CMD_LOADER_ERR:", err))
                        .finally(() => this.client.logger.info(`Done registering ${category} category.`));
                }
            })
            .catch(err => this.client.logger.error("CMD_LOADER_ERR:", err))
            .finally(() => this.client.logger.info("All categories has been registered."));
    }

    public async handle(message: Message): Promise<any> {
        const args = message.content.substring(this.client.config.prefix.length).trim().split(/ +/);
        const cmd = args.shift()?.toLowerCase();
        const command = this.get(cmd!) ?? this.get(this.aliases.get(cmd!)!);
        if (!command || command.meta.disable) return undefined;
        if (!this.cooldowns.has(command.meta.name)) this.cooldowns.set(command.meta.name, new Collection());
        const now = Date.now();
        const timestamps = this.cooldowns.get(command.meta.name);
        const cooldownAmount = (command.meta.cooldown ?? 3) * 1000;
        if (timestamps?.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                message.channel.send(`**${message.author.username}**, please wait **${timeLeft.toFixed(1)}** cooldown time.`).then(msg => {
                    setTimeout(() => msg.delete(), 3500);
                }).catch(e => message.client.logger.error("PROMISE_ERR:", e));
                return undefined;
            }

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        } else {
            timestamps?.set(message.author.id, now);
            if (this.client.config.devs.includes(message.author.id)) timestamps?.delete(message.author.id);
        }
        try {
            if (command.meta.devOnly && !this.client.config.devs.includes(message.author.id)) return undefined;
            return command.execute(message, args);
        } catch (e) {
            this.client.logger.error("COMMAND_HANDLER_ERR:", e);
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            if (command.meta.devOnly && !this.client.config.devs.includes(message.author.id)) return undefined;
            this.client.logger.info(
                `${message.author.tag} [${message.author.id}] is using ${command.meta.name} command from ${command.meta.category!} category ` +
                `on #${(message.channel as TextChannel).name} [${message.channel.id}] in guild: ${message.guild!.name} [${message.guild!.id}]`
            );
        }
    }

    private async import(path: string, ...args: any[]): Promise<ICommandComponent | undefined> {
        const file = (await import(resolve(path)).then(m => m[parse(path).name]));
        return file ? new file(...args) : undefined;
    }
}
