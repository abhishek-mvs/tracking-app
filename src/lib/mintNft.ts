import {
    createV1,
    mintV1,
    printV1,
    TokenStandard,
    mplTokenMetadata,
    fetchMasterEditionFromSeeds,
    createNft,
    printSupply
} from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import {
    generateSigner,
    percentAmount,
    keypairIdentity,
    createSignerFromKeypair,
    publicKey
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import bs58 from 'bs58';
import { Keypair, PublicKey } from '@solana/web3.js';
import fs from 'fs';


export const mintNft = async (mintAddress: string, tokenOwnerAddress: string) => {
        console.log("mintAddress", mintAddress);
        console.log("tokenOwnerAddress", tokenOwnerAddress);
        const umi = createUmi("https://api.devnet.solana.com")
        .use(mplTokenMetadata())
        .use(mplToolbox());

        const base658Key = 'D746Z8fZsisQamYqWpaofkRBMDMTByn6nF1tJ9FAHBTBxULV6pAZRmaZc6aXB5qWcBkVFjF6kxcJ5M6iECuAv99';
        // Load creator keypair
        const secretKey = bs58.decode(base658Key);
        const j = new Uint8Array(secretKey.buffer, secretKey.byteOffset, secretKey.byteLength / Uint8Array.BYTES_PER_ELEMENT);

        const keypair = umi.eddsa.createKeypairFromSecretKey(j);
        console.log(keypair.publicKey.toString());
        const collectionMintPubkey = publicKey('Arb5kbY5MkABYyfX7RRLVA18SxVeoahJSp3v8XZKFLkH')

        const mint = publicKey(mintAddress)
        const tokenOwner = publicKey(tokenOwnerAddress)

        const masterEdition = await fetchMasterEditionFromSeeds(umi, {
            mint: mint,
        })


        console.log('Creator address:', keypair.publicKey.toString());
        umi.use(keypairIdentity(keypair));
        // console.log("masterEdition", JSON.stringify(masterEdition, null, 2));
        console.log(`Master Edition: ${masterEdition.publicKey.toString()}`);
        console.log(masterEdition.supply);

        const editionsToPrint = 1
        for (let i = 0; i < editionsToPrint; i++) {
        const editionMint = generateSigner(umi)
        console.log(`Edition Mint: ${editionMint.publicKey.toString()}`);
        const edition = await printV1(umi, {
            masterTokenAccountOwner: keypair.publicKey,
            masterEditionMint: mint,
            editionMint,
            editionTokenAccountOwner: tokenOwner,
            editionNumber: masterEdition.supply + BigInt(i + 1), // make sure to increment
            tokenStandard: TokenStandard.NonFungible,
        }).sendAndConfirm(umi)
        console.log(`Edition ${i + 1} created: ${edition.signature}`);
        console.log(JSON.stringify(edition, null, 2));
        }
}   