
export type JWE = {
    protected: string;
    recipients: [
        {
            header: {
                alg: 'string';
                kid: string;
            };
            encrypted_key: string;
        }
    ];
    iv: string;
    ciphertext: string;
    tag: string;
};
