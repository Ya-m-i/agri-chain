const express = require('express')
const router = express.Router()
const multer = require('multer')
const {
  registerUser,
  loginUser,
  getMe,
  updateUser,
  registerAdmin,
  getAdminUsers,
  deleteUser,
  saveAdminProfileImage,
  getAdminProfileImage,
} = require('../controller/userController')
const { protect } = require('../middleware/authMiddleware')

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB (frontend compresses before upload)
})

router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.get('/admins', protect, getAdminUsers)
router.get('/profile-image/:userId', getAdminProfileImage)
router.post('/profile-image', protect, imageUpload.single('profileImage'), saveAdminProfileImage)
router.put('/:id', protect, updateUser)
router.delete('/:id', protect, deleteUser)
router.post('/admin', protect, registerAdmin)

module.exports = router     