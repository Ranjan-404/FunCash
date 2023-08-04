// require("dotenv").config();
const jwt = require("jsonwebtoken");
const File = require("../models/File");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const multer = require("multer");
const shortid = require("shortid");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, "" + shortid.generate() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");

async function handleIndex(req, res) {
  if (req.session.isLoggedIn) {
    let token = req.session.user.token;
    const verifiedUser = jwt.verify(token, process.env['SECRET_KEY'])
    const user = await File.findById(verifiedUser.id);
    if (user) {
      res.render("dashboard", { user });
    } else {
      res.json({ Error: "Unothorized" });
    }
  } else {
    res.render("index");
  }
}

async function handleUpdation(req, res) {
  const user = req.user;
  const { username, email, phone } = req.body;
  if (user) {
    user.username = username;
    user.email = email;
    user.phone = phone;
  }
  await user.save();
  res.render("profile", { user });
}

function template(token) {
  return `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
<p>Please click on the following link, or paste this into your browser to complete the process:</p>
<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
<a style="color: white; padding: 10px 20px; background-color: #4f4fff; border-radius: 3px; text-decoration: none; font-weight: bold;" href="https://funcash.ranjankashyap1.repl.co/reset/${token}">Reset Password</a>
`;
}

async function showLeathorboard(req, res) {
  let data = await File.find();
  if (data) {
    data.sort((a, b) => b.amount - a.amount);
    const users = data.map((item) => ({
      name: item.username,
      price: item.amount,
    }));
    res.render("board", { users });
  } else {
    res.status(404).json({ message: "no user avilable" });
  }
}

function createJWT(user) {
  const accessToken = jwt.sign({ id: user._id }, process.env['SECRET_KEY']);

  return accessToken;
}
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env['USER'],
    pass: process.env['PASS_KEY']
  },
});

async function handleLogin(req, res) {
  const { email, password } = req.body;
  const user = await File.findOne({ email });
  if (!user) {
    return res.status(404).render("index", { message: "User not found" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(404).render("index", { message: "Invalid Credintials" });
  } else {
    const accessToken = createJWT(user);
    const time = 3600000;
    res.cookie("token", accessToken, {
      expires: new Date(Date.now() + time),
      httpOnly: true,
    });
    req.session.isLoggedIn = true;
    req.session.user = { token: accessToken };

    res.render("dashboard", { user });
  }
}

function showProfile(req, res) {
  const user = req.user;
  res.render("profile", { user });
}
function showDashBoard(req, res) {
  const user = req.user;
  res.render("dashboard", { user });
}

async function handlePasswordReset(req, res) {
  var { email } = req.body;
  const user = await File.findOne({ email });
  if (!user) {
    return res.status(404).send({ message: "nullUser" });
  }
  const token = crypto.randomBytes(20).toString("hex");
  const expirationTime = Date.now() + 5 * 60 * 1000;

  await File.updateOne(
    { email },
    { $set: { resetToken: token, resetTokenExpiration: expirationTime } }
  );
  sendEmail(email);
  async function sendEmail(clientEmail) {
    try {
      const mailOptions = {
        from: " Ranjan Kashyap <ranjankashyap404@gmail.com>",
        to: clientEmail,
        subject: "Password Reset",
        html: template(token),
      };
      await transporter.sendMail(mailOptions);
      res.status(200).send({ message: "sent" });
    } catch (error) {
      res.status(409).send({ message: "Something went wrong" });
    }
  }
}

function handleFileUpload(req, res) {
  const user = req.user;
  upload(req, res, (err) => {
    if (err) {
      res.send("error: Ranjan denied !");
    } else {
      if (req.file == undefined) {
        res.send("error");
      } else {
        console.log("ues");
        const url = `${req.headers.origin}/uploads/${req.file.filename}`;
        if (user) {
          user.profile = url;
        }
        user.save();
        res.send(user);
      }
    }
  });
}

async function renderResetPage(req, res) {
  try {
    const { token } = req.params;
    const user = await File.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    const data = { token: token !== "null" ? token : null };

    if (!user) {
      res.json({ Error: "Token Expired" });
    }

    res.render("reset", data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).render("error");
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await File.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.send("Invalid Link");
    }

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).render("error");
  }
}

async function checkReferralCode(req, res) {
  const { code } = req.body;

  const hasReferral = await File.findOne({ code });
  if (hasReferral) {
    res.status(200).send({ message: "valid", user: hasReferral });
  } else {
    if (code.length === 6) {
      res.status(409).send({ message: "Invalid" });
    } else {
      res.status(404).send({ message: "Invalid" });
    }
  }
}

async function signUP(req, res) {
  const { username, email, password, code } = req.body;
  const existingUser = await File.findOne({ email });
  let amount = 0;
  if (code !== null) {
    const hasReferral = await File.findOne({ code });
    if (hasReferral) {
      hasReferral.amount += 500;
      amount += 250;
      await hasReferral.save();
    }
  }
  if (existingUser) {
    return res.status(409).render("signup", { error: true });
  }
  let referral = generateOTP();
  const hashedPassword = await bcrypt.hash(password, 10);
  const data = {
    username: username,
    email: email,
    password: hashedPassword,
    code: referral,
    amount: amount,
  };
  await File.create(data);
  res.status(200).send({ message: "created" });
}

async function delteUser(req, res) {
  const { email } = req.user;
  try {
    const result = await File.deleteOne({ email });
    if (result.deletedCount === 1) {
      res.render("delete");
    } else {
      res.status(404).json({ error: "Data not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting data." });
  }
}

function generateOTP() {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

module.exports = {
  handleIndex,
  handleUpdation,
  showLeathorboard,
  createJWT,
  handleLogin,
  showProfile,
  showDashBoard,
  handlePasswordReset,
  handleFileUpload,
  renderResetPage,
  resetPassword,
  checkReferralCode,
  signUP,
  delteUser,
};
