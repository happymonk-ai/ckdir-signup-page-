import { loadConfig } from "../config";
import { create } from "ipfs-http-client";
import {IPFS} from 'ipfs-core';




/**
 * Load Configuration files and Object
 */

const config = loadConfig();

/**
 * Get IPFS Client 
 * @param serverUrl 
 * @returns 
 */
export async function getIPFSClient(serverUrl?: string):Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // connect to the given port
      if (serverUrl || config.database?.ipfs?.swarmurl) {
        let url = serverUrl || config.database.ipfs.swarmurl;
        const ipfs = create({
          protocol:'http',
          host:'localhost',
          port:5001
        });
        resolve(ipfs);
      }
      // connect to the default port
      resolve(create());
    } catch (error) {
      reject(error)
    }
  });
}

/**
 * Get IPFS Client 
 * @param serverUrl 
 * @returns 
 */
 export function getClient(serverUrl?: string) {
  try {
    // connect to the given port
    if (serverUrl || config.database?.ipfs?.swarmurl) {
      let url = serverUrl || config.database.ipfs.swarmurl;
      const ipfs = create(url);
      return(ipfs);
    }
    return(create());
  } catch (error) {
    throw(error)
  }
}

