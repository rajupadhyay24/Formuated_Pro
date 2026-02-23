import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    
    
    password: {
        type: String,
        required: true,
    },
    
    
    isPremium: {
        type: Boolean,
        default: false,
    },

    
    plan: {
        type: String, 
        default: 'Student Plan'
    },

    
    premiumUntil: {
        type: Date,
    },
}, {
    timestamps: true
});


const Payment = mongoose.model('Payment', userSchema);
export default Payment;
