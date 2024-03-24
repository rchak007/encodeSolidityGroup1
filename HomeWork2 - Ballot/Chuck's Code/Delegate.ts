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

const deployerPrivateKey = process.env.PRIVATE_KEY || "";

// Account 2 will delegate to account 3
const acct2PrivateKey = process.env.PRIVATE_KEY2 || "";
const acct3PrivateKey = process.env.PRIVATE_KEY3 || "";

const addressAccount1 = "0xd8F68a7AeB7df4c349274e84B493451D6D3518b6";
const addressAccount2 = "0xe880704FA2edd72Ff0F3aE5CdEC559c8EB25C727";
const addressAccount3 = "0x8669BE5d06eD100C94C9354FEC7fa509753F7c36"; // will come from parameter/argument just putting here for referral

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  console.log("parameter length = ", parameters.length);
  if (!parameters || parameters.length != 2)
    throw new Error(
      "Parameters have to be 2 - contract address and delegate address"
    );
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const delegateAddress = parameters[1] as `0x${string}`;
  if (!delegateAddress) throw new Error("delegateAddress not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(delegateAddress))
    throw new Error("Invalid delegateAddress");

  const voterDataMine = (await publicClient.readContract({
    address: contractAddress,
    abi: abi,
    functionName: "voters",
    args: [addressAccount2],
  })) as any[];

  // Manually map the array to a Voter object
  const voterInfoMine: Voter = {
    weight: Number(voterDataMine[0]),
    voted: voterDataMine[1],
    delegate: voterDataMine[2],
    vote: Number(voterDataMine[3]),
  };
  console.log("Your Voter info: ");
  console.log(`Weight: ${voterInfoMine.weight}`);
  console.log(`Voted: ${voterInfoMine.voted}`);
  console.log(`Delegate: ${voterInfoMine.delegate}`);
  console.log(`Vote: ${voterInfoMine.vote}`);

  console.log("You are delegating to Delegate address ", delegateAddress);

  const voterData = (await publicClient.readContract({
    address: contractAddress,
    abi: abi,
    functionName: "voters",
    args: [delegateAddress],
  })) as any[];

  // Manually map the array to a Voter object
  const voterInfo: Voter = {
    weight: Number(voterData[0]),
    voted: voterData[1],
    delegate: voterData[2],
    vote: Number(voterData[3]),
  };
  console.log("Delegate Voter info: ");
  console.log(`Weight: ${voterInfo.weight}`);
  console.log(`Voted: ${voterInfo.voted}`);
  console.log(`Delegate: ${voterInfo.delegate}`);
  console.log(`Vote: ${voterInfo.vote}`);
  console.log("Confirm you want to delegate ? (Y/n)");

  const voter = createWalletClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // account 2 will delegate to account 3
  const account = privateKeyToAccount(`0x${acct2PrivateKey}`);

  const stdin = process.openStdin();
  stdin.addListener("data", async function (d) {
    if (d.toString().trim().toLowerCase() != "n") {
      // const hash = await publicClient.writeContract({
      const hash = await voter.writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "delegate",
        args: [delegateAddress],
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
