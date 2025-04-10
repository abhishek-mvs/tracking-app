import {
    createV1,
    mintV1,
    printV1,
    TokenStandard,
    mplTokenMetadata,
    fetchMasterEditionFromSeeds,
    createNft,
    printSupply,
    fetchDigitalAsset
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
import fs from 'fs';
import { PublicKey as MetaplexPublicKey } from "@metaplex-foundation/js";
const umi = createUmi("https://api.devnet.solana.com")
.use(mplTokenMetadata())
.use(mplToolbox());

const base658Key = process.env.CREATOR_PRIVATE_KEY || '';
// Load creator keypair
const secretKey = bs58.decode(base658Key);
const j = new Uint8Array(secretKey.buffer, secretKey.byteOffset, secretKey.byteLength / Uint8Array.BYTES_PER_ELEMENT);

const keypair = umi.eddsa.createKeypairFromSecretKey(j);
umi.use(keypairIdentity(keypair));

export const mintNft = async (mintAddress: string, tokenOwnerAddress: string): Promise<string | null> => {
    const editionMint = generateSigner(umi)
    try {
            console.log("mintAddress", mintAddress);
            console.log("tokenOwnerAddress", tokenOwnerAddress);
        
            const mint = publicKey(mintAddress)
            const tokenOwner = publicKey(tokenOwnerAddress)

            const masterEdition = await fetchMasterEditionFromSeeds(umi, {
                mint: mint,
            })

            console.log('Creator address:', keypair.publicKey.toString());
        
            console.log(`Master Edition: ${masterEdition.publicKey.toString()}`);
            console.log(masterEdition.supply);

            const editionsToPrint = 1
            for (let i = 0; i < editionsToPrint; i++) {
            console.log(`Edition Mint: ${editionMint.publicKey.toString()}`);
            const edition = await printV1(umi, {
                // @ts-ignore - Account structure is correct but TypeScript types are mismatched
                masterTokenAccountOwner: keypair.publicKey,
                masterEditionMint: mint,
                editionMint,
                editionTokenAccountOwner: tokenOwner,
                editionNumber: masterEdition.supply + BigInt(i + 1), // make sure to increment
                tokenStandard: TokenStandard.NonFungible,
            }).sendAndConfirm(umi)
            console.log(`Edition ${i + 1} created: ${edition.signature}`);
            console.log(JSON.stringify(edition, null, 2));
            return editionMint.publicKey.toString();
        }
    } catch (error: any) {
        console.error("Error:", error);
        
        // Check if the error is a TransactionExpiredBlockheightExceededError
        if (error.toString().includes('TransactionExpiredBlockheightExceededError')) {
            try {
                // Verify if the transaction was actually completed
                const result = await fetchNftMetadata(editionMint.publicKey.toString());
                if (result) {
                    console.log("Transaction was actually completed despite the error");
                    return editionMint.publicKey.toString();
                }
            } catch (verificationError) {
                console.error("Error during verification:", verificationError);
            }
        }
        
        return null;
    }
    return null;
}   


export const fetchNftMetadata = async (mintAddress: string) => {
    try {
        const mint = publicKey(mintAddress);
  
        const asset = await fetchDigitalAsset(umi, mint);
    
    
        // Fetch and log the JSON metadata
        if (asset.metadata.uri) {
            const response = await fetch(asset.metadata.uri);
            const jsonMetadata = await response.json();
            const imageUri = jsonMetadata.image;
            // Fetch the image buffer
            const imageResponse = await fetch(imageUri);
            const imageBuffer = await imageResponse.arrayBuffer();
            
            // Return the image buffer, image URI and JSON metadata
            return {
                imageBuffer,
                imageUri,
                jsonMetadata
            };
        }
        return null;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}