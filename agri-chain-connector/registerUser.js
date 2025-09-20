const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function registerUser() {
    try {
        // Create a new file system based wallet for managing identities
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user
        const userExists = await wallet.get('appUser');
        if (userExists) {
            console.log('An identity for the user "appUser" already exists in the wallet');
            return;
        }

        // For now, let's create a simple app user using the admin certificate
        // This is a simplified approach for testing
        const adminCert = fs.readFileSync(path.join(__dirname, 'admin-cert.pem'), 'utf8');
        const adminKey = fs.readFileSync(path.join(__dirname, 'admin-key.pem'), 'utf8');

        // Create the app user identity (using admin cert for now)
        const x509Identity = {
            credentials: {
                certificate: adminCert,
                privateKey: adminKey,
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        // Store the app user identity in the wallet
        await wallet.put('appUser', x509Identity);
        console.log('Successfully created app user "appUser" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to create user "appUser": ${error}`);
        process.exit(1);
    }
}

registerUser();