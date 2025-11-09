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
                
        // Hash password for "admin123" with salt rounds of 8 for faster hashing (still very secure)
        // 8 rounds = 256 iterations (vs 10 rounds = 1024 iterations)
        const salt = await bcrypt.genSalt(8);
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

