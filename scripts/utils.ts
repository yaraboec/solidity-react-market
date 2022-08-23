import { ethers, upgrades } from "hardhat";

export async function main(contractName: string, envVar: string) {
  await getSigner();

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(Contract);

  await contract.deployed();

  process.env[envVar] = contract.address;
  console.log(`${contractName} address: ${contract.address}`);
}

export async function main1(newContractName: string, envVar: string) {
  await getSigner();

  const NewContractFactory = await ethers.getContractFactory(newContractName);

  const newContract = await upgrades.upgradeProxy(
    process.env.envVar ?? "",
    NewContractFactory
  );

  process.env[envVar] = newContract.address;
  console.log(`${newContractName} address: ${newContract.address}`);
}

export async function getSigner() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);
}
