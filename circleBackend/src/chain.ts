import { ethers } from "ethers";
import 'dotenv/config';

const rpc = process.env.RPC_URL!;
const pk  = process.env.PRIVATE_KEY!;
const address = process.env.CONTRACT_ADDRESS!;
const decimals = Number(process.env.TOKEN_DECIMALS || 18);

const provider = new ethers.JsonRpcProvider(rpc);
const signer   = new ethers.Wallet(pk, provider);

const abi = [
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external"
] as const;

export const contract = new ethers.Contract(address, abi, signer);

export function toUnits(amount: string | number) {
  return ethers.parseUnits(String(amount), decimals);
}
