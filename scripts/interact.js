const { ethers } = require("hardhat");
const readline = require("readline");

// Replace with your deployed contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    try {
        const Notepad = await ethers.getContractFactory("Notepad");
        const notepad = await Notepad.attach(contractAddress);
        const signer = (await ethers.getSigners())[0];

        console.log(`\n📝 Connected to Notepad contract at: ${contractAddress}`);

        function showMenu() {
            console.log("\n📌 Select an option:");
            console.log("1️⃣ Create a Note");
            console.log("2️⃣ Edit a Note");
            console.log("3️⃣ Display a Note");
            console.log("4️⃣ Delete a Note");
            console.log("5️⃣ Exit");
            rl.question("\nEnter your choice (1-5): ", handleUserChoice);
        }

        async function handleUserChoice(choice) {
            switch (choice) {
                case "1":
                    rl.question("\n✍️ Enter note content: ", async (content) => {
                        const tx = await notepad.connect(signer).createNote(content);
                        await tx.wait();
                        console.log("✅ Note created!");
                        showMenu();
                    });
                    break;

                case "2":
                    rl.question("\n🔢 Enter note number to edit: ", async (noteId) => {
                        rl.question("\n✏️ Enter new note content: ", async (newContent) => {
                            const tx = await notepad.connect(signer).updateNote(noteId, newContent);
                            await tx.wait();
                            console.log("✅ Note updated!");
                            showMenu();
                        });
                    });
                    break;

                case "3":
                    rl.question("\n🔢 Enter note number to display: ", async (noteId) => {
                        try {
                            const content = await notepad.readNote(noteId);
                            console.log(`📖 Note ${noteId}: ${content}`);
                        } catch (error) {
                            console.error("❌ Error: Invalid note number or not the owner.");
                        }
                        showMenu();
                    });
                    break;

                case "4":
                    rl.question("\n🗑️ Enter note number to delete: ", async (noteId) => {
                        try {
                            const tx = await notepad.connect(signer).deleteNote(noteId);
                            await tx.wait();
                            console.log("✅ Note deleted!");
                        } catch (error) {
                            console.error("❌ Error: Invalid note number or not the owner.");
                        }
                        showMenu();
                    });
                    break;

                case "5":
                    console.log("👋 Exiting...");
                    rl.close();
                    process.exit(0);
                    break;

                default:
                    console.log("❌ Invalid choice. Please enter 1-5.");
                    showMenu();
                    break;
            }
        }

        showMenu();

    } catch (error) {
        console.error("🚨 Error:", error);
        rl.close();
        process.exit(1);
    }
}

main();
