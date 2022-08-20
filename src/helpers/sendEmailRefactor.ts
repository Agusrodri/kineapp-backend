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
                html: `<a href=${nuevoLink}>${htmlText}</a>` // html body
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