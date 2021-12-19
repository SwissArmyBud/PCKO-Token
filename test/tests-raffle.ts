import { expect } from "chai";
import { ethers } from "hardhat";


let NOT_FUNCTION = "not a function";
let REVERTED_TX = "reverted"

let log = function(o : any){
  console.log("[RAFFLE] -> " + o)
}

let contractDefaults = require("../contracts/pkco/contractDefaults.json")

let getDeployDefaultContract = async () => {
  let factory = await ethers.getContractFactory("PKCOToken")
  let contract = await factory.deploy(contractDefaults.name, contractDefaults.symbol, contractDefaults.totalSupply);
  await contract.deployed();
  return contract;
}

export const tests = () => {
  {

    let deployedContract : any;
    let checkBalance = async (ad : any, am : any) => expect(await deployedContract.balanceOf(ad)).to.equal(am);
  
    beforeEach(async function(){
      deployedContract = await getDeployDefaultContract();
    })
  
    it("Should have correct history on deployment", async function () {
  
      let testErrs : Array<Error> = [];
  
      // No default balance
      expect(await deployedContract.raffleBalance())
        .to.equal(0);
  
      // No history length
      let raffleHistoryLength = await deployedContract.raffleHistoryLength();
      expect(raffleHistoryLength)
        .to.equal(0);
  
    });
  
    it("Should have correct balance after transfer", async function () {
  
      let testErrs : Array<Error> = [];
      let [owner, act1, act2] = await ethers.getSigners();
  
      let testBalance = 1000;
  
      // No default balance
      expect(await deployedContract.raffleBalance())
        .to.equal(0);
  
      await checkBalance(owner.address, contractDefaults.totalSupply);
      await checkBalance(act1.address, 0);
  
      try{
        await deployedContract.connect(owner).transfer(act1.address, testBalance)
      } catch (e : any) {
        testErrs.push(e)
      }
    
      // Approve throws an error and the allowance/balances are unchanged
      expect(testErrs.length).to.equal(0);
      expect(await deployedContract.raffleBalance())
        .to.equal(testBalance / 4);
  
      await checkBalance(owner.address, contractDefaults.totalSupply - testBalance);
      await checkBalance(act1.address, testBalance/4);
  
    });
  
    it("Should be able to run raffle as owner", async function () {
  
      let testErrs : Array<Error> = [];
      let [owner, act1, act2, act3, act4, act5, act6, act7, act8, act9, act10, act11, act12] = await ethers.getSigners();
  
      let testBalance = 120000;
      
      await deployedContract.connect(owner).transfer(act1.address, testBalance);
      // Try to run a raffle
      try{
        await deployedContract.connect(owner).runRaffle(testBalance / 10);
      } catch (e : any) {
        console.log(e)
        testErrs.push(e)
      }
      expect(testErrs.length)
        .to.equal(0);
    
      await checkBalance(owner.address, contractDefaults.totalSupply - testBalance);
      let tokenomicsValue = testBalance / 4;
      await checkBalance(act1.address, testBalance - ( 3 * tokenomicsValue ));
      expect(testErrs.length).to.equal(0);
      expect(await deployedContract.raffleBalance())
        .to.equal(tokenomicsValue / 3);
  
    });

    it("Should have the correct eligibility", async function () {

      let [owner, act1, act2, act3, act4, act5, act6, act7, act8, act9, act10, act11, act12] = await ethers.getSigners();

      // Ensure the accounts have the correct eligibility
      let raffleHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
      let testingAccounts = [
        owner, 
        act1, act2, act3, act4, act5, 
        act6, act7, act8, act9, act10,
        act11, act12
      ]
      let knownEligibilityCases = [
        false, 
        true, false, false, true, true, 
        true, true, true, true, true,
        true, false
      ]
      knownEligibilityCases.forEach(async (v, i) => {
        let address = testingAccounts[i].address;
        let isEligible = await deployedContract.isEligible(raffleHash, address);
        expect(isEligible).to.equal(knownEligibilityCases[i])
      })
  
    });
    
    it("Should have correct history after raffle is executed", async function () {
  
      let testErrs : Array<Error> = [];
  
      // No default balance
      expect(await deployedContract.raffleBalance())
        .to.equal(0);
  
      // No history length
      let raffleHistoryLength = await deployedContract.raffleHistoryLength();
      expect(raffleHistoryLength)
        .to.equal(0);
  
    });

    it("Should be able to run raffle as owner", async function () {});
  
  
  }
}