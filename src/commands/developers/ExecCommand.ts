import { BaseCommand } from "../../structures/BaseCommand";
import { exec, spawn } from "child_process";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["$", "bash", "execute"],
    cooldown: 0,
    description: "Executes bash command",
    devOnly: true,
    name: "exec",
    usage: "{prefix}exec [\"logs\"] <bash>"
})
export class ExecCommand extends BaseCommand {
    public async execute(message: Message, args: string[]): Promise<any> {
        if (!args[0]) return message.channel.send("Please provide a command to execute!");

        if (args[0] === "logs") {
            args.shift();

            if (!args[0]) return message.channel.send("Please provide a command to execute!");

            await message.channel.send(`❯_ ${args.join(" ")} (as Log)`);
            const ls = spawn(args.shift()!, args, { shell: true, windowsHide: true })
                .on("spawn", () => {
                    void message.channel.send("**Log process spawned**");
                })
                .on("close", (code, signal) => {
                    void message.channel.send(`**Log process closed with code ${code!}, signal ${signal!}**`);
                })
                .on("error", err => {
                    void message.channel.send(`**An error occured on the log process**\n\`\`\`${err.message}\`\`\``);
                });

            ls.stdout.on("data", async data => {
                const pages = this.paginate(String(data), 1950);
                for (const page of pages) {
                    await message.channel.send(`\`\`\`\n${page}\`\`\``);
                }
            });

            ls.stderr.on("data", async data => {
                const pages = this.paginate(String(data), 1950);
                for (const page of pages) {
                    await message.channel.send(`\`\`\`\n${page}\`\`\``);
                }
            });
        } else {
            const m = await message.channel.send(`❯_ ${args.join(" ")}`);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            exec(args.join(" "), async (e: any, stdout: any, stderr: any) => {
                if (e) return m.edit(`\`\`\`js\n${e.message}\`\`\``);
                if (!stderr && !stdout) return m.edit("Executed without result.");
                if (stdout) {
                    const pages = this.paginate(stdout, 1950);
                    for (const page of pages) {
                        await message.channel.send(`\`\`\`\n${page}\`\`\``);
                    }
                }
                if (stderr) {
                    const pages = this.paginate(stderr, 1950);
                    for (const page of pages) {
                        await message.channel.send(`\`\`\`\n${page}\`\`\``);
                    }
                }
            });
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
