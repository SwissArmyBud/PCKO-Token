
//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "../../../zeppelin/access/Ownable.sol";

import "hardhat/console.sol";

abstract contract Charity is Ownable {

    string private _charityName;
    address internal _charityAddress;
    uint256 internal _charityBalance;

    function charityName() public view returns (string memory) { return _charityName; } 
    function charityAddress() public view returns (address) { return _charityAddress; } 
    function charityBalance() public view returns (uint256) { return _charityBalance; } 

    function _donateCharity(uint256 amount) internal { _charityBalance += amount; }
    function claimCharity() public virtual;
    function resetCharity(address address_, string memory name_) public onlyOwner returns (bool){
        claimCharity();
        _charityName = name_;
        _charityAddress = address_;
        return true;
    }

}
