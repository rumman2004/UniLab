// ------------------------------------------------------------
//  Loads environment variables from Server/.env
//  Imported FIRST in server.js so process.env is populated before
//  any other module (e.g. supabase.js) reads it.
//
//  Uses an absolute path based on this file's location, so it works
//  no matter which directory you run `npm start` from.
// ------------------------------------------------------------
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// this file: Server/src/config/env.js  →  Server/.env is two levels up
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
