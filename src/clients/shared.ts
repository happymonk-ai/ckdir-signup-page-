import { randomBytes } from "@stablelib/random";
import { secretbox } from "tweetnacl";
import * as u8a from "uint8arrays";
import { nanoid } from "nanoid";

const nonceLength = secretbox.nonceLength;
const keyLength = secretbox.keyLength;

const generateKey = () => {
  return randomBytes(keyLength);
};

// Function to encrpt the data with the given key
const encrypt = (payload, key) => {
  const nonce = randomBytes(nonceLength);
  const messageData = u8a.fromString(JSON.stringify(payload));
  const box = secretbox(messageData, nonce, key);
  return {
    payload: box,
    nonce: nonce,
  };
};

// Function to decrypt data with message and nonce
const decrypt = async (payload, nonce, key) => {
  return new Promise((resolve, reject) => {
    try {
      if (!payload || !nonce || !key)
        return new Error("Cannot Decrypt, Need nonce, and key");
      const decryptMessage = secretbox.open(payload, nonce, key) as Uint8Array;
      const message = u8a.toString(Buffer.from(decryptMessage))
      resolve(JSON.stringify(message))
    } catch (error) {
        reject(error)
    }
  });
};

async function main() {
  const key = generateKey();

  const data = Object.assign(
    {},
    {
      id: nanoid(24),
      did: "did:key:109584230j28H981E1N89H89F189383FN31HFB88FF2BF82BV83BF2V84GBV9B48BV94VU234873HVgT7RUb398RBV3BBNVBNUIBRV9EV8",
      message: {
        value: "hello",
      },
    }
  );
  const { payload, nonce } = encrypt(data, key);
  const decryptedData = await decrypt(payload, nonce, key);
  if (decryptedData) {
    console.log(decryptedData);
  } else {
    console.log("Unable to decrypt the message");
  }
}

main().catch((err) => console.error);
