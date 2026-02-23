import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import multer from "multer";
import Tesseract from "tesseract.js";
import dotenv from "dotenv";
import OpenAI from "openai";
import authRoutes from "./routes/auth.js";
import Marksheet from "./models/Marksheet.js";
import formDataRoutes from "./routes/formData.js";
import { Builder, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import User from "./models/User.js"; 
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Application from './models/Application.js';
import PDFDocument from 'pdfkit';
import applicationRoutes from "./routes/application.js"; 
//  // ✅ FIX: User model import
import userRoutes from "./routes/user.js";


dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));


app.use("/api/auth", authRoutes);
app.use("/api/formData", formDataRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/users", userRoutes);

const importantFields = [
  "name","father_name","mother_name","gender","dob","age","marital_status","nationality",
  "religion","category","blood_group","identification_mark","mobile_number","alternate_mobile_number",
  "email_address","present_address","permanent_address","pin_code","state","district","city_village",
  "aadhaar_number","pan_number","voter_id_number","passport_number","driving_license_number",
  "highest_qualification","board_university","year_of_passing","marks_percentage_cgpa","roll_number",
  "school_college_name","occupation","employer_name","designation_job_title","work_experience_years",
  "previous_employer","salary_income_details","account_holder_name","bank_name","account_number",
  "ifsc_code","branch_name","upload_photo","upload_signature","declaration_checkbox","place","date",
  "signature","disability","minority_status","domicile_certificate_number","income_certificate_number",
  "hostel_required","transport_required","preferred_language","emergency_contact_number"
];

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const { userId } = req.body; 
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const ocrResult = await Tesseract.recognize(req.file.buffer, "eng");
    const text = ocrResult.data.text;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract ONLY these fields in JSON: ${importantFields.join(
            ", "
          )}. Use null if missing.`
        },
        { role: "user", content: text }
      ],
      temperature: 0
    });

    let aiResponse = completion.choices[0].message.content.replace(
      /^\s*```json\s*|\s*```$/g,
      ""
    ).trim();

    let extractedData;
    try {
      extractedData = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({ error: "AI returned invalid JSON", details: aiResponse });
    }

    const newDoc = new Marksheet({
      filename: req.file.originalname,
      extractedText: text,
      importantData: extractedData,
      userId, 
      image: { data: req.file.buffer, contentType: req.file.mimetype }
    });

    await newDoc.save();

   
    await User.findByIdAndUpdate(
      userId,
      { $push: { marksheets: newDoc._id } },
      { new: true }
    );

    res.json({ success: true, data: { ...newDoc._doc, response: extractedData } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId)
    
    const marksheets = await Marksheet.find({ userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(marksheets);
  } catch (err) {
    console.error("Error fetching marksheets:", err);
    res.status(500).json({ error: "Failed to fetch marksheets" });
  }
});




app.get("/api/marksheets", async (req, res) => {
  try {
    const docs = await Marksheet.find().sort({ createdAt: -1 });
    res.json(docs.map(d => ({ ...d._doc, response: d.importantData })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/marksheets/:id", async (req, res) => {
  try {
    const doc = await Marksheet.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


function bufferToBase64(image) {
  if (!image || !image.data) return null;
  const base64 = Buffer.from(image.data).toString("base64");
  return `data:${image.contentType};base64,${base64}`;
}


function mergeUserAndMarksheet(user, marksheet) {
  const u = user || {};
  const m = marksheet?.importantData || {};

  return {
  
    candidateName:
      m.candidateName || m.name || u.candidateName || u.changedName || "",
    fatherName: m.fatherName || m.fathersName || u.fatherName || "",
    motherName: m.motherName || m.mothersName || u.motherName || "",
    gender: m.gender || u.gender || "",
    dob: m.dob || u.dob || "",
    hasAadhaar: u.hasAadhaar,
    aadharNumber: u.aadharNumber || "",
    hasChangedName: u.hasChangedName,
    changedName: u.changedName || "",

    
    educationBoard: m.educationBoard || u.educationBoard || "",
    rollNumber: m.rollNumber || u.rollNumber || "",
    yearOfPassing: m.yearOfPassing || u.yearOfPassing || "",
    highestQualification:
      m.highestQualification || u.highestQualification || "",

    mobileNumber: u.mobileNumber || "",
    emailId: u.emailId || "",

  
    marksheetFileName: marksheet?.filename || "",
    extractedText: marksheet?.extractedText || "",
    marksheetImageBase64: bufferToBase64(marksheet?.image),
    marksheetUploadedAt: marksheet?.uploadedAt || "",
  };
}


export async function fetchUserDataFromDB(userId) {
  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Valid User ID is required.");
    }

    console.log("Fetching user data for ID:", userId);

    
    const user = await User.findById(userId)
      .select("-password") 
      .populate({
        path: "marksheets",
        model: "Marksheet",
      })
      .lean();

    if (!user) throw new Error(`User not found for ID: ${userId}`);

    console.log("✅ User found:", user.emailId);

   
    const marksheets = user.marksheets.map((m) => ({
      _id: m._id,
      filename: m.filename,
      extractedText: m.extractedText || "",
      importantData: m.importantData || {},
      uploadedAt: m.uploadedAt,
      imageBase64: bufferToBase64(m.image),
    }));

   
    const latestMarksheet = user.marksheets[user.marksheets.length - 1] || null;
    const mergedData = mergeUserAndMarksheet(user, latestMarksheet);

    console.log("✅ Data merged successfully", mergedData);

    return {
      user,
      marksheets,
      mergedData,
    };
  } catch (error) {
    console.error("❌ Error fetching user + marksheet data:", error.message);
    throw error;
  }
}

async function clickSscRadio(driver, optionText) {
    try {
        const radioLabelXPath = `//label[normalize-space()='${optionText}']`;
        const radioLabel = await driver.wait(until.elementLocated(By.xpath(radioLabelXPath)), 20000);
        // Using executeScript to click is the most reliable way to prevent interception errors.
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", radioLabel);
        await driver.sleep(300); // A small pause to ensure scrolling is finished.
        await driver.executeScript("arguments[0].click();", radioLabel);
        console.log(`✅ Clicked radio button: "${optionText}"`);
    } catch (err) {
        console.error(`❌ Could not click radio for "${optionText}"`, err.message);
        throw err;
    }
}

