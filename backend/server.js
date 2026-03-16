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
// import { Builder, By, until } from "selenium-webdriver";
// import { Options } from "selenium-webdriver/chrome.js";
import User from "./models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import Application from "./models/Application.js";
import PDFDocument from "pdfkit";
import applicationRoutes from "./routes/application.js";
import userRoutes from "./routes/user.js";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });


chromium.use(StealthPlugin());

const allowedOrigins = [
  "http://localhost:3000",
  "https://formulatedpro.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// app.options("*", cors());  

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
  "name",
  "father_name",
  "mother_name",
  "gender",
  "dob",
  "age",
  "marital_status",
  "nationality",
  "religion",
  "category",
  "blood_group",
  "identification_mark",
  "mobile_number",
  "alternate_mobile_number",
  "email_address",
  "present_address",
  "permanent_address",
  "pin_code",
  "state",
  "district",
  "city_village",
  "aadhaar_number",
  "pan_number",
  "voter_id_number",
  "passport_number",
  "driving_license_number",
  "highest_qualification",
  "board_university",
  "year_of_passing",
  "marks_percentage_cgpa",
  "roll_number",
  "school_college_name",
  "occupation",
  "employer_name",
  "designation_job_title",
  "work_experience_years",
  "previous_employer",
  "salary_income_details",
  "account_holder_name",
  "bank_name",
  "account_number",
  "ifsc_code",
  "branch_name",
  "upload_photo",
  "upload_signature",
  "declaration_checkbox",
  "place",
  "date",
  "signature",
  "disability",
  "minority_status",
  "domicile_certificate_number",
  "income_certificate_number",
  "hostel_required",
  "transport_required",
  "preferred_language",
  "emergency_contact_number",
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
            ", ",
          )}. Use null if missing.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0,
    });

    let aiResponse = completion.choices[0].message.content
      .replace(/^\s*```json\s*|\s*```$/g, "")
      .trim();

    let extractedData;
    try {
      extractedData = JSON.parse(aiResponse);
    } catch (err) {
      return res
        .status(500)
        .json({ error: "AI returned invalid JSON", details: aiResponse });
    }

    const newDoc = new Marksheet({
      filename: req.file.originalname,
      extractedText: text,
      importantData: extractedData,
      userId,
      image: { data: req.file.buffer, contentType: req.file.mimetype },
    });

    await newDoc.save();

    await User.findByIdAndUpdate(
      userId,
      { $push: { marksheets: newDoc._id } },
      { new: true },
    );

    res.json({
      success: true,
      data: { ...newDoc._doc, response: extractedData },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

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
    res.json(docs.map((d) => ({ ...d._doc, response: d.importantData })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/marksheets/:id", async (req, res) => {
  try {
    const doc = await Marksheet.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

async function clickSscRadio(page, optionText) {
  try {
    const radio = page.locator(`//label[normalize-space()='${optionText}']`);

    await radio.waitFor({ timeout: 20000 });
    await radio.scrollIntoViewIfNeeded();
    await radio.click();

    console.log(`✅ Clicked radio button: ${optionText}`);
  } catch (err) {
    console.error(`❌ Could not click radio ${optionText}`, err.message);
    throw err;
  }
}

async function fillSscInput(page, labelText, value) {
  if (!value) return;

  try {
    const input = page.locator(
      `//label[contains(text(),"${labelText}")]/following::input[1]`
    );

    await input.waitFor({ timeout: 20000 });
    await input.scrollIntoViewIfNeeded();
    await input.fill(value.toString());

    console.log(`✅ Filled input ${labelText}`);
  } catch (err) {
    console.error(`❌ Could not fill ${labelText}`, err.message);
    throw err;
  }
}


async function selectSscDropdown(page, labelText, optionText) {
  if (!optionText) return;

  try {
    const dropdown = page.locator(
      `//app-dropdown[contains(@label,"${labelText}")]//div[contains(@class,"value-area")]`
    );

    await dropdown.waitFor({ timeout: 20000 });
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click();

    const option = page.locator(
      `//ul[contains(@class,"list")]//li[contains(text(),"${optionText}")]`
    );

    await option.waitFor({ timeout: 10000 });
    await option.click();

    console.log(`✅ Selected ${optionText} for ${labelText}`);
  } catch (err) {
    console.warn(`⚠️ Could not select ${optionText}`, err.message);
  }
}


async function fillSscDateField(page, labelText, dateValue) {
  if (!dateValue) return;

  try {
    const input = page.locator(
      `//label[contains(text(),"${labelText}")]/following::input[1]`
    );

    await input.waitFor({ timeout: 20000 });
    await input.scrollIntoViewIfNeeded();

    await input.fill(dateValue);

    console.log(`✅ Filled date for ${labelText}`);
  } catch (err) {
    console.error(`❌ Could not fill date ${labelText}`, err.message);
    throw err;
  }
}


async function runSscAutomation(userId) {
  let browser;

  try {
    console.log("🚀 Starting SSC Automation...");

  browser = await chromium.launch({
  headless: false,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-blink-features=AutomationControlled"
  ]
});
    
   const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1366, height: 768 }
});

const page = await context.newPage();

    const data = await fetchUserDataFromDB(userId);
    if (!data?.mergedData) throw new Error("No merged user data found.");

    const userData = data.mergedData;
await page.route("**/*", (route) => {
  const type = route.request().resourceType();

  if (type === "image" || type === "font" || type === "media") {
    route.abort();
  } else {
    route.continue();
  }
});
    
   await page.goto("https://ssc.gov.in/", {
   timeout: 60000,  // 60 seconds
    waitUntil: "commit"
    });
    console.log("✅ Navigated to ssc.gov.in");

    await page.waitForSelector("text=Login or Register", { timeout: 15000 });
    await page.click("text=Login or Register");
    console.log("✅ Clicked 'Login or Register'");

    await page.waitForSelector('input[placeholder="Registration Number"]', {
      timeout: 15000
    });

    console.log("✅ Login modal active");

    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("*")).find(
        (e) => e.textContent.trim() === "Register Now"
      );
      if (el) el.click();
    });

    await page.waitForTimeout(2000);

    const pages = page.context().pages();
    if (pages.length > 1) {
      await pages[pages.length - 1].bringToFront();
    }

    await page.waitForSelector("text=One Time Registration", {
      timeout: 10000
    });

    console.log("✅ 'One Time Registration' detected");

    await page.click("button:has-text('Continue')");

    console.log("✅ Clicked Continue");

    console.log("🧾 Filling SSC Registration Form...");

    await clickSscRadio(page, userData.hasAadhaar ? "Yes" : "No");

    if (userData.hasAadhaar) {
      await fillSscInput(
        page,
        "Enter Your Aadhaar Details",
        userData.aadharNumber
      );

      await fillSscInput(
        page,
        "Verify Aadhaar Details",
        userData.aadharNumber
      );
    }

    await fillSscInput(page, "Candidate Name", userData.candidateName);
    await fillSscInput(page, "Verify Candidate Name", userData.candidateName);

    await clickSscRadio(page, userData.hasChangedName ? "Yes" : "No");

    await selectSscDropdown(page, "Gender", userData.gender);
    await selectSscDropdown(page, "Verify Gender", userData.gender);

    await fillSscDateField(page, "Date Of Birth", userData.dob);
    await fillSscDateField(page, "Verify Date of Birth", userData.dob);

    await fillSscInput(page, "Father's Name", userData.fatherName);
    await fillSscInput(page, "Verify Father's Name", userData.fatherName);

    await fillSscInput(page, "Mother's Name", userData.motherName);
    await fillSscInput(page, "Verify Mother's Name", userData.motherName);

    await selectSscDropdown(
      page,
      "Matriculation (10th class) Education Board",
      userData.educationBoard
    );

    await selectSscDropdown(
      page,
      "Verify Matriculation (10th class) Education Board",
      userData.educationBoard
    );

    await fillSscInput(page, "Roll Number", userData.rollNumber);
    await fillSscInput(page, "Verify Roll Number", userData.rollNumber);

    await selectSscDropdown(page, "Year of Passing", userData.yearOfPassing);

    await selectSscDropdown(
      page,
      "Verify Year of Passing",
      userData.yearOfPassing
    );

    await selectSscDropdown(
      page,
      "Highest Level of Education",
      userData.highestQualification
    );

    await selectSscDropdown(
      page,
      "Verify Highest Level of Education",
      userData.highestQualification
    );

    await fillSscInput(
      page,
      "Candidate's Mobile Number",
      userData.mobileNumber
    );

    await fillSscInput(
      page,
      "Candidate's Email ID",
      userData.emailId
    );

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

    await fetch("https://formuated-pro.onrender.com/api/application/save-filled-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        formType: "SSC OTR",
        formData
      })
    });

    return {
      status: "success",
      message: "SSC form automation completed successfully!"
    };

  } catch (err) {
    console.error("❌ SSC Automation FAILED:", err.message);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


app.post("/start-ssc-automation", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res
        .status(400)
        .json({ status: "error", message: "User ID is required." });

    const result = await runSscAutomation(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: `receipt_${crypto.randomBytes(6).toString("hex")}`,
    };
    const order = await razorpayInstance.orders.create(options);
    if (!order) return res.status(500).send("Error creating Razorpay order.");
    console.log("✅ Order Created:", order);
    res.status(200).json(order);
  } catch (error) {
    console.error("❌ Error in /create-order:", error);
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("✅ Payment Verification Successful!");

      await User.findByIdAndUpdate(userId, {
        isPremium: true,
        premiumActivatedAt: new Date(),
      });

      res.status(200).json({
        status: "success",
        message: "Payment verified & premium activated!",
      });
    } else {
      res
        .status(400)
        .json({ status: "failure", message: "Invalid payment signature." });
    }
  } catch (error) {
    console.error("❌ Error in /verify-payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
