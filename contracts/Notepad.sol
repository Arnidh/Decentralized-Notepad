// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedNotepad {
    mapping(address => string) private documents;

    event DocumentSaved(address indexed user, string content, uint amount);

    function saveDocument(string memory content) public payable {
        require(msg.value >= 0.001 ether, "Minimum 0.001 ETH required");
        documents[msg.sender] = content;
        emit DocumentSaved(msg.sender, content, msg.value);
    }

    function loadDocument() public view returns (string memory) {
        return documents[msg.sender];
    }
}
