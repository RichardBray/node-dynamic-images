import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
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

const personalisedText = {
  hiking: "New Boots\nJust for You",
  painting: "Explore\nyour creativity",
  cooking: "Explore\nyour taste buds",
  photography: "Explore\nyour eye",
};

function main() {
  return data.map(async (user) => {
    try {
      const generatedImage = await cloudinary.image(`email-${user.interest}`, {
        transformation: [
          { width: 800, height: 500, crop: 'fill', format: 'jpg', radius: 10 },
          {
            overlay: {
              font_family: 'Arial',
              font_size: 50,
              font_weight: 'bold',
              text: personalisedText[user.interest],
            }, color: "#fff", background: "#00000030",
          },
          { flags: "layer_apply", gravity: "north_east", y: 50, x: 115 },
          { overlay: `email-overlay-${user.interest}` },
          { width: 315, height: 250, crop: 'scale' },
          { flags: "layer_apply", gravity: "south_east", y: 80, x: 80, border: "5px_solid_white" },
          {
            overlay: {
              font_family: 'Arial',
              font_size: 30,
              font_weight: 'bold',
              text: `Shop ${user.interest}`.toUpperCase(),
            }, color: "#fff", background: "black",
          },
          { flags: "layer_apply", gravity: "south_east", y: 20, x: 200, border: "5px_solid_black" },
        ]
      });

      const email = await transporter.sendMail({
        from: process.env.NODEMAILER_USER,
        to: process.env.EMAIL_RECIPIENT,
        subject: personalisedText[user.interest],
        html: `<h1>Hello ${user.firstName} we have something you might like</h1> <a href="#">${generatedImage}</a><p>We know you like ${user.interest} so we thought you might like this</p>`,
      });

      console.log("Email response:", email.response);
    } catch (error) {
      console.error(error);
    }
  });

}

await Promise.all(main());
