import { Hardware, Specifications } from "../hardware/hardware";

export interface GameDetails {
    readonly name: string;
    readonly market: string;
    readonly link: string;
    readonly parent?: any;

    requirements: {
        minimum: Specifications,
        recommended: Specifications
    };
}
