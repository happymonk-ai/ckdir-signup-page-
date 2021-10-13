
export interface IBLSProof {
  payload: Uint8Array[];
  nonce: Uint8Array;
  signature: Uint8Array;
  revealed: number[];
}
