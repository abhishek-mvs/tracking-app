import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { TrackingSystem } from "./idl";
import { PublicKey } from "@solana/web3.js";

async function main() {
    // Connect to localnet
    const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
    const provider = new AnchorProvider(connection, window.solana, {});
    const program = new Program<TrackingSystem>(IDL, new PublicKey("7TBRqAzFS8FLEjHU2ppAWkU4Um8kQeBztmkLZUNjTrKB"), provider);

    try {
        // Create a new tracker
        const title = "Test Tracker";
        const description = "This is a test tracker";
        
        const [tracker] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("tracker"),
                Buffer.from(title)
            ],
            program.programId
        );

        const [trackerRegistry] = PublicKey.findProgramAddressSync(
            [Buffer.from("tracker_registry")],
            program.programId
        );

        console.log("Creating tracker...");
        await program.methods
            .createTracker(title, description)
            .accounts({
                tracker,
                trackerRegistry,
                user: provider.wallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .rpc();

        console.log("Tracker created successfully!");

        // Get all trackers
        const trackers = await program.methods
            .getAllTrackers()
            .accounts({
                trackerRegistry,
            })
            .view();

        console.log("All trackers:", trackers);

    } catch (error) {
        console.error("Error:", error);
    }
}

main(); 