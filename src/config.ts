import { ClientOptions, ClientPresenceStatus, Collection, Intents, UserResolvable } from "discord.js";

export const defaultPrefix = "$";
export const devs: UserResolvable[] = ["290159952784392202"]; // NOTE: Please change this
export const clientOptions: ClientOptions = {  // https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
    allowedMentions: { parse: ["users"] },
    restTimeOffset: 300,
    retryLimit: 3,
    makeCache: () => new Collection(),
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] // NOTE: Please use Intents that you will only need
};
export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;
export const prefix = isDev ? "d$" : "$";
export const presenceData = {
    activities: [
        "Hello, World!",
        "Watching {textChannels.size} of text channels in {guilds.size}",
        "Listening to {users.size} of users",
        "Hello there! I am {username}",
        `My default prefix is ${prefix}`
    ],
    status: ["online"] as ClientPresenceStatus[],
    interval: 60000
};
export const shardsCount: number | "auto" = "auto";