async function fillSscInput(driver, labelText, value) {
    if (value === undefined || value === null || value === '') return;
    try {
        const simpleInputXPath = `//label[contains(., "${labelText}")]/following-sibling::input[1]`;
        const dateInputXPath = `//label[contains(., "${labelText}")]/following-sibling::mat-form-field[1]//input`;
        
        let input;
        try {
            input = await driver.findElement(By.xpath(simpleInputXPath));
        } catch (e) {
            input = await driver.wait(until.elementLocated(By.xpath(dateInputXPath)), 15000);
        }

        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", input);
        await driver.sleep(300);
        await driver.executeScript("arguments[0].value = '';", input);
        await input.sendKeys(value);
        console.log(`✅ Filled input for "${labelText}"`);
    } catch (err) {
        console.error(`❌ Could not fill input for "${labelText}"`, err.message);
        throw err;
    }
}

async function selectSscDropdown(driver, labelText, optionText) {
    if (!optionText) return;
    try {
        const openerXPath = `//app-dropdown[contains(@label, "${labelText}")]//div[@class='value-area']`;
        const opener = await driver.wait(until.elementLocated(By.xpath(openerXPath)), 20000);
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", opener);
        await driver.sleep(300);
        await driver.executeScript("arguments[0].click();", opener);
        console.log(`✅ Opened dropdown for "${labelText}"`);
        
      
        await driver.wait(until.elementLocated(By.xpath("//ul[contains(@class, 'list')]")), 5000);

   
        const optionXPath = `//ul[contains(@class, 'list')]//li[contains(normalize-space(), "${optionText}")]`;
        const option = await driver.wait(until.elementLocated(By.xpath(optionXPath)), 10000);
        await driver.executeScript("arguments[0].click();", option);
        console.log(`✅ Selected "${optionText}" for "${labelText}"`);
    } catch (err) {
        console.warn(`⚠️ Could not select "${optionText}" for "${labelText}"`, err.message);
        throw err;
    }
}

async function fillSscDateField(driver, labelText, dateValue) { 
    if (!dateValue) return;
    try {
        const dateInputXPath = `//label[contains(., "${labelText}")]/following-sibling::mat-form-field[1]//input`;
        const input = await driver.wait(until.elementLocated(By.xpath(dateInputXPath)), 15000);
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", input);
        await driver.sleep(300);
        await driver.executeScript(
            "arguments[0].value = arguments[1];" +
            "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
            input,
            dateValue
        );
        console.log(`✅ Filled Date for "${labelText}"`);
    } catch (err) {
        console.error(`❌ Could not fill Date for "${labelText}"`, err.message);
        throw err;
    }
}



