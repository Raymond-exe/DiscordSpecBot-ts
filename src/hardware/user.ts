import { GameDetails } from "../games/gamedetails";
import { Specifications, SpecsComparison } from "./hardware";
import { compare } from "./utils";
import { Firestore } from "@google-cloud/firestore";

export class User {
    public readonly discordId: number;
    public name: string; // maybe change this to a method to update dynamically instead of caching?
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
        const rec = this.isBetterThan(game.requirements.recommended);
        if (rec.overall) {
            rec.notes = `Recommended specifications for ${game.name}`;
            return rec;
        } else {
            const min = this.isBetterThan(game.requirements.minimum);
            min.notes = `Minimum specifications for ${game.name}`;
            return min;
        }
    }
}

// TODO firestore logic
