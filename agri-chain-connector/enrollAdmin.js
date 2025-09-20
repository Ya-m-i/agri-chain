const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function enrollAdmin() {
    try {
        // Create a new file system based wallet for managing identities
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user
        const adminExists = await wallet.get('admin');
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Read the admin certificate and private key from files
        const adminCert = fs.readFileSync(path.join(__dirname, 'admin-cert.pem'), 'utf8');
        const adminKey = fs.readFileSync(path.join(__dirname, 'admin-key.pem'), 'utf8');

        // Create the admin identity
        const x509Identity = {
            credentials: {
                certificate: adminCert,
                privateKey: adminKey,
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        // Store the admin identity in the wallet
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

enrollAdmin();