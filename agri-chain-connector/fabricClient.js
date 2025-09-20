const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

class FabricClient {
    constructor() {
        this.gateway = new Gateway();
        this.wallet = null;
        this.network = null;
        this.contract = null;
        this.connected = false;
    }

    async connect() {
        try {
            // Create a new file system based wallet for managing identities
            const walletPath = path.join(process.cwd(), 'wallet');
            this.wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user
            const userExists = await this.wallet.get('appUser');
            if (!userExists) {
                console.log('An identity for the user "appUser" does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                return;
            }

            // Load connection profile
            const ccpPath = path.resolve(__dirname, 'connection-profile', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Set connection options
            const connectionOptions = {
                wallet: this.wallet,
                identity: 'appUser',
                discovery: { enabled: true, asLocalhost: false }
            };

            // Connect to gateway
            await this.gateway.connect(ccp, connectionOptions);
            console.log('Connected to Fabric gateway');

            // Get network (channel) our contract is deployed to
            this.network = await this.gateway.getNetwork('mychannel');

            // Get the contract from the network
            this.contract = this.network.getContract('logcc');
            this.connected = true;
            console.log('Connected to contract: logcc');

        } catch (error) {
            console.error(`Failed to connect to Fabric network: ${error}`);
            this.connected = false;
            throw error;
        }
    }

    async addClaimLog(claimId, farmerName, cropType, timestamp, status) {
        if (!this.connected || !this.contract) {
            throw new Error('Not connected to blockchain. Please connect first.');
        }

        try {
            console.log('Adding claim log to blockchain...');
            const result = await this.contract.submitTransaction(
                'AddClaimLog',
                claimId,
                farmerName,
                cropType,
                timestamp,
                status
            );
            console.log('Claim log added successfully');
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to add claim log: ${error}`);
            throw error;
        }
    }

    async queryAllClaimLogs() {
        if (!this.connected || !this.contract) {
            throw new Error('Not connected to blockchain. Please connect first.');
        }

        try {
            console.log('Querying all claim logs from blockchain...');
            const result = await this.contract.evaluateTransaction('QueryAllClaimLogs');
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to query claim logs: ${error}`);
            throw error;
        }
    }

    async queryClaimLogsByFarmer(farmerName) {
        if (!this.connected || !this.contract) {
            throw new Error('Not connected to blockchain. Please connect first.');
        }

        try {
            console.log(`Querying claim logs for farmer: ${farmerName}`);
            const result = await this.contract.evaluateTransaction('QueryClaimLogsByFarmer', farmerName);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to query claim logs by farmer: ${error}`);
            throw error;
        }
    }

    async queryClaimLogsByStatus(status) {
        if (!this.connected || !this.contract) {
            throw new Error('Not connected to blockchain. Please connect first.');
        }

        try {
            console.log(`Querying claim logs with status: ${status}`);
            const result = await this.contract.evaluateTransaction('QueryClaimLogsByStatus', status);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to query claim logs by status: ${error}`);
            throw error;
        }
    }

    async getClaimLogsStats() {
        if (!this.connected || !this.contract) {
            throw new Error('Not connected to blockchain. Please connect first.');
        }

        try {
            console.log('Getting claim logs statistics...');
            const result = await this.contract.evaluateTransaction('GetClaimLogsStats');
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to get claim logs stats: ${error}`);
            throw error;
        }
    }

    async disconnect() {
        if (this.gateway) {
            await this.gateway.disconnect();
            this.connected = false;
            console.log('Disconnected from Fabric gateway');
        }
    }
}

module.exports = FabricClient;