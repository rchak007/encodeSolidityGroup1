# Solidity Bootcamp 24Q1

## Group 1 - hw1





### HelloWorld Contract: 0xC0b3e125431BA3710703E8019f0C5ab2116a2954



https://sepolia.etherscan.io/address/0xC0b3e125431BA3710703E8019f0C5ab2116a2954



![image-20240315111752434](./Images/image-20240315111752434.png)





- caller: 0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8 (Joezari's wallet address)

  - Transaction Hash: 0xb82b43d0a86f23c5c946a41d9afd8b0e7b367440f3bf1ba36c78b97e1b2ef19e

    - Creation of contract (0xC0b3e125431BA3710703E8019f0C5ab2116a2954)
    - Success

  - Transaction Hash: 0x9b3bc17a8fccd0a94fdd1d7e86205226daac38f0429b2bd1137f4aa49c63aee3

    - called setText()
    - Success: because I am the current owner

  - Transaction hash: 0xbfc4d93551467ec0d8ada1497c71b5235246a30f18fbd22f6af2976361662d14

    - Transfer of ownership
    - Success: transferred to a valid address (0xC0b3e125431BA3710703E8019f0C5ab2116a2954 - Chuck's)

  - Transaction Hash: 0xf2e0d0370f4c8b1371330d498f14297365c999ef9f9e88e0796abbd05608cd9b
    - called setText()
    - Failed: because I am no longer the owner, setText() has a modifier that checks if the caller of the function is the owner of the contract
    - Error: Fail with error 'Caller is not the owner'
