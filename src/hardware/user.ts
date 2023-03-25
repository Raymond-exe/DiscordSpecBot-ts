import { client } from "../app";
import { DOC_KEYS as KEYS, userCollection } from "../firebase";
import { GameDetails } from "../games/gamedetails";
import { Specifications, SpecsComparison } from "./hardware";
import { compare } from "./utils";

export class User {
    public readonly discordId: number;
    public specs: Specifications;

    constructor(discordId: number, specs: Specifications) {
        this.discordId = discordId;
        this.specs = specs;
        this.specs.parent = this;
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

    public getName(): string {
        const cache = client.users.cache;
        if (cache.has(this.discordId.toString())) {
            return cache.get(this.discordId.toString()).username;
        } else {
            throw new Error (`User not found / not cached: <@!${this.discordId}>`);
        }
    }

    public update(): boolean {
        const document = userCollection().doc(this.discordId.toString());
        // TODO function to update firestore
        // return true if successful
        return false;
    }

    public static async getUser(userId: number): Promise<User> {
        const document = await userCollection().doc(userId.toString()).get();

        if (!document) {
            return null;
        }

        const foundUser = new User(userId, {
            CPU: {
                name: get(KEYS.CPU.NAME),
                type: 'CPU',
                fields: {
                    CPU: {
                        cores: get(KEYS.CPU.CORES),
                        threads: get(KEYS.CPU.THREADS),
                        baseClock: get(KEYS.CPU.BASE_CLOCK),
                        overClock: get(KEYS.CPU.OVERCLOCK),
                    }
                }

            },
            GPU: {
                name: get(KEYS.GPU.NAME),
                type: 'GPU',
                fields: {
                    GPU: {
                        memory: get(KEYS.GPU.MEMORY),
                        memClock: get(KEYS.GPU.MEMORY_CLOCK),
                        gpuClock: get(KEYS.GPU.GPU_CLOCK),
                    }
                }
            },
            RAM: get(KEYS.RAM),
            notes: get(KEYS.NOTES),
        });

        return foundUser;

        function get(key: string) {
            return document.get(key);
        }
    }
}
