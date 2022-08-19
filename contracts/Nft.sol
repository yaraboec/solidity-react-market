// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./@openzeppelin/contracts/access/Ownable.sol";
import {removeArrayElement} from "./utils.sol";

contract Nft is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC2981,
    Ownable,
    AccessControl
{
    struct Token {
        uint256 tokenId;
        string tokenURI;
    }

    event tokenMinted(uint256 indexed tokenId);
    event tokenBurned(uint256 indexed tokenId);

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    address private _recipient;
    mapping(address => uint256[]) private nftsByOwner;

    constructor() ERC721("Yara", "YToken") {
        _setupRole(MINTER_ROLE, msg.sender);

        _recipient = msg.sender;
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

        nftsByOwner[tokenOwner].push(tokenIndex);

        emit tokenMinted(tokenIndex);
    }

    function burn(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only owner of the token can burn it."
        );

        _burn(tokenId);
        removeArrayElement(tokenId, nftsByOwner[msg.sender]);

        emit tokenBurned(tokenId);
    }

    function getNftsByOwner(address owner)
        external
        view
        returns (Token[] memory)
    {
        uint256 tokenAmount = balanceOf(owner);

        Token[] memory ownerTokens = new Token[](tokenAmount);
        uint256[] memory tokenIds = nftsByOwner[owner];

        for (uint256 i = 0; i < tokenAmount; i++) {
            if (_exists(tokenIds[i])) {
                Token memory currentToken = Token(
                    tokenIds[i],
                    tokenURI(tokenIds[i])
                );

                ownerTokens[i] = currentToken;
            }
        }

        return ownerTokens;
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

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) {
        require(_isApprovedOrOwner(_msgSender(), tokenId));
        _payRoyalty(from, to);
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) {
        _payRoyalty(from, to);
        safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override(ERC721, IERC721) {
        require(_isApprovedOrOwner(_msgSender(), tokenId));
        _payRoyalty(from, to);
        _safeTransfer(from, to, tokenId, _data);
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        public
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (_recipient, (_salePrice * 1000) / 10000);
    }

    function _payRoyalty(address from) internal {
        (bool success, ) = payable(_recipient).call{value: 10000}("");
        require(success, "Transfer failed");
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl, ERC2981)
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

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}
