import { DefineEvent } from "../utils/decorators/DefineEvent";
import { BaseEvent } from "../structures/BaseEvent";
import { Presence } from "discord.js";

@DefineEvent("ready")
export class ReadyEvent extends BaseEvent {
    public async execute(): Promise<void> {
        await this.doPresence();
        this.client.logger.info(this.formatString("{username} is ready to serve {users.size} users on {guilds.size} guilds in " +
        "{textChannels.size} text channels and {voiceChannels.size} voice channels!"));
    }

    private formatString(text: string): string {
        return text
            .replace(/{users.size}/g, (this.client.users.cache.size - 1).toString())
            .replace(/{textChannels.size}/g, this.client.channels.cache.filter(ch => ch.type === "GUILD_TEXT").size.toString())
            .replace(/{guilds.size}/g, this.client.guilds.cache.size.toString())
            .replace(/{username}/g, this.client.user?.username as string)
            .replace(/{voiceChannels.size}/g, this.client.channels.cache.filter(ch => ch.type === "GUILD_VOICE").size.toString());
    }

    private setPresence(random: boolean): Presence {
        const activity = Math.floor(Math.random() * this.client.config.presenceData.activities.length);
        const status = Math.floor(Math.random() * this.client.config.presenceData.status.length);
        return this.client.user!.setPresence({
            activities: [{ name: this.formatString(this.client.config.presenceData.activities[random ? activity : 0]), type: "PLAYING" }],
            status: this.client.config.presenceData.status[random ? status : 0]
        });
    }

    private async doPresence(): Promise<Presence | undefined> {
        try {
            return this.setPresence(false);
        } catch (e) {
            if (e.message !== "Shards are still being spawned.") this.client.logger.error(e);
            return undefined;
        } finally {
            setInterval(() => this.setPresence(true), this.client.config.presenceData.interval);
        }
    }
}
