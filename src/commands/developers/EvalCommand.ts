/* eslint-disable @typescript-eslint/no-unused-vars, no-eval */
import { BaseCommand } from "../../structures/BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import { request } from "https";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { inspect } from "util";

@DefineCommand({
    aliases: ["ev", "js-exec", "e", "evaluate"],
    cooldown: 0,
    description: "Only the bot owner can use this command.",
    devOnly: true,
    name: "eval",
    usage: "{prefix}eval <some js code>"
})
export class EvalCommand extends BaseCommand {
    public async execute(message: Message, args: string[]): Promise<any> {
        const msg = message;
        const client = this.client;

        const embed = new MessageEmbed()
            .setColor("#00FF00")
            .addField("Input", `\`\`\`js\n${args.join(" ")}\`\`\``);

        try {
            let code = args.slice(0).join(" ");
            if (!code) return await message.channel.send("No js code was provided");
            let evaled;
            if (code.includes("--silent") && code.includes("--async")) {
                code = code.replace("--async", "").replace("--silent", "");
                await eval(`(async () => {
                            ${code}
                        })()`);
                return;
            } else if (code.includes("--async")) {
                code = code.replace("--async", "");
                evaled = await eval(`(async () => {
                            ${code}
                        })()`);
            } else if (code.includes("--silent")) {
                code = code.replace("--silent", "");
                await eval(code);
                return;
            } else {
                evaled = await eval(code);
            }
            if (typeof evaled !== "string") {
                evaled = inspect(evaled, {
                    depth: 0
                });
            }

            const output = EvalCommand.clean(evaled);
            if (output.length > 1024) {
                const hastebin = await EvalCommand.hastebin(output);
                embed.addField("Output", `${hastebin}.js`);
            } else { embed.addField("Output", `\`\`\`js\n${output}\`\`\``); }
            message.channel.send({ embeds: [embed] }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        } catch (e: any) {
            const error = EvalCommand.clean(e as string);
            if (error.length > 1024) {
                const hastebin = await EvalCommand.hastebin(error);
                embed.addField("Error", `${hastebin}.js`);
            } else { embed.setColor("#FF0000").addField("Error", `\`\`\`js\n${error}\`\`\``); }
            message.channel.send({ embeds: [embed] }).catch(e2 => this.client.logger.error("PROMISE_ERR:", e2));
        }
        return message;
    }

    private static clean(text: string): string {
        if (typeof text === "string") {
            return text
                .replace(new RegExp(process.env.DISCORD_TOKEN!, "g"), "[REDACTED]")
                .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`);
        }
        return text;
    }

    private static hastebin(text: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = request({ hostname: "bin.hzmi.xyz", path: "/documents", method: "POST", minVersion: "TLSv1.3" }, res => {
                let raw = "";
                res.on("data", chunk => raw += chunk);
                res.on("end", () => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (res.statusCode! >= 200 && res.statusCode! < 300) return resolve(`https://bin.hzmi.xyz/${JSON.parse(raw).key as string}`);
                    return reject(new Error(`[hastebin] Error while trying to send data to https://bin.hzmi.xyz/documents, ${res.statusCode!} ${res.statusMessage!}`));
                });
            }).on("error", reject);
            req.write(typeof text === "object" ? JSON.stringify(text, null, 2) : text);
            req.end();
        });
    }
}
