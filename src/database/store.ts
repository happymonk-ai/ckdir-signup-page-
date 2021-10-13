/**
 * Dummy InMemory Storage Implmentation
 * 
 * 
 */
const storage = new Map<string, any>();

/**
 * Set the value for the given storage
 * @param key 
 * @param value 
 */
export const set = async (key: string, value: any)=>{
    storage.set(key, value);
}


/**
 * Get the Key value from the resend. 
 * @param key 
 * @returns 
 */
export const get = async (key: string)=>{
    return storage.get(key);
}

/**
 * Storage Implementation
 */
export default storage;