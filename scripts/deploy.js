const hre = require("hardhat");

async function main() {
    const Notepad = await hre.ethers.getContractFactory("DecentralizedNotepad");
    const notepad = await Notepad.deploy();

    await notepad.waitForDeployment();
    console.log("Notepad deployed at: ",notepad.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
