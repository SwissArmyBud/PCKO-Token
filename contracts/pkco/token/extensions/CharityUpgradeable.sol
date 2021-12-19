
//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contract-upgradeable/access/OwnableUpgradeable.sol";

import "hardhat/console.sol";

abstract contract CharityUpgradeable is Initializable, OwnableUpgradeable {

    string private _charityName;
    address internal _charityAddress;
    uint256 internal _charityBalance;

    function __Charity_init(address charityAddress_) internal initializer {
        _charityAddress = charityAddress_;
        _charityBalance = 0;
    }

    function charityName() public view returns (string memory) { return _charityName; } 
    function charityAddress() public view returns (address) { return _charityAddress; } 
    function charityBalance() virtual public view returns (uint256);

    function _donateCharity(uint256 amount_) internal { _charityBalance += amount_; }
    function claimCharity() public virtual;
    function resetCharity(address address_, string memory name_) public onlyOwner {
        claimCharity();
        _charityName = name_;
        _charityAddress = address_;
    }

}
