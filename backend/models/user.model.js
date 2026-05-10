import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;
