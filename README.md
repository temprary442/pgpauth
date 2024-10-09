# Exploring New Ways To Authenticate on the web.

# Using PGP Principles.
## Infrastructure
Web server (storing the key fingerprints, will authenticate by msg signature) <-> PGP Server (storing all the public keys)

## Advantages
Hard to leak a private key (since it is stored locally).
Private Key Has More Impact On The clients Attitude and Security.
Encryption happens on the client side.

## Some concerns
Does it scale ?
Assymetric encryption is not very performant ?
High Loads of encryption/decrypt operations can be detrimental to someone's server ?

## Hosting PGP server
I did it with hockeypuck.
https://hockeypuck.io/install-ubuntu.html

## Running The WebApi
npm install && npm test