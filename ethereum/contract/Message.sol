// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@opengsn/contracts/src/BaseRelayRecipient.sol";


contract Message is BaseRelayRecipient, Initializable, UUPSUpgradeable {

    address public owner;
    string public message;
    string public override versionRecipient;

    mapping(address => string) public users;

    function initialize() public initializer {
        owner = _msgSender();
        message = "First message";
        users[address(0)] = "First message";
        versionRecipient = "2.0.0";
    }

    function setForwarder(address _forwarder) external onlyOwner {
		_setTrustedForwarder(_forwarder);
    }

    function postMessage(string memory _message) external {
        message = _message;
        users[_msgSender()] = _message;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    modifier onlyOwner() {
        require(_msgSender() == owner);
        _;
    }

}


contract MessageV2 is Message {
    address[] public addresses;

    event newMessage(string _message);

    function postMessages(string memory _message) public virtual  {
        message = _message;
        users[_msgSender()] = _message;
        addresses.push(_msgSender());

        emit newMessage(_message);
    }
}

contract MessageV3 is MessageV2 {

    function getAddresses() public view returns (address[] memory) {
        return addresses;
    }
}

contract MessageV4 is MessageV3 {

    
    mapping(address => bool) public check;

    uint private start;
    address private temp;

    event newMessages(address addy, string _message);


    function postMessages(string memory _message) public override   {
        message = _message;
        if(check[_msgSender()]){
            users[_msgSender()] = _message;
            for( uint i=0; i<addresses.length; i++){
                if(addresses[i] == _msgSender()){
                    start = i;
                    break;
                }
            }
            for(uint i=start; i<addresses.length-1; i++){
                temp = addresses[i];
                addresses[i] = addresses[i+1];
                addresses[i+1] = temp;
            }
        }else{
            users[_msgSender()] = _message;
            check[_msgSender()] = true;

            addresses.push(_msgSender());
        }

        emit newMessages(_msgSender(), _message);

    }

     function deleteAll() public virtual onlyOwner {
        for (uint i=0; i<addresses.length; i++){
            check[addresses[i]] = false;
        }
        delete addresses;

    }      
}