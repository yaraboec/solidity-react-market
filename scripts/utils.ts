import { ethers } from "hardhat";

export async function main(contractName: string, args: any[]) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...args);

  await contract.deployed();

  console.log(`${contractName} address: ${contract.address}`);
}
