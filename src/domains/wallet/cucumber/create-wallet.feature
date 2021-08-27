Feature: Wallet

    @createWallet
    Scenario: Create new wallet
        Given Alice is signed into a profile
        When she navigates to create a wallet
        And selects a network
        And sees the generated mnemonic
        And confirms the generated mnemonic
        And skips the encryption password
        Then the new wallet is created

