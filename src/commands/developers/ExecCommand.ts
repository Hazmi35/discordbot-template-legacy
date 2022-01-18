import { BaseCommand } from "../../structures/BaseCommand";
import { exec } from "child_process";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["$", "bash", "execute"],
    cooldown: 0,
    description: "Executes bash command",
    devOnly: true,
    name: "exec",
    usage: "{prefix}exec <bash>"
})
export class ExecCommand extends BaseCommand {
    public async execute(message: Message, args: string[]): Promise<any> {
        if (!args[0]) return message.channel.send("Please provide a command to execute!");

        const m: Message = await message.channel.send(`❯_ ${args.join(" ")}`);
        exec(args.join(" "), async (e: any, stdout: any, stderr: any) => {
            if (e) return m.edit(`\`\`\`js\n${(e as Error).message}\`\`\``);
            if (!stderr && !stdout) return m.edit("Executed without result.");
            if (stdout) {
                const pages = ExecCommand.paginate<string>(stdout as string, 1950);
                for (const page of pages) {
                    await message.channel.send(`\`\`\`\n${page}\`\`\``);
                }
            }
            if (stderr) {
                const pages = ExecCommand.paginate<string>(stderr as string, 1950);
                for (const page of pages) {
                    await message.channel.send(`\`\`\`\n${page}\`\`\``);
                }
            }
        });
    }

    private static paginate<T>(text: string, limit = 2000): T[] {
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

        return pages as unknown as T[];
    }
}
