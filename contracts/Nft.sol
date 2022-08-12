// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Nft is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl {
    event TokenMint(uint256 indexed tokenId);
    event TokenBurn(uint256 indexed tokenId);

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC721("Yara", "YToken") {
        _setupRole(MINTER_ROLE, msg.sender);
    }

    modifier isExists(uint256 tokenId) {
        _exists(tokenId);
        _;
    }

    function mint(address tokenOwner, string memory _uri)
        public
        payable
        onlyRole(MINTER_ROLE)
    {
        uint256 tokenIndex = totalSupply();

        _safeMint(tokenOwner, tokenIndex);
        _setTokenURI(tokenIndex, _uri);

        emit TokenMint(tokenIndex);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        require(ownerOf(tokenId) == msg.sender);

        super._burn(tokenId);

        emit TokenBurn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        isExists(tokenId)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
