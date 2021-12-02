import { BaseEvent } from "../structures/BaseEvent";
import { CustomError } from "../utils/CustomError";
import { DefineEvent } from "../utils/decorators/DefineEvent";

@DefineEvent("error")
export class ErrorEvent extends BaseEvent {
    public execute(error: string): void {
        this.client.logger.error(this.client.logger.error(CustomError("CLIENT_ERROR:", error)));
    }
}
