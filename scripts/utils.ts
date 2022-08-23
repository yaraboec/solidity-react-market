import { ethers, upgrades } from "hardhat";
import dotenv from "dotenv";

export async function main(contractName: string) {
  await getSigner();

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(Contract);

  await contract.deployed();

  console.log(contract.address);

  console.log(`${contractName} address: ${contract.address}`);
}

export async function main1(newContractName: string, envVar: string) {
  await getSigner();

  const NewContractFactory = await ethers.getContractFactory(newContractName);

  const newContract = await upgrades.upgradeProxy(
    process.env.envVar ?? "",
    NewContractFactory
  );

  console.log(`${newContractName} address: ${newContract.address}`);
}

export async function getSigner() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);
}
