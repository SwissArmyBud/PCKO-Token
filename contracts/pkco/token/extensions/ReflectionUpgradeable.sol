
//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contract-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contract-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contract-upgradeable/utils/ContextUpgradeable.sol";

import "hardhat/console.sol";

abstract contract ReflectionUpgradeable is IERC20Upgradeable, ContextUpgradeable, OwnableUpgradeable {

    mapping (address => uint256) internal _rOwned;
    mapping(address => mapping(address => uint256)) internal _allowances;

    mapping (address => bool) internal _isExcluded;
   
    uint256 internal _tTotal;
    uint256 internal _rTotal;
    uint256 internal _tFeeTotal;

    uint256 private _feeDivisor;

    function __Reflection_init(uint256 amount_, uint256 decimals_, uint256 feePercent_) public initializer {

        excludeAccount(owner());
        excludeAccount(address(this));

        _tTotal = amount_ * ( 10 ** decimals_ );
        _rTotal = (~uint256(0) - (~uint256(0) % _tTotal));

        _rOwned[_msgSender()] = _rTotal;
        emit Transfer(address(0), _msgSender(), _tTotal);

        _tFeeTotal = 0;
        _feeDivisor = 100 / feePercent_;
    }

    function isExcluded(address account) public view returns (bool) {
        return _isExcluded[account];
    }

    function totalFees() public view returns (uint256) {
        return _tFeeTotal;
    }

    function reflectionFromToken(uint256 tAmount) public view returns(uint256) {
        return tAmount * _getRate();
    }

    function tokenFromReflection(uint256 rAmount) public view returns(uint256) {
        return rAmount / _getRate();
    }

    function excludeAccount(address account) public onlyOwner() {
        require(!_isExcluded[account], "Account is already excluded");
        _isExcluded[account] = true;
    }

    function includeAccount(address account) public onlyOwner() {
        require(_isExcluded[account], "Account is already included");
        _isExcluded[account] = false;
    }

    function _transferStandard(address sender, address recipient, uint256 rAmount) internal {
        
        uint256 feeAmount = rAmount / _feeDivisor;
            
        _rOwned[sender] -= rAmount;
        _rOwned[recipient] += (rAmount - feeAmount);  
        
        _reflectFee(feeAmount, tokenFromReflection(feeAmount));
        emit Transfer(sender, recipient, tokenFromReflection(rAmount));
    }

    function _reflectFee(uint256 rFee, uint256 tFee) private {
        _rTotal -= rFee;
        _tFeeTotal += tFee;
    }

    function _getValues(uint256 tAmount) internal view returns (uint256, uint256, uint256, uint256, uint256) {
        (uint256 tTransferAmount, uint256 tFee) = _getTValues(tAmount);
        uint256 currentRate =  _getRate();
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee) = _getRValues(tAmount, tFee, currentRate);
        return (rAmount, rTransferAmount, rFee, tTransferAmount, tFee);
    }

    function _getTValues(uint256 tAmount) private view returns (uint256, uint256) {
        uint256 tFee = tAmount / _feeDivisor;
        uint256 tTransferAmount = tAmount - tFee;
        return (tTransferAmount, tFee);
    }

    function _getRValues(uint256 tAmount, uint256 tFee, uint256 currentRate) private pure returns (uint256, uint256, uint256) {
        uint256 rAmount = tAmount * currentRate;
        uint256 rFee = tFee * currentRate;
        uint256 rTransferAmount = rAmount - rFee;
        return (rAmount, rTransferAmount, rFee);
    }

    function _getRate() private view returns(uint256) {
        return _rTotal / _tTotal;
    }

}
