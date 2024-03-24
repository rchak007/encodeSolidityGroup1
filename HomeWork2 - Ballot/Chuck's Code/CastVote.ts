// import { createPublicClient, http } from "viem";

// import { custom, parseAbi } from 'viem'
// import { mainnet } from 'viem/chains'

import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import {
  createPublicClient,
  http,
  createWalletClient,
  formatEther,
  toHex,
  hexToString,
  custom,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

interface Voter {
  weight: number; // Using number for uint
  voted: boolean;
  delegate: string; // Using string to represent addresses
  vote: number; // Using number for uint
}

// const deployerPrivateKey = process.env.PRIVATE_KEY || "";
// now we are voting as Account 3
const deployerPrivateKey = process.env.PRIVATE_KEY3 || "";

// const voterAccount = privateKeyToAccount(`0x${deployerPrivateKey}`);
// const voterAccount = "0xd8F68a7AeB7df4c349274e84B493451D6D3518b6";
// now voting as account 3
const voterAccount = "0x8669BE5d06eD100C94C9354FEC7fa509753F7c36";

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  console.log("parameter length = ", parameters.length);
  if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");
  const proposalIndex = parameters[1];
  if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

  console.log("Proposal selected: ");
  const proposal = (await publicClient.readContract({
    address: contractAddress,
    abi: abi,
    functionName: "proposals",
    args: [BigInt(proposalIndex)],
  })) as any[];
  const name = hexToString(proposal[0], { size: 32 });

  // console.log("Proposal selected: ");
  console.log("Your address = ", voterAccount);

  const voterData = (await publicClient.readContract({
    address: contractAddress,
    abi: abi,
    functionName: "voters",
    args: [voterAccount],
    // }));
  })) as any[];

  // Manually map the array to a Voter object
  const voterInfo: Voter = {
    weight: Number(voterData[0]),
    voted: voterData[1],
    delegate: voterData[2],
    vote: Number(voterData[3]),
  };

  console.log("Your Voter info: ");
  console.log(`Weight: ${voterInfo.weight}`);
  console.log(`Voted: ${voterInfo.voted}`);
  console.log(`Delegate: ${voterInfo.delegate}`);
  console.log(`Vote: ${voterInfo.vote}`);

  const voter = createWalletClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);

  console.log("Voting to proposal", name);
  console.log("Confirm? (Y/n)");

  const stdin = process.openStdin();
  stdin.addListener("data", async function (d) {
    if (d.toString().trim().toLowerCase() != "n") {
      // const hash = await publicClient.writeContract({
      const hash = await voter.writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "vote",
        args: [BigInt(proposalIndex)],
        // account: voterAccount,
        account: account,
      });
      console.log("Transaction hash:", hash);
      console.log("Waiting for confirmations...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction confirmed");
    } else {
      console.log("Operation cancelled");
    }
    process.exit();
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
