import { BigNumber } from "@ethersproject/bignumber";
import { deploy } from "@openzeppelin/hardhat-upgrades/dist/utils";
import { expect } from "chai";
import { upgrades, ethers } from "hardhat";


let NOT_FUNCTION = "not a function";
let REVERTED_TX = "reverted"

let log = function(o : any){
  console.log("[RAFFLE] -> " + o)
}

let ethFromWei = function(wei : any) : any {
  return (wei / (10 ** contractDefaults.decimals))
}

let weiFromEth = function(eth : any) : any {
  return BigInt(eth) * BigInt(10 ** contractDefaults.decimals);
}

let contractDefaults = require("../contracts/pkco/contractDefaults.json")

let getDeployDefaultContract = async () => {
  let pkcoFactory = await ethers.getContractFactory("PKCOTokenUpgradeable")
  // initialize(string memory name_, string memory symbol_, uint256 decimals_, uint256 amount_, uint256 feePercent_, address charityAddress_)
  let contract = await upgrades.deployProxy(pkcoFactory,[
    contractDefaults.name,
    contractDefaults.symbol,
    contractDefaults.decimals,
    contractDefaults.totalSupply,
    contractDefaults.reflectionPercent,
    ((await ethers.getSigners())[contractDefaults.charityAddress].address)
  ]);
  await contract.deployed();
  return contract;
}

export const tests = () => {
  {

    let deployedContract : any;
    let checkBalance = async (ad : any, am : any) => expect(ethFromWei(await deployedContract.balanceOf(ad))).to.equal(am);
  
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
  
      let testBalance = 120000;
  
      // No default balance
      expect(await deployedContract.raffleBalance())
        .to.equal(0);
  
      await checkBalance(owner.address, contractDefaults.totalSupply);
      await checkBalance(act1.address, 0);
  
      try{
        await deployedContract.connect(owner).transfer(act1.address, weiFromEth(testBalance));
      } catch (e : any) {
        testErrs.push(e)
      }
    
      expect(testErrs.length).to.equal(0);
    
      await checkBalance(owner.address, 3699999881200);
      await checkBalance(act1.address, 28800.00000934054);
      expect(await deployedContract.raffleBalance())
        .to.equal(BigInt("30000000009729727839532"));
  
    });
  
    it("Should be able to run raffle as owner", async function () {
  
      let testErrs : Array<Error> = [];
      let [owner, act1, act2, act3, act4, act5, act6, act7, act8, act9, act10, act11, act12] = await ethers.getSigners();
  
      let testBalance = 120000;
      
      await deployedContract.connect(owner).transfer(act1.address, weiFromEth(testBalance/1));
      await deployedContract.connect(act1).transfer(act2.address, weiFromEth(testBalance/5));
      await deployedContract.connect(act2).transfer(act3.address, weiFromEth(testBalance/25));
      await deployedContract.connect(act3).transfer(act4.address, weiFromEth(testBalance/125));
      await deployedContract.connect(act4).transfer(act5.address, weiFromEth(testBalance/625));
      expect(await deployedContract.raffleBalance())
        .to.equal(BigInt("37488000012664052354308"));
      
      // Try to run a raffle
      try{
        let maxClaim = BigInt(10 ** contractDefaults.decimals) / BigInt(1000);
        await deployedContract.connect(owner).runRaffle(maxClaim);
      } catch (e : any) {
        console.log(e)
        testErrs.push(e)
      }
      expect(testErrs.length)
        .to.equal(0);
  
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
  
  }
}