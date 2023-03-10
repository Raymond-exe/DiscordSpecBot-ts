import { GameDetails } from "../games/gamedetails";
import { User } from "./user";

// RAM & diskSpace are expressed in gigabytes
export interface Specifications {
    readonly parent?: GameDetails | User;
    readonly CPU: Hardware | null;
    readonly GPU: Hardware | null;
    readonly RAM: number;
    diskSpace?: number; // not entered for Users, too invasive
    OS?: string; // same caveat as diskSpace
    directX?: 9 | 10 | 11 | 12; // who cares about 12 ultimate
    notes?: string;
}

export interface SpecsComparison {
    readonly CPU: number;
    readonly GPU: number;
    readonly RAM: number;
    readonly overall: boolean;
    notes?: string;
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
