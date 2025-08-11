const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const addr = await deployer.getAddress();
  const bal = await ethers.provider.getBalance(addr);

  const Factory = await ethers.getContractFactory("MyUsd");
  const unsigned = await Factory.getDeployTransaction();
  const estGas = await ethers.provider.estimateGas({
    ...unsigned,
    from: addr,
  });

  const feeData = await ethers.provider.getFeeData();

  if (!feeData.maxFeePerGas && !feeData.gasPrice) {
    throw new Error("No gas price data available");
  }
  const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice;
  
  const estCost = estGas * (gasPrice ?? 0n);

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
