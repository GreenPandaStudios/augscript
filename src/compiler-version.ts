import {readFileSync} from 'node:fs';

/** The installed compiler identity; shared by configuration and package contracts. */
export const compilerVersion = ():string => JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8')).version;
