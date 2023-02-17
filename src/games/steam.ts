import fetch from 'node-fetch';
import fuzzysort from 'fuzzysort';
import { GameDetails } from './gamedetails';
import { Specifications } from '../hardware/hardware';
import { Parse } from '../hardware/utils';

const ALL_STEAMAPPS_URL = 'http://api.steampowered.com/ISteamApps/GetAppList/v0002/';
const DETAILS_URL = 'http://store.steampowered.com/api/appdetails?appids=';
const APP_URL = 'https://store.steampowered.com/app/';

const STEAMAPPS_CACHE: SteamGame[] = [];
const SEARCH_CACHE: Map<String, SteamGame[]> = new Map();

export class SteamGame {
    public readonly appid: Number;
    public readonly name: String;
    private fetchedData: any;

    constructor (id: number, name: String) {
        this.appid = id;
        this.name = name;
    }

    public async gameDetails(): Promise<GameDetails> {
        return {
            name: this.name,
            market: 'Steam',
            link: this.getLink(),
            container: this,

            // TODO this below
            requirements: await this.getSpecs()
        };
    }

    public async getSpecs(): Promise<{minimum: Specifications, recommended: Specifications}> {
        const deets = await this.getDetails();
        if (deets) {
            const rawRequirements = deets['pc_requirements'];
            const requirements = {
                minimum: new Map<String, String>(),
                recommended: new Map<String, String>()
            }

            if (rawRequirements['minimum']) {
                let rawMin = rawRequirements['minimum'];
                rawMin = rawMin.replaceAll(/<br>/gm, ';').replaceAll(/<.*?>/gm, '').split(';');
                requirements.minimum.set('Store Page', `${this.getLink()}`);
                rawMin.forEach(field => {
                    if (field.includes('Minimum') || !field.trim()) return;
                    if (!field.includes(':')) {
                        requirements.minimum.set(field, field);
                    } else {
                        field = field.split(':');
                        requirements.minimum.set(field[0].trim(), field[1].trim());
                    }
                });
            }

            if (rawRequirements['recommended']) {
                let rawRec = rawRequirements['recommended'];
                rawRec = rawRec.replaceAll(/<br>/gm, ';').replaceAll(/<.*?>/gm, '').split(';');
                requirements.recommended.set('Store Page', `${this.getLink()}`);
                rawRec.forEach(field => {
                    if (field.includes('Recommended') || !field.trim()) return;
                    if (!field.includes(':')) {
                        requirements.recommended.set(field, field);
                    } else {
                        field = field.split(':');
                        requirements.recommended.set(field[0].trim(), field[1].trim());
                    }
                });
            }

            if (requirements.minimum.size === 0 && requirements.recommended.size === 0) {
                throw new Error(`Failed to fetch requirements. Steam app: ${this.getLink()}`);
            }

            return {
                minimum: await mapToSpecs(requirements.minimum),
                recommended: await mapToSpecs(requirements.recommended)
            };
        } else {
            throw Error(`${this.name} (${this.getLink()}) is hidden.`);
        }
    }

    public getLink(): String {
        return `${APP_URL}${this.appid}`;
    }

    private async getDetails() {
        if (this.fetchedData) {
            return (this.fetchedData.success ? this.fetchedData.data : false);
        } else {
            this.fetchedData = (await getJSON(`${DETAILS_URL}${this.appid}`))[`${this.appid}`];
            return this.getDetails();
        }
    }
}

async function mapToSpecs(map: Map<String, String>): Promise<Specifications> {
    const cpu = getOrDefault('Processor');
    const gpu = getOrDefault('Graphics');
    const ram = getOrDefault('Memory');
    const os = getOrDefault('OS');
    const dx = Parse.directx(getOrDefault('DirectX'));
    const disk = getOrDefault('Storage');
    const notes = getOrDefault('Additional Notes');

    const specs: Specifications = {
        CPU: cpu ? await Parse.cpu(cpu) : null,
        GPU: gpu ? await Parse.gpu(gpu) : null,
        RAM: ram ? Parse.ram(ram) : 0,
    }
    if (os) specs.OS = os;
    if (dx) specs.directX = dx;
    if (disk && Number(disk)) specs.diskSpace = Number(disk);
    if (notes) specs.notes = notes;

    return specs;

    function getOrDefault(key: String) {
        return (map.has(key) ? map.get(key) : false)
    }
}

updateSteamAppsCache();
async function updateSteamAppsCache() {
    const response = await getJSON(ALL_STEAMAPPS_URL);
    const apps = response['applist']['apps'];

    // clears cache
    STEAMAPPS_CACHE.length = 0;
    apps.forEach(steamapp => {
        if (steamapp.name) { // only adds apps if their name isn't empty
            STEAMAPPS_CACHE.push(new SteamGame(steamapp.appid, steamapp.name));
        }
    });
}

export function searchSteamApps(query: string, querySize: number = 10): SteamGame[] {
    if (!SEARCH_CACHE.has(query.toLowerCase())) {
        const results = fuzzysort.go(query, STEAMAPPS_CACHE, { key: 'name' });
        const parsedResults = [];

        for (let i = 0; i < querySize; i++) {
            parsedResults.push(results[i].obj);
        }

        SEARCH_CACHE.set(query.toLowerCase(), parsedResults);
    }
    return SEARCH_CACHE.get(query.toLowerCase());

}

async function getJSON(URL: String) {
    return await (await fetch(`${URL}`)).json();
}

// Just a temporary testing function
function randomGame(): SteamGame {
    return STEAMAPPS_CACHE[Math.floor(STEAMAPPS_CACHE.length*Math.random())];
}


function test() {
    updateSteamAppsCache().then(() => {
        let game = randomGame();
        console.log(game.getLink());
        game.getSpecs().then(specs => console.log(specs));
    });
}
// test();
