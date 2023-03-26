import { initializeApp } from 'firebase-admin/app';
import { CollectionReference, Firestore, getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

export const DOC_KEYS = {
    CPU: {
        NAME: 'cpu.name',
        CORES: 'cpu.cores',
        THREADS: 'cpu.threads',
        BASE_CLOCK: 'cpu.baseClock',
        OVERCLOCK: 'cpu.overClock',
    },
    GPU: {
        NAME: 'gpu.name',
        MEMORY: 'gpu.memory',
        GPU_CLOCK: 'gpu.gpuClock',
        MEMORY_CLOCK: 'gpu.memClock',
    },
    RAM: 'ram',
    NOTES: 'description',
}

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_SENDER,
    appId: process.env.FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig);
const database: Firestore = getFirestore(app);
console.log(`Successfully connected to Firebase | ${app.name}`);

export function userCollection(): CollectionReference {
    return database.collection('userSpecs');
}
