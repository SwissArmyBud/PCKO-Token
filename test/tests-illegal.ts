import { expect } from "chai";
import { ethers } from "hardhat";


let NOT_FUNCTION = "not a function";
let REVERTED_TX = "reverted"

let log = function(o : any){
  console.log("[ILLEGAL] -> " + o)
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
    let checkSupply = async () => expect(await deployedContract.totalSupply()).to.equal(contractDefaults.totalSupply);
    let checkBalance = async (ad : any, am : any) => expect(await deployedContract.balanceOf(ad)).to.equal(am);
    let checkAllowance = async (owner : any, spender: any, amt : any) => expect(await deployedContract.allowance(owner, spender)).to.equal(amt);
  
    beforeEach(async function(){
      deployedContract = await getDeployDefaultContract();
    })
  
    it("Should not be able to mint more tokens", async function () {
      
      let testErrs : Array<Error> = [];
  
      // Initial supply check
      await checkSupply();
  
      // Try to _mint
      try{
        await deployedContract._mint(1000000)
      } catch (e : any) {
        testErrs.push(e)
      }
  
      // Minting throws an error and the supply is unchanged
      expect(testErrs.length).to.be.equal(1);
      expect(testErrs[0].message).includes(NOT_FUNCTION);
  
      // Incremental supply check
      await checkSupply();
  
      // Try to mint
      try{
        await deployedContract.mint(1000000)
      } catch (e : any) {
        testErrs.push(e)
      }
  
      // Minting throws an error and the supply is unchanged
      expect(testErrs.length).to.be.equal(2);
      expect(testErrs[1].message).includes(NOT_FUNCTION);
  
      await checkSupply();
  
    });
  
    it("Should not be able to transfer more tokens than are owned", async function () {
      
      let testErrs : Array<Error> = [];
      let [owner, act1, act2] = await ethers.getSigners();
  
      await checkSupply();
      await checkBalance(owner.address, contractDefaults.totalSupply);
      await checkBalance(act1.address, 0);
      await checkBalance(act2.address, 0);
      
      // Try to transfer
      try{
        await deployedContract.connect(act1).transfer(act2.address, 1000000)
      } catch (e : any) {
        testErrs.push(e)
      }
  
      // Transfering throws an error and the supply is unchanged
      expect(testErrs.length).to.equal(1);
      expect(testErrs[0].message).includes(REVERTED_TX);
      await checkSupply();
      await checkBalance(owner.address, contractDefaults.totalSupply);
      await checkBalance(act1.address, 0);
      await checkBalance(act2.address, 0);
  
    });
  
    it("Should not be able to use a token approval attack to gain tokens", async function () {
      
      let approvalAmount = 1000000
  
      let testErrs : Array<Error> = [];
      let [owner, act1, act2] = await ethers.getSigners();
  
      await checkAllowance(act1.address, act2.address, 0);
  
      await checkSupply();
      await checkBalance(owner.address, contractDefaults.totalSupply);
      await checkBalance(act1.address, 0);
      await checkBalance(act2.address, 0);
      
      // Try to approve allowance
      try{
        await deployedContract.connect(act1).approve(act2.address, approvalAmount)
      } catch (e : any) {
        testErrs.push(e)
      }
      // Try to cross transfer attack half the tokens
      try{
        await deployedContract.connect(act2).transferFrom(act1.address, owner.address, approvalAmount / 2)
      } catch (e : any) {
        testErrs.push(e)
      }
  
      // Approve throws an error and the allowance/balances are unchanged
      expect(testErrs.length).to.equal(1);
      expect(testErrs[0].message).includes(REVERTED_TX);
      await checkAllowance(act1.address, act2.address, approvalAmount);
      await checkBalance(owner.address, contractDefaults.totalSupply);
      await checkBalance(act1.address, 0);
      await checkBalance(act2.address, 0);
  
    });
  
    it("Should not be able to change charity without being token owner", async function () {
  
      let testErrs : Array<Error> = [];
      let [owner, act1] = await ethers.getSigners();
  
      let defaultCharity = {
        address: ethers.utils.getAddress("0x0000000000000000000000000000000000000001"),
        name: "PKCO-Choice"
      }
      let fraudCharity = {
        address: ethers.utils.getAddress("0x0000000000000000000000000000000000000002"),
        name: "PKCO-Fraud"
      }  
      
      // Try to reset the charity as an owner
      try{
        await deployedContract.connect(owner).resetCharity(defaultCharity.address, defaultCharity.name)
      } catch (e : any) {
        testErrs.push(e)
      }
      // Expect default charity to be in place
      expect(testErrs.length).to.equal(0);
      expect(await deployedContract.charityAddress())
        .to.equal(defaultCharity.address);
      expect(await deployedContract.charityName())
        .to.equal(defaultCharity.name);
  
      // Try to reset the charity as a generic account
      try{
        await deployedContract.connect(act1).resetCharity(fraudCharity.address, fraudCharity.name)
      } catch (e : any) {
        testErrs.push(e)
      }
      // Expect tx to err with revert
      // Expect default charity to be in place
      expect(testErrs.length).to.equal(1);
      expect(testErrs[0].message).includes(REVERTED_TX);
      expect(await deployedContract.charityAddress())
        .to.equal(defaultCharity.address);
      expect(await deployedContract.charityName())
        .to.equal(defaultCharity.name);
  
    });
}