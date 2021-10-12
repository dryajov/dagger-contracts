const { ethers } = require("hardhat")

function hashRequest(duration, size) {
  return ethers.utils.solidityKeccak256(
    ["string", "uint", "uint"],
    ["[dagger.request.v1]", duration, size]
  )
}

function hashBid(requestHash, price) {
  return ethers.utils.solidityKeccak256(
    ["string", "bytes32", "uint"],
    ["[dagger.bid.v1]", requestHash, price]
  )
}

async function sign(signer, hash) {
  return await signer.signMessage(ethers.utils.arrayify(hash))
}

module.exports = { hashRequest, hashBid, sign }
