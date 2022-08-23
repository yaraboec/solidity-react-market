// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import {removeArrayElement} from "./utils.sol";

contract Nft is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    ERC2981Upgradeable,
    EIP712Upgradeable,
    AccessControlUpgradeable
{
    struct Token {
        uint256 tokenId;
        string tokenURI;
    }

    struct LazyNFT {
        uint256 mintPrice;
        string uri;
        bytes signature;
    }

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    string private constant SIGN_DOMAIN = "YaraToken";
    string private constant SIGN_VERSION = "1";

    mapping(address => uint256[]) private nftsByOwner;

    function initialize() public initializer {
        __ERC721_init("Yara", "YToken");
        __EIP712_init(SIGN_DOMAIN, SIGN_VERSION);

        _setupRole(MINTER_ROLE, msg.sender);
        _setDefaultRoyalty(msg.sender, 10000);
    }

    modifier isExists(uint256 tokenId) {
        _exists(tokenId);
        _;
    }

    function mint(address tokenOwner, LazyNFT calldata metadata)
        public
        payable
    {
        address signer = _verify(metadata);

        require(hasRole(MINTER_ROLE, signer), "Signer is not allowed to mint.");
        require(msg.value == metadata.mintPrice, "Wrong attached balance.");

        uint256 tokenIndex = totalSupply();

        _safeMint(signer, tokenIndex);
        _setTokenURI(tokenIndex, metadata.uri);
        _transfer(signer, tokenOwner, tokenIndex);

        nftsByOwner[tokenOwner].push(tokenIndex);
    }

    function _hash(LazyNFT calldata metadata) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256("LazyNFT(uint256 mintPrice,string uri)"),
                        metadata.mintPrice,
                        keccak256(bytes(metadata.uri))
                    )
                )
            );
    }

    function _verify(LazyNFT calldata metadata)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(metadata);

        return ECDSAUpgradeable.recover(digest, metadata.signature);
    }

    function burn(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only owner of the token can burn it."
        );

        _burn(tokenId);
        removeArrayElement(tokenId, nftsByOwner[msg.sender]);
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
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        isExists(tokenId)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            AccessControlUpgradeable,
            ERC2981Upgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }
}
