const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const addr = await deployer.getAddress();
  const bal = await ethers.provider.getBalance(addr);

  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${addr}`);
  console.log(`Balance : ${ethers.formatEther(bal)} ETH`);

  const Factory = await ethers.getContractFactory("MyUsd");
  const unsigned = await Factory.getDeployTransaction();
  const estGas = await ethers.provider.estimateGas({
    ...unsigned,
    from: addr,
  });

  // EIP-1559 fees (gasPrice fallback if provider has no baseFee)
  const feeData = await ethers.provider.getFeeData();

  if (!feeData.maxFeePerGas && !feeData.gasPrice) {
    throw new Error("No gas price data available");
  }
  const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice;
  
  const estCost = estGas * (gasPrice ?? 0n);

  console.log(`Est gas: ${estGas.toString()}`);
  console.log(`Est cost: ${ethers.formatEther(estCost)} ETH (gas * price)`);

  if (bal < estCost) {
    throw new Error(
      `Insufficient balance: need ~${ethers.formatEther(
        estCost
      )} ETH, have ${ethers.formatEther(bal)} ETH`
    );
  }

  const c = await Factory.deploy();
  await c.waitForDeployment();
  console.log("Deployed at:", await c.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
