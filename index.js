import nodemailer from 'nodemailer';
import data from './data.json' assert { type: 'json' };

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

const personalisedText = {
  hiking: "New Boots\nJust for You",
  painting: "New Brush\nJust for You",
  cooking: "New Pans\nJust for You",
  photography: "New Lense\nJust for You",
};

function main() {
  return data.map(async (user) => {
    try {
      await transporter.sendMail({
        from: process.env.NODEMAILER_USER,
        to: process.env.EMAIL_RECIPIENT,
        subject: personalisedText[user.interest],
        html: `<h1>Hello ${user.firstName} we have something you might like</h1>`,
      });
    } catch (error) {
      console.error(error);
    }
  });
}

await Promise.all(main());
