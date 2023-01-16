import fetch from 'node-fetch';
import { GameDetails } from './gamedetails';
import { Specifications } from './hardware';

const ALL_STEAMAPPS_URL = "http://api.steampowered.com/ISteamApps/GetAppList/v0002/";
const DETAILS_URL = "http://store.steampowered.com/api/appdetails?appids=";
const APP_URL = "https://store.steampowered.com/app/"

const STEAMAPPS_CACHE: SteamGame[] = [];

export class SteamGame {
    public readonly appid: Number;
    public readonly name: String;
    private fetchedData: any;
    
    constructor (id: number, name: String) {
        this.appid = id;
        this.name = name;
    }

    public async getSpecs(): Promise<void> /*Promise<{minimum: Specifications, recommended: Specifications}>*/ {
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
                    console.log(`Failed to fetch requirements. Raw: ${rawRequirements}`);
                } else {
                    console.log('Minimum Requirements:');
                    console.log(requirements.minimum);
                    console.log('Recommended Requirements:');
                    console.log(requirements.recommended);
                }

            } else {
                console.log(`${this.name} (${this.getLink()}) is hidden.`);
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

export async function updateSteamAppsCache() {
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

async function getJSON(URL: String) {
    return await (await fetch(`${URL}`)).json();
}

function randomGame(): SteamGame {
    return STEAMAPPS_CACHE[Math.floor(STEAMAPPS_CACHE.length*Math.random())];
}

updateSteamAppsCache().then(() => {
    randomGame().getSpecs();
});
