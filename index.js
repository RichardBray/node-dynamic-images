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
  hiking: "Explore your world",
  painting: "Explore your creativity",
  cooking: "Explore your taste buds",
  photography: "Explore your eye",
};

function main() {
  return data.map(async (user) => {
    try {
      const generatedImage = await cloudinary.image(`email-${user.interest}`, {
        transformation: [
          { width: 800, height: 500, crop: 'fill', format: 'jpg' },
          {
            overlay: {
              font_family: 'Arial',
              font_size: 40,
              font_weight: 'bold',
              text: personalisedText[user.interest],
            }, color: "#fff"
          },
          { flags: "layer_apply", gravity: "north_east" },
          { overlay: `email-overlay-${user.interest}` },
          { width: 200, crop: 'scale' },
          { flags: "layer_apply", gravity: "south_east", y: 20, border: "5px_solid_white" },
        ]
      });

      const email = await transporter.sendMail({
        from: process.env.NODEMAILER_USER,
        to: process.env.EMAIL_RECIPIENT,
        subject: personalisedText[user.interest],
        html: `<h1>Hello ${user.firstName} we have something you might like</h1> <p>${generatedImage}</p><p>We know you like ${user.interest} so we thought you might like this</p>`,
      });

      console.log("Email response:", email.response);
    } catch (error) {
      console.error(error);
    }
  });

}

await Promise.all(main());
