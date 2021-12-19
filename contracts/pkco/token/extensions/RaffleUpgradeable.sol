
//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contract-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contract-upgradeable/utils/ContextUpgradeable.sol";

import "hardhat/console.sol";

abstract contract RaffleUpgradeable is ContextUpgradeable, OwnableUpgradeable {

    // Raffle account tracking
    mapping(address => uint256) internal _registration;
    uint256[] internal _registrationPools;
    function registrationTime(address account) public view returns (uint256) { return _registration[account]; }     
    function _registerForRaffle(address account) internal {
        if(_registration[account] > 0) return;
        _registration[account] = block.timestamp;
        uint256 accountValue = (uint(keccak256(abi.encodePacked(account))) % 3);
        _registrationPools[accountValue] += 1;
    }

    // Current tokens available to the Raffle contract
    uint256 internal _raffleBalance;
    function raffleBalance() virtual public view returns (uint256);

    // Struct to define required Raffle fields
    struct RaffleEntry {
        uint256 _raffleTime;
        uint256 _reservedAmount;
        uint256 _claimedAmount;
        uint256 _maxClaim;
    }
    // Internal list of all Raffle events and a public getter for specific events
    RaffleEntry[] internal _raffleHistory;

    function __Raffle_init() internal initializer {
        _registrationPools.push(0); _registrationPools.push(0); _registrationPools.push(0);
    }

    // Accessors for raffle history
    function raffleHistoryLength() public view returns (uint256) { return _raffleHistory.length; } 
    function raffleHistoryEntry(uint256 entry) public view returns (RaffleEntry memory) { return _raffleHistory[entry]; } 
    
    // Map for all claimed credits
    mapping(uint256 => mapping(address => bool)) internal _claimedRaffle;
    function claimedRaffleCredits(uint256 entry, address account) public view returns (bool) { return _claimedRaffle[entry][account]; } 

    function runRaffle(uint256 maxClaim_) public onlyOwner {
        require(maxClaim_ > 0, "PKCO: Must allow claims");

        RaffleEntry memory entry;

        // Require Raffle amount to meet some conditions
        uint256 reservedAmount = _raffleBalance * 2 / 3;
        _raffleBalance -= reservedAmount;

        // Determine equitable distribution and use lowest value against owner request
        uint256 exclusionValue = (uint(keccak256(abi.encodePacked(block.timestamp))) % 3);
        uint256 maxClaim = reservedAmount / 
            (_registrationPools[0] + _registrationPools[1] + _registrationPools[2] - _registrationPools[exclusionValue]);
        maxClaim = maxClaim_ < maxClaim ? maxClaim_ : maxClaim;
        require(reservedAmount > 0, "PKCO: Raffle has no funds");
        require(reservedAmount >= maxClaim, "PKCO: Raffle credit imbalance"); // NOTE - This is manually entered, could be calculated

        // Entry amounts
        entry._raffleTime = block.timestamp;
        entry._reservedAmount = reservedAmount;
        entry._maxClaim = maxClaim;
        entry._claimedAmount = 0;
        
        // Attach to history
        _raffleHistory.push(entry);

    }

    function claimRaffles(uint256[] memory entries) public returns (bool) {

        require(_registration[_msgSender()] > 0, "PKCO: Not registered for raffle");

        for(uint i = 0; i < entries.length; i++){
            // If account was registered by Raffle, allow claim
            if( _registration[_msgSender()] < _raffleHistory[i]._raffleTime ){ _claimRaffle(i, _msgSender()); }
        }

        return true;
    }

    function _claimRaffle(uint256 entry, address account) internal virtual;
    function forceClaimRaffles(uint256[] memory entries, address account) public onlyOwner {
        for(uint i = 0; i < entries.length; i++){
            _claimRaffle(i, account);
        }
    }

    function closeRaffle(uint256 entry) public onlyOwner {

        // Get a storage pointer to persist changes
        RaffleEntry storage raffle = _raffleHistory[entry];
        require((block.timestamp - raffle._raffleTime) > 14 days, "PKCO: Early raffle close"); // NOTE - This limit should be considered

        // Take the leftovers and add them back to the pot
        uint256 remainingAmount = raffle._reservedAmount - raffle._claimedAmount;
        if(remainingAmount > 0){ 
            _raffleBalance += remainingAmount;
            raffle._reservedAmount = raffle._claimedAmount;
        }
        
    }

    function isEligible(uint256 raffleTime, address account) public pure returns (bool) {
        uint256 exclusionValue = (uint(keccak256(abi.encodePacked(raffleTime))) % 3);
        uint256 accountValue = (uint(keccak256(abi.encodePacked(account))) % 3);
        return exclusionValue != accountValue;
    }

}
