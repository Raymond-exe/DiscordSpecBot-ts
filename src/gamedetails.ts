import { Specifications } from "./hardware";

export interface GameDetails {
    readonly name: String;
    readonly market: String;
    readonly link: String;
    readonly container?: any;

    requirements: {
        minimum: Specifications,
        recommended: Specifications
    };
}
