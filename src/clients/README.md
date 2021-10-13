#Client Scripts For internal testing use. 


### Client Script folder


```
/**
 * 
 * payload
 * 
 * Object => JSON.stringfy(Object)=> u8a.fromString(stringifiedObject) => store(uint8ArrayFormattedOutput)
 * 
 * Encoding(serverside, clientside)
 * JWE(uint8ArrayFormattedOutput)
 * jwe = createJWE(unit8arrayformmatedoutput,encrypter[publickey])
 * block = Block.encode({value:jwe,codec:dajjose,hasher:sha256})
 * store(block.cid,block.value)
 * 
 * // ---...----
 * updatedDocument = updateDocument(block, previousDocument.id)
 * Chokidr.sign(updatedDocument)
 * documentBlock = Block.encode({value:updateDocument,codec:cbor,hasher:sha256})
 * store("chokidr::new::document::cid(_)",documentBlock.value)
 * 
 * 
 * // Client Side
 * document = get("chokidr::new::document::cid(_)")
 * decodedDocument = Block.create({document,cid,codec:dagJose,hasher:sha256})
 * documentObject = Object.assign({},decodedDocument)
 * blockcid = documentObject.payload
 * Decoding(blockcid,privatekey)
 * block= get(cid)
 * 
 * decodedBlock = Block.create({block,cid,codec:dagJose,hasher:sha256})
 * decryptedBlock = decrypteJWE(decodedBlock.value,privatekey)
 * data = Object.create(u8a.toString(decryptedBlock))
 * 
 * 
 * 
 */
 ```
 