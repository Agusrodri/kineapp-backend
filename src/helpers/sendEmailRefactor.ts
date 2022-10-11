import nodeMailer from 'nodemailer'

export default (nuevoLink: string, email: string, subject: string, htmlText: string) => {

    return new Promise<void>((resolve, reject) => {
        try {
            const transporter = nodeMailer.createTransport({
                service: 'gmail',
                auth: {
                    user: '4devteam.utn@gmail.com',
                    pass: 'xoxkkbefzdrwinpy'
                }
            });

            const mailOptions = {
                from: '4devteam.utn@gmail.com',
                to: email,
                subject: subject,
                //html: `<a href=${nuevoLink}>${htmlText}</a>` // html body
                html: `<div class="email-content" style="background-color: #FFF;width: 100%;height: 400px;" align="center"><img src="http://api-kineapp.herokuapp.com/logo-kineapp-nombre.png" alt="" class="logo-kineapp" style="width: 180px;height:200px;"><h1 style="font-size: 24px;color: #5b5b5b;font-weight: 800;margin-top: 20px;">${subject}</h1><a style="margin-top: 20px;font-size: 14px;text-decoration: none;color: #0093b0;" href="${nuevoLink}">${htmlText}</a></div>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });

            resolve()

        } catch (error) {
            console.log(error)
            reject()
        }

    })


}