import { deploy } from "@openzeppelin/hardhat-upgrades/dist/utils";
import { expect } from "chai";
import { upgrades, ethers } from "hardhat";


let NOT_FUNCTION = "not a function";
let REVERTED_TX = "reverted"

let log = function(o : any){
  console.log("[BASIC] -> " + o)
}

let ethFromWei = function(wei : any) : any {
  return (wei / (10 ** contractDefaults.decimals))
}

let weiFromEth = function(eth : any) : any {
  return BigInt(eth) * BigInt(10 ** contractDefaults.decimals);
}

let contractDefaults = require("../contracts/pkco/contractDefaults.json")

let retainedContract : any;
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
    let deployedContract : any;

    beforeEach(async function(){
      try{ deployedContract = await getDeployDefaultContract(); }
      catch(e){console.log(e); throw e;}
      
    })
  
    it("Should be named correctly -> PKCO Token", async function () {
      expect(await deployedContract.name()).to.equal("PKCO Token"); // Manually typed to double-check
    });
  
    it("Should have the correct symbol -> PKCO", async function () {
      expect(await deployedContract.symbol()).to.equal("PKCO"); // Manually typed to double-check
    });
  
    it("Should have correct decimal places -> 18", async function () {
      expect(await deployedContract.decimals()).to.equal(18); // Manually typed to double-check
    });
  
    it("Should have correct supply -> 3.7T", async function () {
      let totalSupply = ethFromWei(await deployedContract.totalSupply());
      expect(totalSupply).to.equal(3700000000000); // Manually typed to double-check
    });
  
    it("Should be allocated to the contract owner", async function () {
      let ownerSupply = await deployedContract.balanceOf((await ethers.getSigners())[0].address);
      expect(ethFromWei(ownerSupply)).to.equal(contractDefaults.totalSupply);
    });
  
    it("Should be able to send funds to other users", async function () {

      retainedContract = deployedContract;

      let testBalance = 125000;
      let [owner, act1, act2] = await ethers.getSigners();

      // -----
      // TX 1
      await deployedContract.connect(owner).transfer(act1.address, weiFromEth(testBalance));

      let ownerBalance = await deployedContract.balanceOf(owner.address);
      let act1Balance = await deployedContract.balanceOf(act1.address);
      let act2Balance = await deployedContract.balanceOf(act2.address);

      expect(ownerBalance).to.equal(BigInt("3699999876249999704814193283904"));
      expect(act1Balance).to.equal(BigInt("30000000010135133084139"));
      expect(act2Balance).to.equal(BigInt("0"));

      // -----
      // TX 2
      await deployedContract.connect(owner).transfer(act2.address, weiFromEth(testBalance));

      ownerBalance = await deployedContract.balanceOf(owner.address);
      act1Balance = await deployedContract.balanceOf(act1.address);
      act2Balance = await deployedContract.balanceOf(act2.address);

      expect(ownerBalance).to.equal(BigInt("3699999752499999378378390124093"));
      expect(act1Balance).to.equal(BigInt("30000000020270266257304"));
      expect(act2Balance).to.equal(BigInt("30000000010135133169740"));


    });

}