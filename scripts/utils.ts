import { ethers, upgrades } from "hardhat";

export async function main(contractName: string, args: any[]) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(Contract, args);

  await contract.deployed();

  console.log(`${contractName} address: ${contract.address}`);
}

export async function main1(
  oldContractAddress: string,
  newContractName: string
) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  const NewContractFactory = await ethers.getContractFactory(newContractName);

  const newContract = await upgrades.upgradeProxy(
    oldContractAddress,
    NewContractFactory
  );

  console.log(`${newContractName} address: ${newContract.address}`);
}
