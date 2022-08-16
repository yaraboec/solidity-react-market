// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

function removeArrayElement(uint256 element, uint256[] storage array) {
    for (uint256 i = 0; i < array.length; i++) {
        if (array[i] == element) {
            delete (array[i]);
        }
    }
}
