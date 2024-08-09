const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 7,
        validate: {
            validator: function(v) {
                return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{5,7}$/.test(v);
            },
            message: props => 'Password must be 5-7 characters long and include at least one uppercase letter, one special character, and one number.'
        }
    },
    user_image: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Pre-save middleware to hash the password
UserSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

// Method to compare given password with the database hash
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("users", UserSchema);

module.exports = User;