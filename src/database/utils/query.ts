import level from 'level-rocksdb';
import * as jsonld from 'jsonld';
import { encodeBlock } from '../../crypto/Auth';
import * as u8a from 'uint8arrays'
import * as Block from 'multiformats/block';
import * as codec from '@ipld/dag-cbor';
import { sha256 as hasher } from 'multiformats/hashes/sha2';
import * as dagJose from 'dag-jose'

import {
    decodeCleartext,
    prepareCleartext
  } from 'dag-jose-utils'

var upperBoundChar = '\udbff\udfff';



/**
 * Inspired from levelGraph 
 * Create pairs for the defination. 
 * Define a defination 
 * 
 */

var defs = {
    spo: ['subject', 'predicate', 'object'],
    sop: ['subject', 'object', 'predicate'],
    pos: ['predicate', 'object', 'subject'],
    pso: ['predicate', 'subject', 'object'],
    ops: ['object', 'predicate', 'subject'],
    osp: ['object', 'subject', 'predicate']
};


const memberContext = {
    "did": 'http://schema.org/identifier',
    "name": "http://schema.org/name",
    "email": "http://schema.org/email",
    "telephone": "http://schema.org/telephone",
    "memberOf": "http://schema.org/memberOf",
    "relatedTo": "http://schema.org/person",
    "owns": "http://schema.org/owns",
    "image": { "@id": "http://schema.org/image", "@type": "@id" },
    "knows": "http://schema.org/knows"
}

interface IMemberContext  {
    
    did:string
}

interface DocumentContext{

}

type Type = string

async function documentCreator<T>(type:Type,documentContext:DocumentContext, document:any){
    async function createDocument<T>(){

    }
}


const memberDoc = {
    "http://schema.org/identifier": "",
    "http://schema.org/name": "Bhavish",
    "http://schema.org/email": "bhavish@happymonk.co",
    "http://schema.org/knows": [{
        "@id": "123",
        "http://schema.org/name": "Daniele",
        "http://schema.org/identifier": "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8"
    }, {
        "@id": "124",
        "http://schema.org/name": "Lucio",
        "http://schema.org/identifier": "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8"
    }]
}

export type Query = {
    start:string
    end:string
    reverse?:string
    did?:string
    cid?:string
    fillCache?: boolean
    highWaterMark?:number
    limit?:number,
    valueEncoding?:string
    keyEncoding?:string
}

/**
 * 
 * @param pattern {subject,object, predicate} {Organisation, Owns, Devices}
 * @param options 
 * @returns 
 */
export async function createQuery(pattern, options?: any):Promise<Query> {
    console.log('Generating Queries',pattern)
    var types = typesFromPattern(pattern)
        , preferiteIndex = options && options.index
        , index = findIndex(types, preferiteIndex)
        , key = genKey(index, pattern)
        , limit = pattern.limit
        , reverse = pattern.reverse || false
        , start = reverse ? applyUpperBoundChar(key) : key
        , end = reverse ? key : applyUpperBoundChar(key)
        , query:Query = {
            start: start
            , end: end
            , reverse: reverse
            , did: options.did 
            , cid : options.cid
            , fillCache: true
            , limit: typeof limit === 'number' && limit || -1
            , highWaterMark: 16
            , valueEncoding: 'binary'
        };
        console.log(query)
    return Promise.resolve(query);
}
/**
 * 
 * @param key 
 * @returns 
 */
export function applyUpperBoundChar(key) {
    var parts = key.split('::');
    var len = parts.length;
    return len === 4 && parts[len - 1] !== '' ? key : key + upperBoundChar;
}

/**
 * 
 * @param pattern 
 * @returns 
 */
export function typesFromPattern(pattern) {
    return Object.keys(pattern).filter(function (key) {
        switch (key) {
            case 'subject':
                return !!pattern.subject;
            case 'predicate':
                return !!pattern.predicate;
            case 'object':
                return !!pattern.object;
            default:
                return false;
        }
    });
}

/**
 * 
 * @param types 
 * @returns 
 */
function possibleIndexes(types) {
    var result = Object.keys(defs).filter(function (key) {
        var matches = 0;
        return defs[key].every(function (e, i) {
            if (types.indexOf(e) >= 0) {
                matches++;
                return true;
            }

            if (matches === types.length) {
                return true;
            }
        });
    });
    result.sort();
    return result;
}

/**
 * 
 * @param types 
 * @param preferiteIndex 
 * @returns 
 */
function findIndex(types, preferiteIndex?: any) {
    var result = possibleIndexes(types)
        , index
        , there;

    there = result.some(function (r) {
        return r === preferiteIndex;
    });

    if (preferiteIndex && there) {
        index = preferiteIndex;
    } else {
        index = result[0];
    }

    return index;
}

/**
 * 
 * @param key 
 * @param triple 
 * @returns 
 */
function genKey(key, triple?: any) {
    var result = key, def = defs[key], value, i;

    for (i = 0; (value = triple[def[i]]) !== null &&
        value !== undefined; i++) {
        result += '::' + escape(value);
    }

    if (i < 3) {
        result += '::';
    }

    return result;
}

/**
 * 
 * @param triple 
 * @param action 
 * @returns 
 */
export function generateBatch(triple, action) {
    if (!action) {
        action = 'put';
    }
    var json = JSON.stringify(triple);
    return genKeys(triple).map(function (key) {
        return { type: action, key: key, value: json };
    });
}

/**
 * Define Key Value over here
 */
var defKeys = Object.keys(defs);
/**
 * 
 * @param triple 
 * @returns 
 */
function genKeys(triple) {
    var i, result = [];

    for (i = 0; i < defKeys.length; i++) {
        result.push(genKey(defKeys[i], triple));
    }

    return result;
}