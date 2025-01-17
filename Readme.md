Dagger Contracts
================

An experimental implementation of the contracts that underly the Dagger storage
network. Its goal is to experiment with the rules around the bidding process,
the storage contracts, the storage proofs and the host stakes. Neither
completeness nor correctness are guaranteed at this moment in time.

Running
-------

To run the tests, execute the following commands:

    npm install
    npm test

To start a local Ethereum node with the contracts deployed, execute:

    npm start

This will create a `deployment-localhost.json` file containing the addresses of
the deployed contracts.

Overview
--------

The Dagger storage network depends on hosts offering storage to clients of the
network. The smart contracts in this repository handle interactions between
client and host as they negotiate and fulfill a contract to store data for a
certain amount of time.

When all goes well, the client and host perform the following steps:

    Client                 Host            Storage Contract
      |                     |
      | --- request (1) --> |
      |                     |
      | <----- bid (2) ---- |
      |
      | ----------- create contract (3) ---------> |
      |                                            |
      | ----- data (4) ---> |                      |
                            |                      |
                            | ---- start (5) ----> |
                            |                      |
                            | ---- proof (6) ----> |
                            |                      |
                            | ---- proof (6) ----> |
                            |                      |
                            | ---- proof (6) ----> |
                            |                      |
                            | <-- payment (7) ---- |

  1. Client broadcasts off-chain a request for storage, containing the size of
     the data that it wants to store and the length of time it wants to store it
  2. Several hosts reply off-chain with a bid containing a price
  3. The client selects a bid and uses it to create a new storage contract
     on-chain
  4. The client sends the data it wants to store to the host
  5. Once the host has received the data it starts the storage contract
  6. While the storage contract is active, the host proves that it is still
     storing the data by responding to frequent random challlenges
  7. At the end of the contract the host is paid

Contracts
---------

A storage contract can be created on-chain from a signed request and bid. The
request contains the size of the data and the length of time during which it
needs to be stored. It also contains proof requirements such as how often a
proof will need to be submitted by the host. A random nonce is included to
ensure uniqueness among similar requests. A bid contains a reference to the
request it pertains to, a price, and an expiry time.

When a new storage contract is created the client immediately pays the entire
price of the contract. The payment is only released to the host upon successful
completion of the contract.

Stakes
------

To motivate a host to remain honest, it must put up some collateral (stake)
before it is allowed to participate in storage contracts. The stake may not be
withdrawn as long as a host is participating in an active storage contract.

Should a host be misbehaving, then its stake may be reduced by a certain
percentage (slashed).

Proofs
------

A host is required to submit frequent proofs while a contract is active. These
proofs ensure with a high probability that the host is still holding on to the
data that it was entrusted with.

To ensure that a host is not able to predict and precalculate proofs, these
proofs are based on a random challenge. Currently we use the ethereum block hash
to determine two things: 1) whether or not a proof is required at this point in
time, and 2) the random challenge for the proof. Although a host will not be
able to predict the exact times at which a proof is required, the frequency of
proofs averages out to once per proof period. This proof period was agreed upon
by the client and host during the request/bid exchange.

Hosts have a small period of time in which they are expected to submit a proof.
When that time has expired without seeing a proof, validators are able to point
out the lack of proof. If a host misses too many proofs, it results into a
slashing of its stake.

To Do
-----

  * Actual proofs

    Because the actual proof of retrievability algorithm hasn't been determined yet
    we're using a dummy algorithm for now.

  * Contract take-over

    Allow another host to take over a contract when the original host missed too
    many proofs.

  * Start failures

    When a contract fails to start it should be aborted after a timeout. A
    contract may fail to start because the client failed to send the data, or
    because the host failed to start the contract. To discourage this, a small
    portion of both the client and host money can be burned if the contract
    doesn't start within a certain amount of time.

  * Reward validators

    A validator that points out missed proofs should be compensated for its
    vigilance and for the gas costs of invoking the smart contract.

  * Analysis and optimization of gas usage

