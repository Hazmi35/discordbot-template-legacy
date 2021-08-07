import { ClientOptions, ClientPresenceStatus, Intents, LimitedCollection, Options, UserResolvable } from "discord.js";

export const defaultPrefix = "$";
export const devs: UserResolvable[] = ["290159952784392202"]; // NOTE: Please change this
export const clientOptions: ClientOptions = {               // https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
    allowedMentions: { parse: ["users"], repliedUser: true },
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS],
    makeCache: Options.cacheWithLimits({
        MessageManager: { // Sweep messages every 5 minutes, removing messages that have not been edited or created in the last 3 hours
            maxSize: Infinity,
            sweepInterval: 300, // 5 Minutes
            sweepFilter: LimitedCollection.filterByLifetime({
                lifetime: 10800 // 3 Hours
            })
        },
        ThreadManager: { // Sweep threads every 5 minutes, removing threads that have been archived in the last 3 hours
            maxSize: Infinity,
            sweepInterval: 300, // 5 Minutes
            sweepFilter: LimitedCollection.filterByLifetime({
                lifetime: 10800, // 3 Hours
                getComparisonTimestamp: e => e.archiveTimestamp!,
                excludeFromSweep: e => !e.archived
            })
        }
    }),
    retryLimit: 3
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
