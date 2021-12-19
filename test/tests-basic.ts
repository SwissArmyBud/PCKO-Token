import { expect } from "chai";
import { ethers } from "hardhat";


let NOT_FUNCTION = "not a function";
let REVERTED_TX = "reverted"

let log = function(o : any){
  console.log("[BASIC] -> " + o)
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

    beforeEach(async function(){
      deployedContract = await getDeployDefaultContract();
    })
  
    it("Should be named correctly -> PKCO Token", async function () {
      expect(await deployedContract.name()).to.equal("PKCO Token"); // Manually typed to double-check
    });
  
    it("Should be have the correct symbol -> PKCO", async function () {
      expect(await deployedContract.symbol()).to.equal("PKCO"); // Manually typed to double-check
    });
  
    it("Should have correct decimal places -> 18", async function () {
      expect(await deployedContract.decimals()).to.equal(18); // Manually typed to double-check
    });
  
    it("Should have correct supply -> 3.7T", async function () {
      expect(await deployedContract.totalSupply()).to.equal(3700000000000); // Manually typed to double-check
    });
  
    it("Should should be allocated to the contract owner", async function () {
      expect(await deployedContract.balanceOf((await ethers.getSigners())[0].address)).to.equal(contractDefaults.totalSupply);
    });
}