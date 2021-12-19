import { expect } from "chai";
import { upgrades, ethers } from "hardhat";


let NOT_FUNCTION = "not a function";
let REVERTED_TX = "reverted"

let log = function(o : any){
  console.log("[CHARITY] -> " + o)
}

let contractDefaults = require("../contracts/pkco/contractDefaults.json")

let getDeployDefaultContract = async () => {
  let pkcoFactory = await ethers.getContractFactory("PKCOTokenUpgradeable")
  // initialize(string memory name_, string memory symbol_, uint256 decimals_, uint256 amount_, uint256 feePercent_, address charityAddress_)
  let contract = await upgrades.deployProxy(pkcoFactory,[
    contractDefaults.name,
    contractDefaults.symbol,
    contractDefaults.decimals.toString(),
    contractDefaults.totalSupply,
    contractDefaults.reflectionPercent,
    ((await ethers.getSigners())[contractDefaults.charityAddress].address)
  ]);
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