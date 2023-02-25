import { GameDetails } from "../games/gamedetails";
import { compare } from "./utils";

// TODO: find a usable API lol
// see: https://rapidapi.com/idirmosh/api/computer-components-api/

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

// RAM & diskSpace are expressed in gigabytes
export interface Specifications {
    readonly parent?: GameDetails | User;
    readonly CPU: Hardware | null;
    readonly GPU: Hardware | null;
    readonly RAM: number;
    diskSpace?: number; // not entered for Users, too invasive
    OS?: String; // same caveat as diskSpace
    directX?: 9 | 10 | 11 | 12; // who cares about 12 ultimate
    notes?: String;
}

export interface SpecsComparison {
    readonly CPU: number;
    readonly GPU: number;
    readonly RAM: number;
    readonly overall: boolean;
    notes?: String;
}

export interface Hardware {
    readonly name: string;
    readonly brand: string; // stuff like NVidia, Intel, AMD, etc
    readonly type: "CPU" | "GPU";
    readonly fields: {
        CPU?: {
            cores: number,
            threads: number,
            baseClock: number, // in GHz
            overClock: number, // in GHz
        },
        GPU?: {
            memory: number,   // in GB
            gpuClock: number, // in MHz
            memClock: number, // in MHz
        }
    }
}

// TODO verify this is effective
export function getHardwareScore(item: Hardware, cpuClock: 'base' | 'boosted' | 'avg' = 'base'): number {
    switch (item.type) {
        case "CPU":
            const cpu = item.fields.CPU;
            if (!cpu) throw new Error(`CPU Hardware fields are empty: ${item.fields.CPU}`);
            const clockrate = (cpuClock === 'base' ? cpu.baseClock : cpuClock === 'boosted' ? cpu.overClock : (cpu.baseClock+cpu.overClock)/2.0);
            return cpu.cores * cpu.threads * clockrate;
        case "GPU":
            const gpu = item.fields.GPU;
            if (!gpu) throw new Error(`GPU Hardware fields are empty: ${item.fields.CPU}`);
            return gpu.gpuClock + (gpu.memory*gpu.memClock);
        default:
            throw new Error(`Unknown hardware type: ${item.type}`);
    }
}
