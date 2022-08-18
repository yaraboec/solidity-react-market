// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Auction {
    event AuctionStarted();
    event AuctionEnded();
    event Bid();
    event Withdraw();

    IERC721 public nft;

    address public owner;
    address public highestBidder;

    uint256 public endAt;
    uint256 public tokenId;
    uint256 public highestBid;

    bool public ended;

    mapping(address => uint256) public bids;

    modifier notOwner() {
        require(msg.sender != owner);
        _;
    }

    modifier beforeEnd() {
        require(block.timestamp < endAt);
        _;
    }

    modifier notEnded() {
        require(!ended);
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier afterEnd() {
        require(block.timestamp >= endAt);
        _;
    }

    constructor(
        address _nft,
        uint256 _tokenId,
        uint256 duration,
        uint256 initialBid
    ) {
        nft = IERC721(_nft);
        tokenId = _tokenId;

        owner = payable(msg.sender);
        highestBid = initialBid;
        endAt = block.timestamp + duration;

        nft.safeTransferFrom(msg.sender, address(this), _tokenId);

        emit AuctionStarted();
    }

    function bid() external payable notOwner beforeEnd notEnded {
        require(msg.value > 0, "You can not bid with zero.");

        uint256 newBid = bids[msg.sender] + msg.value;

        require(
            newBid > highestBid,
            "Your total bids amount must be bigger than actual."
        );

        if (highestBidder != address(0)) {
            bids[highestBidder] += highestBid;
        }

        highestBid = newBid;
        highestBidder = msg.sender;

        emit Bid();
    }

    function end() external onlyOwner afterEnd notEnded {
        ended = true;

        if (highestBidder != address(0)) {
            (bool success, ) = payable(owner).call{value: highestBid}("");
            require(success, "Transfer failed");

            bids[highestBidder] = 0;

            nft.safeTransferFrom(address(this), highestBidder, tokenId);
        } else {
            nft.safeTransferFrom(address(this), owner, tokenId);
        }

        emit AuctionEnded();
    }

    function withdraw() external {
        uint256 totalBids = bids[msg.sender];

        require(totalBids > 0, "You dont have any bids to withdraw.");

        (bool success, ) = payable(msg.sender).call{value: totalBids}("");
        require(success, "Transfer failed");

        bids[msg.sender] = 0;

        emit Withdraw();
    }
}
