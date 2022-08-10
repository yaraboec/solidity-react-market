import { ethers } from "hardhat";

export async function main(contractName: string) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log(`${contractName} address: ${contract.address}`);
}
