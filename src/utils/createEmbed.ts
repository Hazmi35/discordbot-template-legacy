import { ColorResolvable, MessageEmbed } from "discord.js";
import { embedColor } from "../config";

type hexColorsType = "info" | "warn" | "error" | "success";
const hexColors: Record<hexColorsType, string> = {
    info: embedColor as string,
    warn: "FFFA00",
    error: "FF0000",
    success: "00FF00"
};

export function createEmbed(type: hexColorsType, message?: string): MessageEmbed {
    const embed = new MessageEmbed()
        .setColor(hexColors[type] as ColorResolvable);

    if (message) embed.setDescription(message);
    return embed;
}
