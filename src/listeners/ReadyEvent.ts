import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";

@DefineListener("ready")
export class ReadyEvent extends BaseListener {
    public async execute(): Promise<void> {
        this.client.logger.info(this.formatString("{username} is ready to serve {users.size} users on {guilds.size} guilds in " +
        "{textChannels.size} text channels and {voiceChannels.size} voice channels!"));
        this.client.user?.setPresence({
            activity: { name: this.formatString(this.client.config.presenceData.activities[0]), type: "PLAYING" },
            status: this.client.config.presenceData.status[0]
        }).then(() => {
            this.client.setInterval(async () => {
                const status = Math.floor(Math.random() * this.client.config.presenceData.status.length);
                const activity = Math.floor(Math.random() * this.client.config.presenceData.activities.length);
                await this.client.user?.setPresence({
                    activity: { name: this.formatString(this.client.config.presenceData.activities[activity]), type: "PLAYING" },
                    status: this.client.config.presenceData.status[status]
                });
            }, this.client.config.presenceData.interval);
        }).catch(e => { if (e.message !== "Shards are still being spawned.") this.client.logger.error(e); });
    }

    public formatString(text: string): string {
        return text
            .replace(/{users.size}/g, (this.client.users.cache.size - 1).toString())
            .replace(/{textChannels.size}/g, this.client.channels.cache.filter(ch => ch.type === "text").size.toString())
            .replace(/{guilds.size}/g, this.client.guilds.cache.size.toString())
            .replace(/{username}/g, this.client.user?.username as string)
            .replace(/{voiceChannels.size}/g, this.client.channels.cache.filter(ch => ch.type === "voice").size.toString());
    }
}
