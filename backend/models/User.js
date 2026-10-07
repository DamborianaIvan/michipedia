import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  password: { type: String, required: true, select: false },
}, { timestamps: true });

UserSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.matchesPassword = function matchesPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', UserSchema);
