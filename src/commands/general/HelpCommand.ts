import { BaseCommand } from "../../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import { IMessage } from "../../typings";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    aliases: ["commands", "cmds", "info"],
    name: "help",
    description: "Shows the help menu or help for specific command.",
    usage: "{prefix}help [command]"
})
export class HelpCommand extends BaseCommand {
    public async execute(message: IMessage, args: string[]): Promise<void> {
        const command = message.client.commands.get(args[0]) ?? message.client.commands.get(message.client.commands.aliases.get(args[0])!);
        if (command) {
            message.channel.send(new MessageEmbed()
                .setTitle(`Help for ${command.meta.name} command`)
                .setThumbnail("https://hzmi.xyz/assets/images/question_mark.png")
                .addFields({ name: "Name", value: `\`${command.meta.name}\``, inline: true },
                    { name: "Description", value: command.meta.description, inline: true },
                    { name: "Aliases", value: `${Number(command.meta.aliases?.length) > 0 ? command.meta.aliases?.map(c => `\`${c}\``).join(", ") as string : "None."}`, inline: true },
                    { name: "Usage", value: `\`${command.meta.usage?.replace(/{prefix}/g, message.client.config.prefix) as string}\``, inline: false })
                .setColor("#00FF00")
                .setTimestamp()
                .setFooter(`<> = required | [] = optional ${command.meta.devOnly ? "(Only my developers can use this command)" : ""}`, "https://hzmi.xyz/assets/images/390511462361202688.png")).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        } else { // NOTE: Should we add hide option on commands so we can hide specific commands?
            const embed = new MessageEmbed()
                .setTitle("Help Menu")
                .setColor("#00FF00")
                .setThumbnail(message.client.user?.displayAvatarURL() as string)
                .setTimestamp()
                .setFooter(`${message.client.config.prefix}help <command> to get more info on a specific command!`, "https://hzmi.xyz/assets/images/390511462361202688.png");
            for (const category of message.client.commands.categories.array()) {
                const isDev = this.client.config.devs.includes(message.author.id); // note: add function to core
                const cmds = category.cmds.filter(c => isDev ? true : !c.meta.devOnly).map(c => `\`${c.meta.name}\``);
                if (cmds.length === 0) continue;
                if (category.hide && !isDev) continue; // This hides category that is want to be hided from the meta
                embed.addField(`**${category.name}**`, cmds.join(", "));
            }
            message.channel.send(embed).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        }
    }
}
