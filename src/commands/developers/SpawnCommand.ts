import { ChildProcess, spawn } from "child_process";
import { Collection, Message, MessageEmbed } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    description: "Spawn process for executing bash commands",
    name: "spawn",
    usage: "{prefix}spawn <option>"
})
export class SpawnCommand extends BaseCommand {
    private readonly processes: Collection<string, ChildProcess> = new Collection();

    public async execute(message: Message, args: string[]): Promise<void> {
        const option = args.shift();

        if (option === "create") {
            const name = args.shift();
            if (!name) {
                void message.reply("Please, provide the process name");
                return;
            }
            if (!args.length) {
                void message.reply("Please, provide a command to execute");
                return;
            }
            if (this.processes.has(name)) {
                void message.reply("There's a running process with that name. Terminate it first, and then try again.");
                return;
            }

            await message.reply(`❯_ ${args.join(" ")}`);
            const process = spawn(args.shift()!, args, { shell: true, windowsHide: true })
                .on("spawn", () => {
                    void message.channel.send("**Log process spawned**");
                })
                .on("close", (code, signal) => {
                    this.processes.delete(name);
                    void message.channel.send(`**Log process closed with code ${code!}, signal ${signal!}**`);
                })
                .on("error", err => {
                    void message.channel.send(`**An error occured on the log process**\n\`\`\`${err.message}\`\`\``);
                });

            process.stdout.on("data", async data => {
                const pages = this.paginate(String(data), 1950);
                for (const page of pages) {
                    await message.channel.send(`\`\`\`\n${page}\`\`\``);
                }
            });
            process.stderr.on("data", async data => {
                const pages = this.paginate(String(data), 1950);
                for (const page of pages) {
                    await message.channel.send(`\`\`\`\n${page}\`\`\``);
                }
            });

            this.processes.set(name, process);
        } else if (option === "terminate") {
            const name = args.shift();
            if (!name) {
                void message.reply("Please, provide the process name");
                return;
            }
            if (!this.processes.has(name)) {
                void message.reply("There's no process with that name");
                return;
            }

            const process = this.processes.get(name);

            process?.kill("SIGTERM");
            this.processes.delete(name);

            void message.reply("Process terminated");
        } else {
            const embed = new MessageEmbed().setColor("#FF0000").setDescription("Invalid option. Valid options are `create` and `terminate`");

            void message.reply({ embeds: [embed] });
        }
    }

    private paginate(text: string, limit = 2000): any[] {
        const lines = text.trim().split("\n");
        const pages = [];
        let chunk = "";

        for (const line of lines) {
            if (chunk.length + line.length > limit && chunk.length > 0) {
                pages.push(chunk);
                chunk = "";
            }

            if (line.length > limit) {
                const lineChunks = line.length / limit;

                for (let i = 0; i < lineChunks; i++) {
                    const start = i * limit;
                    const end = start + limit;
                    pages.push(line.slice(start, end));
                }
            } else {
                chunk += `${line}\n`;
            }
        }

        if (chunk.length > 0) {
            pages.push(chunk);
        }

        return pages;
    }
}
