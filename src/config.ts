import { ActivityType, ClientOptions, ClientPresenceStatus, ColorResolvable, Intents, LimitedCollection, Options, ShardingManagerMode, UserResolvable } from "discord.js";

export const defaultPrefix = "$";
export const devs: UserResolvable[] = ["290159952784392202"]; // NOTE: Please change this
export const clientOptions: ClientOptions = {               // https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
    allowedMentions: { parse: ["users"], repliedUser: true },
    intents: [ // NOTE: Please change this to only Intents you need, but you can use "Object.values(Intents.FLAGS)" for all Intents
        Intents.FLAGS.DIRECT_MESSAGES, // NOTE: Privileged Intents (GUILD_MEMBERS & GUILD_PRESENCES) is not included by default with this template
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    makeCache: Options.cacheWithLimits({
        ...Options.defaultMakeCacheSettings,
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
    partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
    retryLimit: 3
};
export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;
export const prefix = isDev ? "d$" : "$";
export const embedColor = "00FF00" as ColorResolvable;
interface IpresenceData {
    activities: { name: string; type: ActivityType }[];
    status: ClientPresenceStatus[];
    interval: number;
}
export const presenceData: IpresenceData = {
    activities: [
        { name: "Hello, World!", type: "PLAYING" },
        { name: "{textChannels.size} of text channels in {guilds.size} guilds", type: "WATCHING" },
        { name: "{users.size} of users", type: "LISTENING" },
        { name: "Hello there! I am {username}", type: "PLAYING" },
        { name: `My default prefix is ${prefix}`, type: "PLAYING" }
    ],
    status: ["online"] as ClientPresenceStatus[],
    interval: 60000
};
export const shardsCount: number | "auto" = "auto";
export const shardingMode: ShardingManagerMode = "worker";
