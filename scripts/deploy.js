const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
  //const Voting = await ethers.ContractFactory("Voting")
  const Voting = await ethers.getContractFactory("Voting")
  // Start deployment, returning a promise that resolves to a contract object
  const Voting_ = await Voting.deploy(["David", "Mike", "Henry", "Rock"], 90);
  await Voting_.deployed();

  console.log("Contract deployed to address:", Voting_.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
