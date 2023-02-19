import { Hardware, getHardwareScore, Specifications } from "./hardware";
import fetch from 'node-fetch';
import HtmlTableToJson from 'html-table-to-json';

const SEARCH_URL = {
    GPU: 'https://www.techpowerup.com/gpu-specs/?ajaxsrch=',
    CPU: 'https://www.techpowerup.com/cpu-specs/?ajaxsrch='
}

export function compare(h1: Hardware, h2: Hardware): number {
    if (h1.type !== h2.type) {
        throw Error(`Cannot compare ${h1.name} to ${h2.name}! (${h1.type} vs ${h2.type})`);
    }
    const diff = getHardwareScore(h1) - getHardwareScore(h2);
    return diff / Math.abs(diff);
}

export class Parse {
    public static async cpu(raw: String): Promise<Hardware> {
        const result = (await searchHardware('CPU', raw)[0]);
        return new Promise(resolve => {
            console.log(`Result: ${result}`);
            while (!result) {}
            resolve(result);
        })
    }

    public static async gpu(raw: String): Promise<Hardware> {
        const result = (await searchHardware('GPU', raw)[0]);
        return new Promise(resolve => {
            console.log(`Result: ${result}`);
            resolve(result);
        });
    }

    public static ram(raw: String): number {
        const ram = Number(raw.replaceAll(/\D+/g, ''));
        return ram ? (raw.toLowerCase().includes('mb') ? ram / 1000.0 : ram) : 0;
    }

    public static directx(raw: String | false): 9 | 10 | 11 | 12 | false {
        if (!raw) return false;
        const dx = Number(raw.replaceAll(/\D+/g, ''));
        return dx === 9 || dx === 10 || dx === 11 || dx === 12 ? dx : false;
    }
}

function isEmpty(specs: Specifications): boolean {
    return !specs.CPU && !specs.GPU && !specs.RAM && !specs.OS && !specs.directX;
}

export async function searchHardware(type: 'CPU' | 'GPU', query: String, querySize: number = 10): Promise<Hardware[]> {
    const url = SEARCH_URL[type];
    query = query.replaceAll(' ', '%20');

    const rawHtml = await (await fetch(`${url}${query}`)).text();

    const results = HtmlTableToJson.parse(rawHtml).results[0];
    const hardwareOutput: Hardware[] = [];

    switch (type) {
        case 'CPU':
            for (let item in results) {
                item = results[item]
                const cores = item['Cores'].split('/');
                if (cores.length === 1) cores.push(cores[0]);
                const clock = item['Clock'].split(' ');
                hardwareOutput.push({
                    name: item['Name'],
                    brand: null,
                    type: 'CPU',
                    fields: {
                        CPU: {
                            cores: Number(cores[0].trim()),
                            threads: Number(cores[1].trim()),
                            baseClock: Number(clock[0].trim()),
                            overClock: Number(clock[1].trim())
                        }
                    }
                });

                if (hardwareOutput.length >= querySize) {
                    break;
                }
            }

            break;
        case 'GPU':
            const vendors = getAllVendors();
            for (let item in results) {
                item = results[item];
                hardwareOutput.push({
                    name: item['Product Name'],
                    brand: vendors.shift(),
                    type: 'GPU',
                    fields: {
                        GPU: {
                            memory: Number(item['Memory'].split(' ')[0]),
                            gpuClock: Number(item['GPU clock'].split(' ')[0]),
                            memClock: Number(item['Memory clock'].split(' ')[0])
                        }
                    }
                });

                if (hardwareOutput.length >= querySize) {
                    break;
                }
            }

            break;
    }

    return hardwareOutput.reverse();

    function getAllVendors(flag: string = 'vendor-'): String[] {
        let html = rawHtml;
        let occurrences: String[] = [];
        while (html.includes(flag)) {
            let index = html.indexOf(flag) + flag.length;
            let end = html.indexOf('"', index);
            occurrences.push(html.substring(index, end));
            html = html.substring(end);
        }
        return occurrences;
    }
}
