// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {removeArrayElement} from "./utils.sol";

contract NftMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;

    struct Sale {
        uint256 price;
        address seller;
        uint256 tokenId;
    }

    event SaleUpdated(uint256 indexed tokenId, uint256 indexed price);

    event SaleAdded(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event SaleRemoved(uint256 indexed tokenId);

    event TokenPurchased(
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 price
    );

    Counters.Counter private _salesAmount;
    uint256[] saleIds;
    mapping(uint256 => Sale) private sales;
    mapping(address => uint256[]) private salesByOwner;

    modifier notOnSale(address nftAddress, uint256 tokenId) {
        Sale memory sale = sales[tokenId];

        require(sale.price == 0, "Sale already exists.");
        _;
    }

    modifier isOwner(address nftAddress, uint256 tokenId) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);

        require(
            msg.sender == owner,
            "Only owner of token can call this method."
        );
        _;
    }

    modifier isOnSale(address nftAddress, uint256 tokenId) {
        Sale memory sale = sales[tokenId];

        require(sale.price > 0, "Sale must be listed.");
        _;
    }

    modifier NotZeroPrice(uint256 price) {
        require(price > 0, "Price must be greater than 0.");
        _;
    }

    function addSale(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notOnSale(nftAddress, tokenId)
        isOwner(nftAddress, tokenId)
        NotZeroPrice(price)
    {
        IERC721 nft = IERC721(nftAddress);

        require(
            nft.getApproved(tokenId) == address(this),
            "Market must be approved on nft."
        );

        sales[tokenId] = Sale(price, msg.sender, tokenId);
        saleIds.push(tokenId);
        salesByOwner[msg.sender].push(tokenId);
        _salesAmount.increment();

        emit SaleAdded(msg.sender, nftAddress, tokenId, price);
    }

    function removeSale(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId)
        isOnSale(nftAddress, tokenId)
    {
        delete (sales[tokenId]);
        removeArrayElement(tokenId, saleIds);
        removeArrayElement(tokenId, salesByOwner[msg.sender]);
        _salesAmount.decrement();

        emit SaleRemoved(tokenId);
    }

    function tokenPurchase(address nftAddress, uint256 tokenId)
        external
        payable
        isOnSale(nftAddress, tokenId)
        nonReentrant
    {
        Sale memory sale = sales[tokenId];

        require(msg.value == sale.price, "Deposit must equals sale price.");

        delete (sales[tokenId]);
        removeArrayElement(tokenId, saleIds);
        removeArrayElement(tokenId, salesByOwner[msg.sender]);
        _salesAmount.decrement();

        IERC721(nftAddress).safeTransferFrom(sale.seller, msg.sender, tokenId);

        (bool success, ) = payable(msg.sender).call{value: sale.price}("");
        require(success, "Transfer failed");

        emit TokenPurchased(msg.sender, tokenId, sale.price);
    }

    function updateSale(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isOnSale(nftAddress, tokenId)
        nonReentrant
        isOwner(nftAddress, tokenId)
        NotZeroPrice(newPrice)
    {
        sales[tokenId].price = newPrice;

        emit SaleUpdated(tokenId, newPrice);
    }

    function getSale(uint256 tokenId) public view returns (Sale memory) {
        return sales[tokenId];
    }

    function getSalesSupply() public view returns (uint256) {
        return _salesAmount.current();
    }

    function getSales() external view returns (Sale[] memory) {
        Sale[] memory allSales = new Sale[](_salesAmount.current());

        for (uint256 i = 0; i < _salesAmount.current(); i++) {
            if (saleIds[i] >= 0) {
                allSales[i] = getSale(saleIds[i]);
            }
        }

        return allSales;
    }

    function getSalesByOwner(address owner)
        external
        view
        returns (Sale[] memory)
    {
        uint256[] memory ownerSalesIds = salesByOwner[owner];

        Sale[] memory ownerSales = new Sale[](ownerSalesIds.length);

        for (uint256 i; i < ownerSalesIds.length; i++) {
            if (ownerSalesIds[i] >= 0) {
                ownerSales[i] = getSale(ownerSalesIds[i]);
            }
        }

        return ownerSales;
    }
}
