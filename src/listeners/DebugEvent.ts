import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";

@DefineListener("debug")
export class DebugEvent extends BaseListener {
    public async execute(message: string): Promise<void> {
        this.client.logger.debug(message);
    }
}
