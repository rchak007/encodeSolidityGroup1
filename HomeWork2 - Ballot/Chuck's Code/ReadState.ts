// import { createPublicClient, http } from "viem";
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
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  // console.log("parameter length = ", parameters.length);
  // if (!parameters || parameters.length < 2)
  //   throw new Error("Parameters not provided");
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");
  // const proposalIndex = parameters[1];
  // if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

  // ************************   READ PROPOSALS from contract -
  console.log("Proposals on the contract: ");
  let propInd: number = 0;
  let keepLoopingProp: boolean = true;
  while (keepLoopingProp) {
    try {
      const proposal = (await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "proposals",
        args: [BigInt(propInd)],
      })) as any[];
      // we are reading the proposal one by one.
      const name = hexToString(proposal[0], { size: 32 });
      console.log("Proposal ", propInd, " = ", name);
      propInd += 1;
    } catch (error) {
      console.log("all proposals read ");
      // console.error("Error fetching proposal: ", error);
      keepLoopingProp = false;
    }
  } // End of Proposals While

  // // ************************   READ winningProposal from contract -

  const winningProp = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "winningProposal",
    args: [],
  })) as any[];
  console.log("Winning prop = ", winningProp);

  const winnerNameHex: string = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "winnerName",
    args: [],
  })) as string;
  // })) as any[];

  // const winnerNameString = hexToString(winnerNameHex, { size: 32 });
  const stringValue: `0x${string}` = winnerNameHex as `0x${string}`;
  console.log("Winning name = ", hexToString(stringValue));
  // console.log("Winning name hex = ", winnerNameHex);

  // // ************************   READ Voter from contract -
  // console.log("Voters on the contract: ");
  // let voteInd: number = 0;
  // let keepLoopingVoters: boolean = true;
  // while (keepLoopingVoters) {
  //   try {
  //     const voter = (await publicClient.readContract({
  //       address: contractAddress,
  //       abi,
  //       functionName: "voters",
  //       args: [BigInt(voteInd)],
  //     })) as any[];
  //     // we are reading the proposal one by one.
  //     // const name = hexToString(voter[0], { size: 32 });
  //     console.log("Voter ", voteInd, " = ", voter);
  //     voteInd += 1;
  //   } catch (error) {
  //     console.log("all voters read ");
  //     console.error("Error fetching proposal: ", error);
  //     keepLoopingVoters = false;
  //   }
  // } // End
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
