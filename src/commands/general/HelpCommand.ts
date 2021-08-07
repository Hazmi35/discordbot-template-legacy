import { BaseCommand } from "../../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    aliases: ["commands", "cmds", "info"],
    name: "help",
    description: "Shows the help menu or help for specific command.",
    usage: "{prefix}help [command]"
})
export class HelpCommand extends BaseCommand {
    public async execute(message: Message, args: string[]): Promise<void> {
        const command = this.client.commands.get(args[0]) ?? this.client.commands.get(this.client.commands.aliases.get(args[0])!);
        if (command) {
            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`Help for ${command.meta.name} command`)
                        .setThumbnail("https://hzmi.xyz/assets/images/question_mark.png")
                        .addField("Name", `\`${command.meta.name}\``, true)
                        .addField("Description", `\`${command.meta.description}\``, true)
                        .addField("Aliases", Number(command.meta.aliases?.length) > 0 ? command.meta.aliases?.map(c => `\`${c}\``).join(", ") as string : "None.", true)
                        .addField("Usage", `\`${command.meta.usage?.replace(/{prefix}/g, this.client.config.prefix)}\``, false)
                        .setColor("#00FF00")
                        .setTimestamp()
                        .setFooter(`<> = required | [] = optional ${command.meta.devOnly ? "(Only my developers can use this command)" : ""}`, "https://hzmi.xyz/assets/images/390511462361202688.png")
                ]
            });
        } else {
            const embed = new MessageEmbed()
                .setTitle("Help Menu")
                .setColor("#00FF00")
                .setThumbnail(message.client.user?.displayAvatarURL() as string)
                .setTimestamp()
                .setFooter(`${this.client.config.prefix}help <command> to get more info on a specific command!`, "https://hzmi.xyz/assets/images/390511462361202688.png");
            for (const category of [...this.client.commands.categories.values()]) {
                const isDev = this.client.config.devs.includes(message.author.id); // note: add function to core
                const cmds = category.cmds.filter(c => isDev ? true : !c.meta.devOnly).map(c => `\`${c.meta.name}\``);
                if (cmds.length === 0) continue;
                if (category.hide && !isDev) continue; // This hides category that is want to be hided from the meta
                embed.addField(`**${category.name}**`, cmds.join(", "));
            }
            message.channel.send({ embeds: [embed] }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        }
    }
}
