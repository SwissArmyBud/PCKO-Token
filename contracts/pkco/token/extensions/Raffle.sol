
//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "../../../zeppelin/access/Ownable.sol";
import "../../../zeppelin/utils/Context.sol";

import "hardhat/console.sol";

abstract contract Raffle is Context, Ownable {

    // Raffle account tracking
    mapping(address => uint256) internal _registration;
    function registrationTime(address account) public view returns (uint256) { return _registration[account]; }     
    function _registerForRaffle(address account) internal {
        if(_registration[account] > 0) return;
        _registration[account] = block.timestamp;
    }

    // Current tokens available to the Raffle contract
    uint256 internal _raffleBalance = 0;
    function raffleBalance() public view returns (uint256) { return _raffleBalance; } 

    // Struct to define required Raffle fields
    struct RaffleEntry {
        uint256 _raffleTime;
        bytes32 _raffleHash;
        uint256 _reservedAmount;
        uint256 _claimedAmount;
        uint256 _maxClaim;
    }
    // Internal list of all Raffle events and a public getter for specific events
    RaffleEntry[] internal _raffleHistory;
    function raffleHistoryLength() public view returns (uint256) { return _raffleHistory.length; } 
    function raffleHistoryEntry(uint256 entry) public view returns (RaffleEntry memory) { return _raffleHistory[entry]; } 
    // Map for all claimed credits
    mapping(uint256 => mapping(address => bool)) internal _claimedRaffle;
    function claimedRaffleCredits(uint256 entry, address account) public view returns (bool) { return _claimedRaffle[entry][account]; } 

    function runRaffle(uint256 maxCredit) public onlyOwner {

        RaffleEntry memory _entry;

        // Require Raffle amount to meet some conditions
        uint256 reservedAmount = _raffleBalance * 2 / 3;
        _raffleBalance -= reservedAmount;
        require(reservedAmount > 0, "PKCO: Raffle has no funds");
        require(reservedAmount >= maxCredit, "PKCO: Raffle credit imbalance"); // NOTE - This is manually entered, could be calculated

        // Entry amounts
        _entry._reservedAmount = reservedAmount;
        _entry._maxClaim = maxCredit;
        _entry._claimedAmount = 0;
        // Entry technicals
        _entry._raffleTime = block.timestamp;
        _entry._raffleHash = blockhash(block.number);
        
        // Attach to history
        _raffleHistory.push(_entry);

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
    // function forceClaimRaffles(uint256[] memory entries, address account) public onlyOwner {
    //     for(uint i = 0; i < entries.length; i++){
    //         _claimRaffle(i, account);
    //     }
    // }

    function closeRaffle(uint256 entry) public onlyOwner {

        RaffleEntry storage raffle = _raffleHistory[entry];
        require((block.timestamp - raffle._raffleTime) > 14 days, "PKCO: Early raffle close"); // NOTE - This limit should be considered

        uint256 remainingAmount = raffle._reservedAmount - raffle._claimedAmount;
        if(remainingAmount > 0){ 
            _raffleBalance += remainingAmount;
            raffle._claimedAmount = raffle._reservedAmount;
        }
        
    }

    function isEligible(bytes32 blockHash, address account) public pure returns (bool) {
        return (uint(blockHash) % 3) != (uint(keccak256(abi.encodePacked(account))) % 3);
    }

}
