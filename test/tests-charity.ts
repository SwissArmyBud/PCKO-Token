import { expect } from "chai";
import { ethers } from "hardhat";


let NOT_FUNCTION = "not a function";
let REVERTED_TX = "reverted"

let log = function(o : any){
  console.log("[CHARITY] -> " + o)
}

let contractDefaults = require("../contracts/pkco/contractDefaults.json")

let getDeployDefaultContract = async () => {
  let factory = await ethers.getContractFactory("PKCOToken")
  let contract = await factory.deploy(contractDefaults.name, contractDefaults.symbol, contractDefaults.totalSupply);
  await contract.deployed();
  return contract;
}

export const tests = () => {

  let deployedContract : any;
  let defaultCharity = {
    address: "0x0000000000000000000000000000000000000001",
    name: "PKCO-Choice"
  }

  beforeEach(async function(){
    deployedContract = await getDeployDefaultContract();
  })

  it("Should be able to set charity details as owner -> Per JSON", async function () {
    await deployedContract.resetCharity(defaultCharity.address, defaultCharity.name)
    expect(await deployedContract.charityAddress())
      .to.equal(ethers.utils.getAddress("0x0000000000000000000000000000000000000001")); // Manually typed to double-check
    expect(await deployedContract.charityName())
      .to.equal("PKCO-Choice"); // Manually typed to double-check
  });

}