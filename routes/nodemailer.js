const nodemailer = require('nodemailer');
const {google} = require('googleapis');

const client_id=`476106019248-dhfkudeg5o3bui3gvid3bvk7hqs8fskp.apps.googleusercontent.com`;
const client_secret=`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`;
const refresh_token=`1//04_0WgMYmlXF3CgYIARAAGAQSNwF-L9IrkLBJJy83ViDFW07h3pxsC-IMDbZihBKc45_wbToRfWt1W_4pt8IW7eOpgvslnMBjRLs`;
const redirect_uri=`https://developers.google.com/oauthplayground`;

const oauthclient=new google.auth.OAuth2(client_id,client_secret,redirect_uri);
oauthclient.setCredentials({refresh_token:refresh_token});

async function sendMail(receiver , text){
    try{
        const access_token = await oauthclient.getAccessToken();
        const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user:"sumaiya76172@gmail.com",
            clientId: client_id,
            clientSecret: client_secret,
            refreshToken: refresh_token,
            accessToken: access_token
      }
    })

    const mailOpts = {
      from: "sumaiya76172@gmail.com",
      to: receiver,
      subject: "Nodemailer first project",
      text: "Working on first nodemailer project",
      html: text
    }

    const result = await transport.sendMail(mailOpts);
    return result;
  
    }
    catch(err){
        return err;
    }
}

module.exports = sendMail ; 