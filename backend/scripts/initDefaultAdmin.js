const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const initDefaultAdmin = async () => {
    try {
        // Check if default admin exists
        const existingAdmin = await User.findOne({ 
            username: 'admin', 
            role: 'admin' 
        });
                
        if (existingAdmin) {
            console.log('✅ Default admin already exists');
            return;
        }
                
        // Hash password for "admin123"
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
                
        // Create default admin
        await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            name: 'Default Admin'
        });
                
        console.log('✅ Default admin created successfully!');
        console.log('   Username: admin');
        console.log('   Password: admin123');
    } catch (error) {
        console.error('❌ Error creating default admin:', error);
    }
};

module.exports = initDefaultAdmin;

