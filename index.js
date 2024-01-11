import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
import { differenceInDays, parseISO } from 'date-fns';
import data from './data.json' assert { type: 'json' };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

async function main() {
  try {
    const user = getUserById("1a2b3c4d");
    const daysToBirthday = calculateDaysTillBirthday(user);
    const generatedImage = await generateImage(user, daysToBirthday);
    const email = await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: process.env.EMAIL_RECIPIENT,
      subject: `It's almost that time of year ${user.firstName}!!!`,
      text: `Hello ${user.firstName} time to treat yourself to a gift?`,
      html: `<h1>Hello ${user.firstName} time to treat yourself to a gift?</h1> ${generatedImage}`,
    });

    console.log("Email response:", email.response);

  } catch (error) {
    console.log(error);
  }
}

function getUserById(id) {
  return data.find(user => user.uuid === id);
}

function calculateDaysTillBirthday(user) {
  const today = new Date();
  const userDate = parseISO(user.dateOfBirth);
  const userBirthday = new Date(today.getFullYear(), userDate.getMonth(), userDate.getDate());
  const daysToBirthday = differenceInDays(userBirthday, today);

  return daysToBirthday;
}

async function generateImage(user, daysToBirthday) {
  return await cloudinary.image(`email-${user.category}`, {
    transformation: [
      { width: 800, height: 500, crop: 'fill', format: 'jpg' },
      {
        overlay: {
          font_family: 'Arial',
          font_size: 40,
          font_weight: 'bold',
          text: `Only ${daysToBirthday} days till your birthday!`,
        }, color: "#fff"
      }
    ]
  });
}

main();
