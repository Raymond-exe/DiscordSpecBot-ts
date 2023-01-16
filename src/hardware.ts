// TODO: find a usable API lol
// see: https://rapidapi.com/idirmosh/api/computer-components-api/

import { GameDetails } from "./gamedetails";

export class User {
    public readonly discordId: number;
    public name: String; // maybe change this to a method to update dynamically instead of caching?
    public specs: Specifications;

    constructor(discordId: number, specs: Specifications) {
        this.discordId = discordId;
        this.specs = specs;
    }

    public isBetterThan(other: Specifications): SpecsComparison {
        // CPU evaluation
        const cpuEval = compare(this.specs.CPU, other.CPU);

        // GPU evaluation
        const gpuEval = compare(this.specs.GPU, other.GPU);

        // RAM eval... wait it's just a number
        const ramEval = this.specs.RAM - other.RAM;

        return {
            CPU: cpuEval,
            GPU: gpuEval,
            RAM: ramEval,
            overall: ( ramEval>=0 && (gpuEval>=0 || cpuEval>=0) ) // TODO get a min threshold for gpu/cpu failure compensation
        }
    }

    public canPlay(game: GameDetails): SpecsComparison {
        return this.isBetterThan(game.requirements);
    }
}

// RAM & diskSpace are expressed in gigabytes
export interface Specifications {
    readonly parent: GameDetails | User;
    readonly CPU: Hardware;
    readonly GPU: Hardware;
    readonly RAM: number;
    readonly diskSpace?: number; // not entered for Users, too invasive
}

export interface SpecsComparison {
    readonly CPU: number;
    readonly GPU: number;
    readonly RAM: number;
    readonly overall: boolean;
}

export interface Hardware {
    readonly name: String;
    readonly brand: String; // stuff like NVidia, Intel, AMD, etc
    readonly score: number; // used for ranking hardware
    readonly type: "CPU" | "GPU";
}

function compare(h1: Hardware, h2: Hardware): number {
    if (h1.type !== h2.type) {
        throw Error(`Cannot compare ${h1.name} to ${h2.name}! (${h1.type} vs ${h2.type})`);
    }
    const diff = h1.score - h2.score;
    return diff / Math.abs(diff);
}
