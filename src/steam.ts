import fetch from 'node-fetch';
import { GameDetails } from './gamedetails';

const ALL_STEAMAPPS_URL = "http://api.steampowered.com/ISteamApps/GetAppList/v0002/";
const DETAILS_URL = "http://store.steampowered.com/api/appdetails?appids=";
const APP_URL = "https://store.steampowered.com/app/"

const STEAMAPPS_CACHE: SteamGame[] = [];

export class SteamGame {
    public readonly appid: Number;
    public readonly name: String;
    
    constructor (id: number, name: String) {
        this.appid = id;
        this.name = name;
    }

    // public getDetails(): GameDetails {
    //     const deets = getJSON(`${DETAILS_URL}${this.appid}`);
    //     // TODO this
    // }

    public getLink(): String {
        return `${APP_URL}${this.appid}`;
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

// updateSteamAppsCache();