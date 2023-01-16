import { Hardware } from "./hardware";

export function compare(h1: Hardware, h2: Hardware): number {
    if (h1.type !== h2.type) {
        throw Error(`Cannot compare ${h1.name} to ${h2.name}! (${h1.type} vs ${h2.type})`);
    }
    const diff = h1.score - h2.score;
    return diff / Math.abs(diff);
}

export class Parse {
    public static cpu(raw: String): Hardware {
        // TODO this
    }

    public static gpu(raw: String): Hardware {
        // TODO this
    }

    public static ram(raw: String): number {
        // TODO this
    }

    public static directx(raw: String): number {
        // TODO this
    }
}