async function runSscAutomation(userId) {
  let driver;
  try {
    console.log("🚀 Starting SSC Automation...");
    driver = await new Builder().forBrowser("chrome").build();

    const data = await fetchUserDataFromDB(userId);
    if (!data?.mergedData) throw new Error("No merged user data found.");
    const userData = data.mergedData;

    await driver.get("https://ssc.gov.in/");
    console.log("✅ Navigated to ssc.gov.in");

    const loginLink = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Login or Register')]")),
      15000
    );
    await loginLink.click();
    console.log("✅ Clicked 'Login or Register'");

    await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Registration Number']")), 15000);
    console.log("✅ Login modal active");

    
    await driver.executeScript(`
      const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent.trim() === 'Register Now');
      if (el) el.click();
    `);
    await driver.sleep(2000);

    const handles = await driver.getAllWindowHandles();
    if (handles.length > 1) await driver.switchTo().window(handles.pop());

    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'One Time Registration')]")), 10000);
    console.log("✅ 'One Time Registration' detected");

    const continueBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[normalize-space()='Continue']")),
      10000
    );
    await driver.executeScript("arguments[0].click();", continueBtn);
    console.log("✅ Clicked Continue");

    console.log("🧾 Filling SSC Registration Form...");


    await clickSscRadio(driver, userData.hasAadhaar ? "Yes" : "No");
        if (userData.hasAadhaar) {
            await fillSscInput(driver, "Enter Your Aadhaar Details", userData.aadharNumber);
            await fillSscInput(driver, "Verify Aadhaar Details", userData.aadharNumber);
        }

        await fillSscInput(driver, "Candidate Name", userData.candidateName);
        await fillSscInput(driver, "Verify Candidate Name", userData.candidateName);
        await clickSscRadio(driver, userData.hasChangedName ? "Yes" : "No");
        
        await selectSscDropdown(driver, "Gender", userData.gender);
        await selectSscDropdown(driver, "Verify Gender", userData.gender);

        await fillSscDateField(driver, "Date Of Birth", userData.dob);
        await fillSscDateField(driver, "Verify Date of Birth", userData.dob);

        await fillSscInput(driver, "Father's Name", userData.fatherName);
        await fillSscInput(driver, "Verify Father's Name", userData.fatherName);
        await fillSscInput(driver, "Mother's Name", userData.motherName);
        await fillSscInput(driver, "Verify Mother's Name", userData.motherName);

        await selectSscDropdown(driver, "Matriculation (10th class) Education Board", userData.educationBoard);
        await selectSscDropdown(driver, "Verify Matriculation (10th class) Education Board", userData.educationBoard);

        await fillSscInput(driver, "Roll Number", userData.rollNumber);
        await fillSscInput(driver, "Verify Roll Number", userData.rollNumber);
        
        await selectSscDropdown(driver, "Year of Passing", userData.yearOfPassing);
        await selectSscDropdown(driver, "Verify Year of Passing", userData.yearOfPassing);

        await selectSscDropdown(driver, "Highest Level of Education", userData.highestQualification);
        await selectSscDropdown(driver, "Verify Highest Level of Education", userData.highestQualification);

        await fillSscInput(driver, "Candidate's Mobile Number", userData.mobileNumber);
        await fillSscInput(driver, "Candidate's Email ID", userData.emailId);

        console.log("🎯 SUCCESS! Form filled.");
const formData = {
    candidateName: userData.candidateName,
    fatherName: userData.fatherName,
    motherName: userData.motherName,
    dob: userData.dob,
    gender: userData.gender,
    rollNumber: userData.rollNumber,
    highestQualification: userData.highestQualification,
    educationBoard: userData.educationBoard,
    yearOfPassing: userData.yearOfPassing,
    mobileNumber: userData.mobileNumber,
    emailId: userData.emailId,
    hasAadhaar: userData.hasAadhaar,
    aadharNumber: userData.aadharNumber
};

await fetch('http://localhost:5000/api/application/save-filled-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, formType: 'SSC OTR', formData })
});

return { status: "success", message: "SSC form automation completed successfully!" };
       
        return { status: "success", message: "SSC form automation completed successfully!" };

    } catch (err) {
        console.error("❌ SSC Automation FAILED:", err.message);
        throw err;
    } finally {
        
    }
}

app.post("/start-ssc-automation", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ status: "error", message: "User ID is required." });

    const result = await runSscAutomation(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});



app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: `receipt_${crypto.randomBytes(6).toString('hex')}`,
        };
        const order = await razorpayInstance.orders.create(options);
        if (!order) return res.status(500).send('Error creating Razorpay order.');
        console.log('✅ Order Created:', order); 
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ Error in /create-order:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error });
    }
});


app.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            console.log('✅ Payment Verification Successful!');

            
            await User.findByIdAndUpdate(userId, {
                isPremium: true,
                premiumActivatedAt: new Date(),
            });

            res.status(200).json({ status: 'success', message: 'Payment verified & premium activated!' });
        } else {
            res.status(400).json({ status: 'failure', message: 'Invalid payment signature.' });
        }
    } catch (error) {
        console.error('❌ Error in /verify-payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
