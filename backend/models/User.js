import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    
    hasAadhaar: { type: Boolean, required: true },
    aadharNumber: { type: String },
    candidateName: { type: String, required: true },
    hasChangedName: { type: Boolean, required: true },
    changedName: { type: String },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },


    educationBoard: { type: String, required: true },
    rollNumber: { type: String, required: true },
    yearOfPassing: { type: String, required: true },
    highestQualification: { type: String, required: true },

 
    mobileNumber: { type: String, required: true },
    emailId: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

 
    marksheets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Marksheet",
      },
    ],
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
