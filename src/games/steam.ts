import fetch from 'node-fetch';
import fuzzysort from 'fuzzysort';
import { GameDetails } from './gamedetails';
import { Specifications } from '../hardware/hardware';
import { Parse } from '../hardware/utils';

const ALL_STEAMAPPS_URL = 'http://api.steampowered.com/ISteamApps/GetAppList/v0002/';
const DETAILS_URL = 'http://store.steampowered.com/api/appdetails?appids=';
const APP_URL = 'https://store.steampowered.com/app/';
const FILTER_URL = 'https://store.steampowered.com/search/suggest?term={QUERY}&f=games&cc=US&l=english&excluded_content_descriptors%5B%5D=1&use_store_query=1&use_search_spellcheck=1';

const STEAMAPPS_CACHE: SteamGame[] = [];
const SEARCH_CACHE: Map<string, SteamGame[]> = new Map();
const THUMBNAIL_CACHE: Map<string, string> = new Map();

export class SteamGame {
    public readonly appid: Number;
    public readonly name: string;
    private fetchedData: any;

    constructor (id: number, name: string) {
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
                minimum: new Map<string, string>(),
                recommended: new Map<string, string>()
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

    public getLink(): string {
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

async function mapToSpecs(map: Map<string, string>): Promise<Specifications> {
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

    function getOrDefault(key: string) {
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

export async function searchSteamApps(query: string, querySize: number = 10): Promise<SteamGame[]> {
    if (!SEARCH_CACHE.has(query.toLowerCase())) {
        const results = fuzzysort.go(query, STEAMAPPS_CACHE, { key: 'name' });
        const parsedResults = [];
        const filter = await getFilter(query);

        for (let i = 0; i < querySize && i < results.length; i++) {
            if (filter.includes(`${results[i].obj.appid}`))
                parsedResults.push(results[i].obj);
            else
                querySize++;
        }

        SEARCH_CACHE.set(query.toLowerCase(), parsedResults);

        // extract thumbnail image for top result
        const imgIndex = filter.indexOf('img src="') + 9;
        const thumbnailUrl = filter.substring(imgIndex, filter.indexOf('"', imgIndex));
        THUMBNAIL_CACHE.set(query, thumbnailUrl);
    }
    return SEARCH_CACHE.get(query.toLowerCase());
}

export async function getSteamThumbnailURL(query: string): Promise<string> {
    if (!THUMBNAIL_CACHE.has(query)) {
        const filter = await getFilter(query);
        const imgIndex = filter.indexOf('img src="') + 9;
        const thumbnailUrl = filter.substring(imgIndex, filter.indexOf('"', imgIndex));
        THUMBNAIL_CACHE.set(query, thumbnailUrl);
    }
    return THUMBNAIL_CACHE.get(query);
}

async function getFilter(query: string) {
    return await (await fetch(FILTER_URL.replace('{QUERY}', query.replaceAll(' ', '+')))).text();
}

async function getJSON(URL: string) {
    return await (await fetch(`${URL}`)).json();
}

// Just a temporary testing function
function randomGame(): SteamGame {
    return STEAMAPPS_CACHE[Math.floor(STEAMAPPS_CACHE.length*Math.random())];
}


function test() {
    updateSteamAppsCache().then(() => {
        let game = searchSteamApps('Halo: Wars');
    });
}
test();
