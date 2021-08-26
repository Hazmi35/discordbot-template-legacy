import { IEvent } from "../../typings";
import { BotClient } from "../../structures/BotClient";

export function DefineEvent(name: IEvent["name"]): any {
    return function decorate<T extends IEvent>(target: new (...args: any[]) => T): new (client: BotClient) => T {
        return new Proxy(target, {
            construct: (ctx, [client]): T => new ctx(client, name)
        });
    };
}
